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

function extractLines(
  content: string,
  fromLine: number | undefined,
  hasDash: boolean,
  toLine: number | undefined,
  preserveTrailingNewline = false,
) {
  const lines = content.split(EOL);
  const start = fromLine || 1;
  let end: number;
  if (!hasDash) {
    end = start;
  } else if (toLine) {
    end = toLine;
  } else if (lines[lines.length - 1] === "" && !preserveTrailingNewline) {
    end = lines.length - 1;
  } else {
    end = lines.length;
  }
  return lines.slice(start - 1, end).join("\n");
}

function parseFileMeta(meta: string): {
  filePath: string;
  fromLine?: number;
  toLine?: number;
} {
  // First, extract just the file path part before any line numbers
  const filePathMatch = meta.match(/file=([^#]+)/);
  if (!filePathMatch) {
    throw new Error(`Unable to parse file path from ${meta}`);
  }
  const filePath = filePathMatch[1];

  // Then extract line numbers if they exist
  const lineMatch = meta.match(/#L(\d+)(?:-L(\d+))?$/);
  const fromLine = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
  const toLine = lineMatch?.[2] ? parseInt(lineMatch[2], 10) : undefined;

  return { filePath, fromLine, toLine };
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

    // First pass: collect all code nodes and set up parent references
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
        const { filePath, fromLine, toLine } = parseFileMeta(fileMeta);
        const hasDash = toLine !== undefined;

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
            fromLine,
            hasDash,
            toLine,
            options.preserveTrailingNewline,
          );

          if (options.removeRedundantIndentations) {
            processedContent = stripIndent(processedContent);
          }

          // Handle MDX-specific formatting
          const mdxParent = getMDXParent(node);
          if (mdxParent) {
            // Preserve original formatting for MDX components
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
        // Enhance error message with file path information
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
