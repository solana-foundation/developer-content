import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkMDX from "remark-mdx";
import { visit } from "unist-util-visit";
import ignore, { type Ignore } from "ignore";
import codeImport from "./src/utils/code-import";
import chokidar from "chokidar";

let debugMode = false;

const debug = (...args: any[]) => {
  if (debugMode) {
    console.log("[DEBUG]", ...args);
  }
};

const hasCodeComponentWithFileMeta = async (
  filePath: string,
): Promise<boolean> => {
  try {
    const content = await fs.readFile(filePath, "utf8");
    let hasMatch = false;

    const tree = unified()
      .use(remarkParse)
      .use(remarkMDX)
      .use(remarkFrontmatter)
      .parse(content);

    visit(tree, "code", node => {
      if (node.meta?.includes("file=")) {
        hasMatch = true;
        return false; // Stop visiting
      }
    });

    return hasMatch;
  } catch (error) {
    debug(`Error checking file ${filePath}:`, error);
    return false;
  }
};

const getIgnore = async (directory: string): Promise<Ignore> => {
  const ig = ignore();

  try {
    const gitignoreContent = await fs.readFile(
      path.join(directory, ".gitignore"),
      "utf8",
    );
    ig.add(gitignoreContent);
    // ignore all dotfiles
    ig.add([".*"]);
    // ignore CONTRIBUTING.md because it mentions the code component example
    ig.add("CONTRIBUTING.md");
  } catch (error) {
    // If .gitignore doesn't exist, just continue without it
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  return ig;
};

const getMarkdownAndMDXFiles = async (directory: string): Promise<string[]> => {
  const ig = await getIgnore(directory);

  const walkDir = async (dir: string): Promise<string[]> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async entry => {
        const res = path.resolve(dir, entry.name);
        const relativePath = path.relative(directory, res);

        if (ig.ignores(relativePath) || entry.name === ".gitignore") {
          debug(`Ignoring file: ${relativePath}`);
          return [];
        }

        if (entry.isDirectory()) {
          return walkDir(res);
        }

        if (
          entry.isFile() &&
          (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))
        ) {
          if (await hasCodeComponentWithFileMeta(res)) {
            debug(`Found file with code component: ${relativePath}`);
            return res;
          } else {
            debug(
              `Skipping file (no code component with file meta): ${relativePath}`,
            );
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
      .use(remarkMDX)
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
      const filePath = (error as NodeJS.ErrnoException).path;
      throw new Error(
        `File not found: ${filePath}\nMake sure the file exists and the path is correct relative to the project root.`,
      );
    }
    throw error;
  }
};

const processFile = async (filePath: string): Promise<void> => {
  try {
    if (!(await hasCodeComponentWithFileMeta(filePath))) {
      debug(`Skipping ${filePath}: No code component with file meta found.`);
      return;
    }

    const originalContent = await fs.readFile(filePath, "utf8");
    const processedContent = await processContent(originalContent, filePath);
    if (originalContent !== processedContent) {
      await fs.writeFile(filePath, processedContent);
      console.log(`Updated: ${filePath}`);
    } else {
      debug(`No changes needed for: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${(error as Error).message}`);
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
  const watcher = chokidar.watch(["**/*.md", "**/*.mdx"], {
    ignored: [
      /(^|[\/\\])\../,
      "**/node_modules/**",
      "**/.git/**",
      ".gitignore",
    ],
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
  debugMode = process.argv.includes("--debug") || process.argv.includes("-d");

  if (debugMode) {
    console.log("Debug mode enabled");
  }

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
    const files = await getMarkdownAndMDXFiles(process.cwd());
    const chunkSize = Math.max(1, Math.ceil(files.length / os.cpus().length));

    console.log(`Processing ${files.length} files...`);
    await processInChunks(files, processFile, chunkSize);
  }

  if (!watchMode) {
    console.log("Sync process completed.");
  }
};

main().catch(console.error);
