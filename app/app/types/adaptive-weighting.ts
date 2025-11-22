/**
 * Adaptive weighting types for scholarship analysis
 * Analyzes scholarship descriptions to determine hidden criteria weights
 */

/**
 * Subcategory weights for "Sustained Depth Over Resume Padding"
 */
export interface SustainedDepthSubWeights {
  "Multi-year commitment": number;
  "Progressive responsibility": number;
  "Consistency of theme": number;
}

/**
 * Subcategory weights for "Values-Driven Decision Making"
 */
export interface ValuesDrivenSubWeights {
  "Why over what": number;
  "Character under pressure": number;
  "Authentic alignment": number;
}

/**
 * Subcategory weights for "Problem-Solving Orientation"
 */
export interface ProblemSolvingSubWeights {
  "Problem identification": number;
  "Solution creation": number;
  "Measurable outcomes": number;
}

/**
 * Subcategory weights for "Entrepreneurial vs. Theoretical Mindset"
 */
export interface EntrepreneurialSubWeights {
  "Commercial/social viability": number;
  "Creation evidence": number;
  "Innovation iteration": number;
}

/**
 * Subcategory weights for "Future Investment Potential"
 */
export interface FutureInvestmentSubWeights {
  "Canadian contribution": number;
  "Scalable impact vision": number;
  "Knowledge translation": number;
}

/**
 * Subcategory weights for "Adversity Plus Agency"
 */
export interface AdversityAgencySubWeights {
  "Service despite struggle": number;
  "Active response": number;
  "Challenge specificity": number;
}

/**
 * Subcategory weights for "Interview Performance"
 */
export interface InterviewPerformanceSubWeights {
  "Multi-stage assessment": number;
  "Values articulation": number;
  "Pressure testing": number;
}

/**
 * Subcategory weights for "Language Mirroring & Framing"
 */
export interface LanguageMirroringSubWeights {
  "Scholarship-specific language": number;
  "Story selection": number;
  "Authentic positioning": number;
}

/**
 * Subcategory weights for "Regional & Nomination Strategy"
 */
export interface RegionalStrategySubWeights {
  "Geographic advantage": number;
  "School nomination": number;
  "Regional narrative": number;
}

/**
 * Subcategory weights for "Academic Threshold Sufficiency"
 */
export interface AcademicThresholdSubWeights {
  "Intellectual curiosity": number;
  "Applied knowledge": number;
  "Meeting minimums": number;
}

/**
 * Complete adaptive weighting output structure
 */
export interface AdaptiveWeightingOutput {
  "Sustained Depth Over Resume Padding": {
    weight: number;
    subweights: SustainedDepthSubWeights;
  };
  "Values-Driven Decision Making": {
    weight: number;
    subweights: ValuesDrivenSubWeights;
  };
  "Problem-Solving Orientation": {
    weight: number;
    subweights: ProblemSolvingSubWeights;
  };
  "Entrepreneurial vs. Theoretical Mindset": {
    weight: number;
    subweights: EntrepreneurialSubWeights;
  };
  "Future Investment Potential": {
    weight: number;
    subweights: FutureInvestmentSubWeights;
  };
  "Adversity Plus Agency": {
    weight: number;
    subweights: AdversityAgencySubWeights;
  };
  "Interview Performance": {
    weight: number;
    subweights: InterviewPerformanceSubWeights;
  };
  "Language Mirroring & Framing": {
    weight: number;
    subweights: LanguageMirroringSubWeights;
  };
  "Regional & Nomination Strategy": {
    weight: number;
    subweights: RegionalStrategySubWeights;
  };
  "Academic Threshold Sufficiency": {
    weight: number;
    subweights: AcademicThresholdSubWeights;
  };
}

/**
 * Input for adaptive weighting analysis
 */
export interface AdaptiveWeightingInput {
  ScholarshipName: string;
  ScholarshipDescription: string;
  EssayPrompt: string;
}

/**
 * API request for adaptive weighting
 */
export interface AdaptiveWeightingRequest {
  ScholarshipName: string;
  ScholarshipDescription: string;
  EssayPrompt: string;
}

/**
 * API response for adaptive weighting
 */
export interface AdaptiveWeightingResponse {
  success: boolean;
  data?: AdaptiveWeightingOutput;
  error?: string;
}

/**
 * Category definitions with their subcategories for reference
 */
export const WEIGHT_CATEGORIES = {
  "Sustained Depth Over Resume Padding": {
    description: "Multi-year commitment: 3+ years in primary activities - highest differentiator",
    subcategories: [
      "Multi-year commitment",
      "Progressive responsibility",
      "Consistency of theme"
    ]
  },
  "Values-Driven Decision Making": {
    description: "Why over what: Motivation for choices equally weighted with character",
    subcategories: [
      "Why over what",
      "Character under pressure",
      "Authentic alignment"
    ]
  },
  "Problem-Solving Orientation": {
    description: "Problem identification: Seeing specific gaps/failures",
    subcategories: [
      "Problem identification",
      "Solution creation",
      "Measurable outcomes"
    ]
  },
  "Entrepreneurial vs. Theoretical Mindset": {
    description: "Commercial/social viability: Real-world application potential",
    subcategories: [
      "Commercial/social viability",
      "Creation evidence",
      "Innovation iteration"
    ]
  },
  "Future Investment Potential": {
    description: "Canadian contribution: Commitment to Canadian society/economy",
    subcategories: [
      "Canadian contribution",
      "Scalable impact vision",
      "Knowledge translation"
    ]
  },
  "Adversity Plus Agency": {
    description: "Service despite struggle: Maintaining humanitarian commitment - dominant",
    subcategories: [
      "Service despite struggle",
      "Active response",
      "Challenge specificity"
    ]
  },
  "Interview Performance": {
    description: "Multi-stage assessment: Character through extended interaction",
    subcategories: [
      "Multi-stage assessment",
      "Values articulation",
      "Pressure testing"
    ]
  },
  "Language Mirroring & Framing": {
    description: "Scholarship-specific language: Using their exact terminology",
    subcategories: [
      "Scholarship-specific language",
      "Story selection",
      "Authentic positioning"
    ]
  },
  "Regional & Nomination Strategy": {
    description: "Geographic advantage: 2.5x advantage in Territories, 2.25x in Atlantic",
    subcategories: [
      "Geographic advantage",
      "School nomination",
      "Regional narrative"
    ]
  },
  "Academic Threshold Sufficiency": {
    description: "Intellectual curiosity: Self-directed learning most important",
    subcategories: [
      "Intellectual curiosity",
      "Applied knowledge",
      "Meeting minimums"
    ]
  }
} as const;
