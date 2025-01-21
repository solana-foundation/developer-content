import fs from "node:fs";
import path from "node:path";
import { EOL } from "node:os";
import { visit } from "unist-util-visit";
import stripIndent from "strip-indent";
import type { Root, Code, Parent } from "mdast";
import type { VFile } from "vfile";

interface CodeImportOptions {
  async?: boolean;
  preserveTrailingNewline?: boolean;
  removeRedundantIndentations?: boolean;
  rootDir?: string;
  allowImportingFromOutside?: boolean;
}

interface LineRange {
  fromLine: number;
  toLine: number;
}

function validateLineRange(range: LineRange): void {
  if (range.fromLine > range.toLine) {
    throw new Error(
      `Invalid line range: starting line (L${range.fromLine}) cannot be greater than ending line (L${range.toLine})`,
    );
  }
  if (range.fromLine < 1) {
    throw new Error(`Invalid line number: L${range.fromLine} (must be >= 1)`);
  }
}

function extractLines(
  content: string,
  ranges: LineRange[] | null,
  preserveTrailingNewline = false,
): string {
  const lines = content.split(EOL);

  // If no ranges specified, return the entire file
  if (!ranges) {
    if (!preserveTrailingNewline && lines[lines.length - 1] === "") {
      lines.pop();
    }
    return lines.join("\n");
  }

  // For specified ranges, collect the lines
  const resultLines: string[] = [];
  const seenLines = new Set<number>();

  ranges.forEach(range => {
    const end = Math.min(range.toLine, lines.length);
    for (let i = range.fromLine; i <= end; i++) {
      const lineIndex = i - 1;
      if (!seenLines.has(lineIndex)) {
        seenLines.add(lineIndex);
        resultLines.push(lines[lineIndex]);
      }
    }
  });

  // Handle trailing newline
  if (!preserveTrailingNewline && resultLines[resultLines.length - 1] === "") {
    resultLines.pop();
  }

  return resultLines.join("\n");
}

function parseLineRanges(lineSpec: string): LineRange[] {
  // Split by comma for multiple ranges
  const rangeStrings = lineSpec.split(",").filter(s => s.trim());
  const ranges: LineRange[] = [];

  for (const range of rangeStrings) {
    const match = range.match(/L(\d+)(?:-L(\d+))?/);
    if (!match) {
      throw new Error(`Invalid line range format: ${range}`);
    }

    const fromLine = parseInt(match[1], 10);
    const toLine = match[2] ? parseInt(match[2], 10) : fromLine;

    const lineRange = { fromLine, toLine };
    validateLineRange(lineRange);
    ranges.push(lineRange);
  }

  return ranges;
}

function parseFileMeta(meta: string): {
  filePath: string;
  ranges: LineRange[] | null;
} {
  // Extract file path (everything before the first #)
  const [filePathPart, lineRangesPart] = meta.split("#");
  const filePath = filePathPart.replace(/^file=/, "");

  if (!filePath) {
    throw new Error("File path is required");
  }

  // If no line ranges specified, return null for ranges
  if (!lineRangesPart) {
    return {
      filePath,
      ranges: null,
    };
  }

  const ranges = parseLineRanges(lineRangesPart);
  return { filePath, ranges };
}

function getMDXParent(node: any): any {
  let current = node;
  while (current.parent) {
    if (current.type === "mdxJsxFlowElement") {
      return current;
    }
    current = current.parent;
  }
  return null;
}

function codeImport(options: CodeImportOptions = {}) {
  const rootDir = options.rootDir || process.cwd();

  if (!path.isAbsolute(rootDir)) {
    throw new Error(`"rootDir" has to be an absolute path`);
  }

  return function transformer(tree: Root, file: VFile) {
    const codes: [Code, number | null, Parent][] = [];
    const promises: Promise<void>[] = [];

    visit(tree, "code", (node, index, parent) => {
      (node as any).parent = parent;
      codes.push([node as Code, index as null | number, parent as Parent]);
    });

    for (const [node] of codes) {
      const fileMeta = (node.meta || "")
        .split(/(?<!\\) /g)
        .find(meta => meta.startsWith("file="));

      if (!fileMeta) {
        continue;
      }

      try {
        const { filePath, ranges } = parseFileMeta(fileMeta);

        // Ensure the file path starts with a '/'
        if (!filePath.startsWith("/")) {
          throw new Error(`File path must start with '/': ${filePath}`);
        }

        // Remove the leading '/' and resolve the path relative to rootDir
        const normalizedFilePath = path.join(rootDir, filePath.slice(1));
        const fileAbsPath = path.resolve(normalizedFilePath);

        if (!options.allowImportingFromOutside) {
          const relativePathFromRootDir = path.relative(rootDir, fileAbsPath);
          if (
            relativePathFromRootDir.startsWith(`..${path.sep}`) ||
            path.isAbsolute(relativePathFromRootDir)
          ) {
            throw new Error(
              `Attempted to import code from "${fileAbsPath}", which is outside from the rootDir "${rootDir}"`,
            );
          }
        }

        const processFileContent = (fileContent: string) => {
          let processedContent = extractLines(
            fileContent,
            ranges,
            options.preserveTrailingNewline,
          );

          if (options.removeRedundantIndentations) {
            processedContent = stripIndent(processedContent);
          }

          // Handle MDX-specific formatting
          const mdxParent = getMDXParent(node);
          if (mdxParent) {
            node.lang = node.lang || "";
            node.meta = node.meta || "";
          }

          node.value = processedContent;
        };

        if (options.async) {
          promises.push(
            new Promise<void>((resolve, reject) => {
              fs.readFile(fileAbsPath, "utf8", (err, fileContent) => {
                if (err) {
                  reject(
                    new Error(
                      `Error reading file ${fileAbsPath}: ${err.message}`,
                    ),
                  );
                  return;
                }

                try {
                  processFileContent(fileContent);
                  resolve();
                } catch (error) {
                  reject(error);
                }
              });
            }),
          );
        } else {
          const fileContent = fs.readFileSync(fileAbsPath, "utf8");
          processFileContent(fileContent);
        }
      } catch (error) {
        const enhancedError = new Error(
          `Error processing file import: ${(error as Error).message}`,
        );
        (enhancedError as any).originalError = error;
        throw enhancedError;
      }
    }

    if (promises.length) {
      return Promise.all(promises);
    }
  };
}

export { codeImport };
export default codeImport;
