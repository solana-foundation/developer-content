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

      // if (!file.dirname) {
      //   throw new Error('"file" should be an instance of VFile');
      // }

      // regex to get group of code from line number to line number
      const res =
        /^file=(?<path>.+?)(?:(?:#(?:L(?<from>\d+)(?<dash>-)?)?)(?:L(?<to>\d+))?)?$/.exec(
          fileMeta,
        );
      if (!res || !res.groups || !res.groups.path) {
        throw new Error(`Unable to parse file path ${fileMeta}`);
      }
      const filePath = res.groups.path;
      const fromLine = res.groups.from
        ? Number.parseInt(res.groups.from, 10)
        : undefined;
      const hasDash = !!res.groups.dash || fromLine === undefined;
      const toLine = res.groups.to
        ? Number.parseInt(res.groups.to, 10)
        : undefined;

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

      if (options.async) {
        promises.push(
          new Promise<void>((resolve, reject) => {
            fs.readFile(fileAbsPath, "utf8", (err, fileContent) => {
              if (err) {
                reject(err);
                return;
              }

              node.value = extractLines(
                fileContent,
                fromLine,
                hasDash,
                toLine,
                options.preserveTrailingNewline,
              );
              if (options.removeRedundantIndentations) {
                node.value = stripIndent(node.value);
              }
              resolve();
            });
          }),
        );
      } else {
        const fileContent = fs.readFileSync(fileAbsPath, "utf8");

        node.value = extractLines(
          fileContent,
          fromLine,
          hasDash,
          toLine,
          options.preserveTrailingNewline,
        );
        if (options.removeRedundantIndentations) {
          node.value = stripIndent(node.value);
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
