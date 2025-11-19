/**
 * LLM-powered scholarship information extractor
 * Uses Anthropic Claude to extract structured data from scholarship descriptions
 */

import Anthropic from "@anthropic-ai/sdk";
import { ScholarshipExtraction } from "../types/scholarship-extraction";

/**
 * Initialize Anthropic client
 */
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Extract scholarship information using LLM
 * @param content - Raw scholarship description text
 * @returns Structured scholarship data
 */
export async function extractScholarshipInfo(
  content: string
): Promise<ScholarshipExtraction> {
  const prompt = buildExtractionPrompt(content);

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract JSON from response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON response
    const extracted = parseExtractionResponse(responseText);

    return extracted;
  } catch (error) {
    console.error("Extraction failed:", error);
    throw new Error(`Failed to extract scholarship information: ${(error as Error).message}`);
  }
}

/**
 * Build the LLM prompt for extraction
 */
function buildExtractionPrompt(content: string): string {
  return `You are a scholarship information extraction system. Extract the following fields from the user's input and return ONLY valid JSON.

USER INPUT:
${content}

EXTRACTION TASK:
The user will provide information about a scholarship they are applying to and an essay prompt they are answering. Extract the following three fields:

1. **ScholarshipName** (string): The name of the scholarship. If not found, use "Missing".

2. **ScholarshipDescription** (string): Comprehensive information about the scholarship including:
   - Monetary amount of the scholarship
   - Eligibility criteria
   - Due date/deadline
   - Expected qualities and achievements of the applicant
   - Any other relevant details about the scholarship
   If not found, use "Missing".

3. **EssayPrompt** (string): The essay prompt/question that the applicant needs to answer. If not found, use "Missing".

IMPORTANT RULES:
- Return ONLY valid JSON, no other text
- Use "Missing" for any field that cannot be determined
- Keep all information in the ScholarshipDescription as a single comprehensive string
- Extract the essay prompt exactly as provided

RESPONSE FORMAT (JSON only):
{
  "ScholarshipName": "Name of the Scholarship",
  "ScholarshipDescription": "This scholarship offers $5000 to students enrolled in STEM programs with a GPA of 3.5 or higher. Deadline is March 15, 2025. Applicants should demonstrate innovation and technical achievement.",
  "EssayPrompt": "Describe a time when you demonstrated innovation in solving a technical problem."
}`;
}

/**
 * Parse and validate the LLM response
 */
function parseExtractionResponse(response: string): ScholarshipExtraction {
  try {
    // Extract JSON from response (in case LLM adds extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and normalize the response
    const extraction: ScholarshipExtraction = {
      ScholarshipName: parsed.ScholarshipName || "Missing",
      ScholarshipDescription: parsed.ScholarshipDescription || "Missing",
      EssayPrompt: parsed.EssayPrompt || "Missing",
    };

    return extraction;
  } catch (error) {
    console.error("Failed to parse LLM response:", response);
    throw new Error("Invalid response format from LLM");
  }
}

