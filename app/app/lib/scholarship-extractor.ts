/**
 * LLM-powered scholarship information extractor
 * Uses Anthropic Claude to extract structured data from scholarship descriptions
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  ScholarshipExtraction,
  SCHOLARSHIP_KEYWORDS,
} from "../types/scholarship-extraction";

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
  return `You are a scholarship information extraction system. Extract the following fields from the scholarship description and return ONLY valid JSON.

SCHOLARSHIP DESCRIPTION:
${content}

EXTRACTION TASK:
Extract the following fields. If a field cannot be found, use "Missing" as the value.

1. **title** (string): The name of the scholarship
2. **criteria** (string): Match to ONE of these scholarship types based on keywords:
   - "innovation_tech" - Keywords: ${SCHOLARSHIP_KEYWORDS.innovation_tech.join(", ")}
   - "merit_academic" - Keywords: ${SCHOLARSHIP_KEYWORDS.merit_academic.join(", ")}
   - "community_service" - Keywords: ${SCHOLARSHIP_KEYWORDS.community_service.join(", ")}
   - "leadership_entrepreneurial" - Keywords: ${SCHOLARSHIP_KEYWORDS.leadership_entrepreneurial.join(", ")}

   Choose the type that BEST matches the scholarship's focus. If none match well, use "Missing".

3. **amount** (string): The monetary value with $ sign (e.g., "$5000", "$10,000"). If not found, use "Missing".

4. **deadline** (string): The application deadline in DD-MM-YYYY format (e.g., "15-03-2025"). If not found, use "Missing".

5. **eligibility** (string array): List of applicant requirements as an array. If not found, use ["Missing"].

IMPORTANT RULES:
- Return ONLY valid JSON, no other text
- For dates, convert any format to DD-MM-YYYY
- For amounts, always include $ sign
- For eligibility, return an array of strings
- Use "Missing" for any field that cannot be determined

RESPONSE FORMAT (JSON only):
{
  "title": "scholarship name here",
  "criteria": "innovation_tech",
  "amount": "$5000",
  "deadline": "15-03-2025",
  "eligibility": ["Must be enrolled in STEM program", "GPA 3.5 or higher"]
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
      title: parsed.title || "Missing",
      criteria: validateCriteria(parsed.criteria),
      amount: parsed.amount || "Missing",
      deadline: parsed.deadline || "Missing",
      eligibility: Array.isArray(parsed.eligibility)
        ? parsed.eligibility
        : ["Missing"],
    };

    return extraction;
  } catch (error) {
    console.error("Failed to parse LLM response:", response);
    throw new Error("Invalid response format from LLM");
  }
}

/**
 * Validate criteria field
 */
function validateCriteria(
  criteria: string
): ScholarshipExtraction["criteria"] {
  const validTypes = [
    "innovation_tech",
    "merit_academic",
    "community_service",
    "leadership_entrepreneurial",
    "Missing",
  ];

  if (validTypes.includes(criteria)) {
    return criteria as ScholarshipExtraction["criteria"];
  }

  return "Missing";
}
