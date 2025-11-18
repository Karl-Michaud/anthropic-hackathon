/**
 * API Route: Extract Scholarship Information
 * POST /api/extract-scholarship
 *
 * Accepts scholarship descriptions in TXT, JSON, or PDF format
 * Returns structured scholarship data
 */

import { NextRequest, NextResponse } from "next/server";
import { parseFileContent, isValidFileType } from "../../lib/file-parser";
import { extractScholarshipInfo } from "../../lib/scholarship-extractor";
import {
  ScholarshipExtractionResponse,
  SupportedFileType,
} from "../../types/scholarship-extraction";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { content, fileType } = body;

    // Validate inputs
    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: content",
        } as ScholarshipExtractionResponse,
        { status: 400 }
      );
    }

    if (!fileType || !isValidFileType(fileType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing fileType. Must be: txt, json, or pdf",
        } as ScholarshipExtractionResponse,
        { status: 400 }
      );
    }

    // Parse file content
    const parsedContent = await parseFileContent(
      content,
      fileType as SupportedFileType
    );

    if (!parsedContent || parsedContent.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "File content is empty or could not be parsed",
        } as ScholarshipExtractionResponse,
        { status: 400 }
      );
    }

    // Extract scholarship information using LLM
    const extractedData = await extractScholarshipInfo(parsedContent);

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: extractedData,
      } as ScholarshipExtractionResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Scholarship extraction error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      } as ScholarshipExtractionResponse,
      { status: 500 }
    );
  }
}

// Optional: Add OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
