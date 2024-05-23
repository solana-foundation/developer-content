import { RawDocumentData } from "contentlayer/core";
import { readdirSync, statSync } from "fs";
import { extname, join, resolve } from "path";

/**
 * Upper case the first character of a string
 */
export function ucFirst(label: string) {
  return label.charAt(0).toLocaleUpperCase() + label.slice(1);
}

/**
 * Build a list of all the content files within a given directory
 */
export function getAllContentFiles(
  dir: string,
  recursive: boolean = true,
  // todo: support a regex
  extension: string = ".md",
  removeExtensions: boolean = false,
): string[] {
  let files: string[] = [];

  readdirSync(dir).forEach(file => {
    const filePath = join(dir, file);
    const stats = statSync(filePath);

    if (recursive && stats.isDirectory()) {
      files = files.concat(getAllContentFiles(filePath));
    } else if (stats.isFile() && extname(file) === extension) {
      files.push(
        removeExtensions
          ? filePath.substring(0, filePath.lastIndexOf(extension))
          : filePath,
      );
    }
  });

  return files;
}

/**
 * Ensure the provided `author` slug exists as a file in the system
 */
export function throwIfAuthorDoesNotExist(
  author: string = "",
  type: "Author" | "Organization",
) {
  try {
    const authorPath = join(resolve(), "content/authors", `${author}.yml`);
    const stat = statSync(authorPath);
    if (!stat.isFile()) throw "Not found";
  } catch (err) {
    throw `${type} not found: ${author}`;
  }
}

/**
 * Compute a standard slug from a given document's "raw" fields
 */
export function computeSlugFromRawDocumentData(raw: RawDocumentData) {
  if (raw.sourceFileName == "metadata.yml") {
    return raw.sourceFileDir.match(/.*\/(.*)/)![1];
  }

  return raw.sourceFileName.split(".")[0];
}
