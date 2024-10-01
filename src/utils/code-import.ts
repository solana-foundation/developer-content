// remark-code-import
// code-import.ts
// https://github.com/kevin940726/remark-code-import
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
  from: number;
  to: number;
}

function parseLineRanges(rangeString: string): LineRange[] {
  const rangeRegex = /#L(\d+)(?:-L?(\d+))?/g;
  const ranges: LineRange[] = [];
  let match;

  while ((match = rangeRegex.exec(rangeString)) !== null) {
    const [, from, to] = match;
    const fromLine = parseInt(from, 10);
    const toLine = to ? parseInt(to, 10) : fromLine;

    if (fromLine === 0 || toLine === 0) {
      throw new Error(
        `Invalid line number: Line numbers must be positive integers`,
      );
    }

    if (fromLine > toLine) {
      throw new Error(
        `Invalid range: L${fromLine}-L${toLine}. 'from' should be less than or equal to 'to'`,
      );
    }

    ranges.push({ from: fromLine, to: toLine });
  }

  // Sort ranges and check for overlaps
  ranges.sort((a, b) => a.from - b.from);
  for (let i = 1; i < ranges.length; i++) {
    if (ranges[i].from <= ranges[i - 1].to) {
      throw new Error(`Overlapping or out-of-order ranges are not allowed`);
    }
  }

  return ranges;
}

function extractLines(
  content: string,
  ranges: LineRange[],
  preserveTrailingNewline = false,
): string {
  const lines = content.split(EOL);
  let result: string[] = [];

  for (const range of ranges) {
    if (range.to > lines.length) {
      throw new Error(
        `Line range exceeds file length of ${lines.length} lines`,
      );
    }
    result = result.concat(lines.slice(range.from - 1, range.to));
  }

  let finalResult = result.join("\n");
  if (
    preserveTrailingNewline &&
    content.endsWith("\n") &&
    !finalResult.endsWith("\n")
  ) {
    finalResult += "\n";
  }

  return finalResult;
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
      codes.push([node as Code, index as null | number, parent as Parent]);
    });

    for (const [node] of codes) {
      const fileMeta = (node.meta || "")
        .split(/(?<!\\) /g)
        .find(meta => meta.startsWith("file="));

      if (!fileMeta) {
        continue;
      }

      const res = /^file=(["'])?(\/.+?)\1?(#.+)?$/.exec(fileMeta);

      if (!res) {
        throw new Error(
          `Unable to parse file path ${fileMeta}. File path must start with a forward slash (/)`,
        );
      }

      const [, , filePath, rangeString = ""] = res;

      // Resolve the path relative to rootDir
      const normalizedFilePath = path.join(rootDir, filePath.slice(1));
      const fileAbsPath = path.resolve(normalizedFilePath);

      // Check if the path is a directory
      if (fs.statSync(fileAbsPath).isDirectory()) {
        throw new Error(
          `Error processing ${fileAbsPath}: Path is a directory, not a file`,
        );
      }

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

      const ranges = rangeString
        ? parseLineRanges(rangeString)
        : [{ from: 1, to: Infinity }];

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
                node.value = extractLines(
                  fileContent,
                  ranges,
                  options.preserveTrailingNewline,
                );
                if (options.removeRedundantIndentations) {
                  node.value = stripIndent(node.value);
                }
                resolve();
              } catch (error) {
                reject(error);
              }
            });
          }),
        );
      } else {
        try {
          const fileContent = fs.readFileSync(fileAbsPath, "utf8");
          node.value = extractLines(
            fileContent,
            ranges,
            options.preserveTrailingNewline,
          );
          if (options.removeRedundantIndentations) {
            node.value = stripIndent(node.value);
          }
        } catch (error) {
          throw new Error(
            `Error processing ${fileAbsPath}: ${(error as Error).message}`,
          );
        }
      }
    }

    if (promises.length) {
      return Promise.all(promises);
    }
  };
}

export { codeImport };
export default codeImport;
