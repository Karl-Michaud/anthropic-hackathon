/**
 * File parsing utilities for scholarship extraction
 * Supports TXT, JSON, and PDF formats
 */

import { SupportedFileType } from "../types/scholarship-extraction";

/**
 * Parse file content based on file type
 * @param content - File content (base64 for PDF, string for TXT/JSON)
 * @param fileType - Type of file (txt, json, pdf)
 * @returns Parsed text content
 */
export async function parseFileContent(
  content: string,
  fileType: SupportedFileType
): Promise<string> {
  switch (fileType) {
    case "txt":
      return parseTxtContent(content);

    case "json":
      return parseJsonContent(content);

    case "pdf":
      return await parsePdfContent(content);

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Parse plain text content
 */
function parseTxtContent(content: string): string {
  return content.trim();
}

/**
 * Parse JSON content
 * Extracts relevant scholarship information from JSON structure
 */
function parseJsonContent(content: string): string {
  try {
    const json = JSON.parse(content);

    // If JSON is already structured scholarship data, stringify it nicely
    if (typeof json === "object" && json !== null) {
      // Convert JSON object to readable text format
      return JSON.stringify(json, null, 2);
    }

    return content;
  } catch (error) {
    throw new Error("Invalid JSON format");
  }
}

/**
 * Parse PDF content
 * Note: Requires 'pdf-parse' package to be installed
 * @param base64Content - PDF file content in base64 format
 */
async function parsePdfContent(base64Content: string): Promise<string> {
  try {
    // Dynamically import pdf-parse (only when needed)
    const pdfParse = await import("pdf-parse/lib/pdf-parse");

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Content, "base64");

    // Parse PDF
    const data = await pdfParse.default(buffer);

    return data.text.trim();
  } catch (error) {
    // If pdf-parse is not installed, provide helpful error
    if ((error as Error).message.includes("Cannot find module")) {
      throw new Error(
        "PDF parsing requires 'pdf-parse' package. Install with: npm install pdf-parse"
      );
    }
    throw new Error(`Failed to parse PDF: ${(error as Error).message}`);
  }
}

/**
 * Validate file type
 */
export function isValidFileType(fileType: string): fileType is SupportedFileType {
  return ["txt", "json", "pdf"].includes(fileType.toLowerCase());
}

/**
 * Extract file type from filename
 */
export function getFileType(filename: string): SupportedFileType | null {
  const extension = filename.split(".").pop()?.toLowerCase();

  if (extension && isValidFileType(extension)) {
    return extension;
  }

  return null;
}
