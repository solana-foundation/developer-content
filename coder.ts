import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkFrontmatter from "remark-frontmatter";
import { visit } from "unist-util-visit";
import ignore, { type Ignore } from "ignore";
import codeImport from "./src/utils/code-import";
import chokidar from "chokidar";

const hasCodeComponentWithFileMeta = async (
  filePath: string,
): Promise<boolean> => {
  const content = await fs.readFile(filePath, "utf8");
  let hasMatch = false;

  const tree = unified().use(remarkParse).use(remarkFrontmatter).parse(content);

  visit(tree, "code", node => {
    if (node.meta?.includes("file=")) {
      hasMatch = true;
      return false; // Stop visiting
    }
  });

  return hasMatch;
};

const getIgnore = async (directory: string): Promise<Ignore> => {
  const ig = ignore();

  try {
    const gitignoreContent = await fs.readFile(
      path.join(directory, ".gitignore"),
      "utf8",
    );
    ig.add(gitignoreContent);
  } catch (error) {
    // If .gitignore doesn't exist, just continue without it
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  return ig;
};

const getMarkdownFiles = async (directory: string): Promise<string[]> => {
  const ig = await getIgnore(directory);

  const walkDir = async (dir: string): Promise<string[]> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async entry => {
        const res = path.resolve(dir, entry.name);
        const relativePath = path.relative(directory, res);

        if (ig.ignores(relativePath)) {
          return [];
        }

        if (entry.isDirectory()) {
          return walkDir(res);
        }

        if (entry.isFile() && entry.name.endsWith(".md")) {
          if (await hasCodeComponentWithFileMeta(res)) {
            return res;
          }
        }

        return [];
      }),
    );
    return files.flat();
  };

  return walkDir(directory);
};

const processContent = async (
  content: string,
  filePath: string,
): Promise<string> => {
  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkFrontmatter)
      // @ts-expect-error
      .use(codeImport, {
        preserveTrailingNewline: true,
        removeRedundantIndentations: true,
        rootDir: process.cwd(),
      })
      .use(remarkStringify, {
        bullet: "-",
        emphasis: "*",
        fences: true,
        listItemIndent: "one",
        rule: "-",
        ruleSpaces: false,
        strong: "*",
        tightDefinitions: true,
      })
      .process(content);
    return String(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(
        `File not found: ${(error as NodeJS.ErrnoException).path}`,
      );
    }
    throw error;
  }
};

const processFile = async (filePath: string): Promise<void> => {
  try {
    if (!(await hasCodeComponentWithFileMeta(filePath))) {
      console.log(
        `Skipping ${filePath}:\n No code component with file meta found.`,
      );
      return;
    }

    const originalContent = await fs.readFile(filePath, "utf8");
    const processedContent = await processContent(originalContent, filePath);
    if (originalContent !== processedContent) {
      await fs.writeFile(filePath, processedContent);
      console.log(`Updated:\n ${filePath}`);
    } else {
      console.log(`No changes needed for:\n ${filePath}`);
    }
  } catch (error) {
    console.error(
      `Error processing ${filePath}:\n ${(error as Error).message}`,
    );
  }
};

const processInChunks = async <T>(
  items: T[],
  processItem: (item: T) => Promise<void>,
  chunkSize: number,
): Promise<void> => {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await Promise.all(chunk.map(processItem));
  }
};

const watchFiles = async (directory: string): Promise<void> => {
  const watcher = chokidar.watch("**/*.md", {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    cwd: directory,
  });

  console.log("Watch mode started. Waiting for file changes...");

  watcher
    .on("add", filePath => processFile(path.join(directory, filePath)))
    .on("change", filePath => processFile(path.join(directory, filePath)))
    .on("unlink", filePath => console.log(`File ${filePath} has been removed`));
};

const main = async (): Promise<void> => {
  const filePath = process.argv[2];
  const watchMode =
    process.argv.includes("--watch") || process.argv.includes("-w");

  if (filePath && !watchMode) {
    // Process single file
    const absolutePath = path.resolve(process.cwd(), filePath);
    console.log(`Processing single file: ${absolutePath}`);
    await processFile(absolutePath);
  } else if (watchMode) {
    // Watch mode
    await watchFiles(process.cwd());
  } else {
    // Process all files
    const files = await getMarkdownFiles(process.cwd());
    const chunkSize = Math.max(1, Math.ceil(files.length / os.cpus().length));

    console.log(`Processing ${files.length} files...`);
    await processInChunks(files, processFile, chunkSize);
  }

  if (!watchMode) {
    console.log("Sync process completed.");
  }
};

main().catch(console.error);
