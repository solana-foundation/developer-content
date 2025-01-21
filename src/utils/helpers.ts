import { RawDocumentData } from "contentlayer2/core";
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
  removeExtensions: boolean = false
): string[] {
  let files: string[] = [];

  readdirSync(dir).forEach((file) => {
    const filePath = join(dir, file);
    const stats = statSync(filePath);

    if (recursive && stats.isDirectory()) {
      files = files.concat(getAllContentFiles(filePath));
    } else if (stats.isFile() && extname(file) === extension) {
      files.push(
        removeExtensions
          ? filePath.substring(0, filePath.lastIndexOf(extension))
          : filePath
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
  type: "Author" | "Organization"
) {
  try {
    const filePath = join(resolve(), "content/authors", `${author}.yml`);
    const stat = statSync(filePath);
    if (!stat.isFile()) throw "Not found";
  } catch (err) {
    throw `${type} not found: ${author}`;
  }
}

/**
 * Ensure the provided `image` exists as a file in the system
 and return is url route
 */
export function validatedImagePath(image: string, type: "authors") {
  try {
    const filePath = join(resolve(), "public/assets", type, image);
    const stat = statSync(filePath);
    if (!stat.isFile()) throw "Not found";
    return `/assets/${type}/${image}`;
  } catch (err) {
    throw `Image not found: ${image}`;
  }

  return "";
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
