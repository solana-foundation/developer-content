/**
 * Generate a NavItem listing file
 * Document
 */

import fs from "fs";
import path from "path";
import { generateNavItemListing } from "./helpers";

/**
 * the base local directory to search for document records
 */
const BASE_DIR = path.join(__dirname, "../docs/");

/**
 * the final output file to save the generated file to (within the local directory)
 */
const OUTPUT_FILE = path.join(__dirname, "../docs/nav.json");

// define supported file extensions to crawl for
const ALLOWED_FILE_EXTENSIONS = ["md"];

// crawl the BASE_DIR for files
const docsNav = generateNavItemListing({
  BASE_DIR,
  searchPath: BASE_DIR,
  allowedExtensions: ALLOWED_FILE_EXTENSIONS,
});

console.log("Generated navigation listing:", docsNav);

// finally, write to the output file
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(docsNav), { encoding: "utf-8" });
