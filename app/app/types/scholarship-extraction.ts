/**
 * Scholarship extraction types
 * Based on FRD Section 2.3 formula keywords
 */

/**
 * Valid scholarship criteria types from FRD formulas
 */
export type ScholarshipCriteria =
  | "innovation_tech"
  | "merit_academic"
  | "community_service"
  | "leadership_entrepreneurial"
  | "Missing";

/**
 * Extracted scholarship information
 */
export interface ScholarshipExtraction {
  title: string;              // Name of the scholarship
  criteria: ScholarshipCriteria;  // Best matching formula type
  amount: string;             // Monetary amount with $ (e.g., "$5000")
  deadline: string;           // Format: DD-MM-YYYY
  eligibility: string[];      // Array of applicant requirements
}

/**
 * Input file types supported
 */
export type SupportedFileType = "txt" | "json" | "pdf";

/**
 * API request for scholarship extraction
 */
export interface ScholarshipExtractionRequest {
  content: string;            // File content as string
  fileType: SupportedFileType;
}

/**
 * API response for scholarship extraction
 */
export interface ScholarshipExtractionResponse {
  success: boolean;
  data?: ScholarshipExtraction;
  error?: string;
}

/**
 * Keywords for each scholarship type (from FRD Section 2.3)
 */
export const SCHOLARSHIP_KEYWORDS = {
  innovation_tech: [
    "innovation", "creative", "iterate", "experiment", "technical", "build",
    "learning from failure", "hands-on projects", "real-world impact",
    "risk-taking", "creativity", "problem-solving"
  ],
  merit_academic: [
    "academic", "excellence", "achievement", "GPA", "merit", "honors",
    "academic performance", "scholastic achievement", "high standards",
    "dedication", "discipline", "intellectual curiosity"
  ],
  community_service: [
    "community", "service", "volunteer", "impact", "giving back", "help others",
    "community impact", "service to others", "making a difference",
    "compassion", "empathy", "social responsibility"
  ],
  leadership_entrepreneurial: [
    "leadership", "entrepreneurial", "initiative", "founded", "started", "organized",
    "took initiative", "led a team", "created from scratch",
    "self-starter", "vision", "execution"
  ]
} as const;
