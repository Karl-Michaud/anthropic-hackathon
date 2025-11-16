# Functional Requirements Document
## Dynamic Essay Optimizer - Formula-Guided Approach

**Version:** 2.0  
**Date:** November 15, 2025  
**Project:** Agentiiv Hackathon - Adaptive Scholarship Matching + AI Drafting  
**Scope:** Dynamic Essay Optimizer with Preset Formulas & Dynamic Prompting

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Preset Scholarship Formulas](#preset-scholarship-formulas)
3. [Core Data Models](#core-data-models)
4. [Dynamic Data Collection Flow](#dynamic-data-collection-flow)
5. [LLM Interaction Points](#llm-interaction-points)
6. [API Contracts](#api-contracts)
7. [Example Workflows](#example-workflows)

---

## 1. System Overview

### Core Concept
Instead of collecting all student information upfront, the AI:
1. Analyzes scholarship to identify **hidden criteria** and match to a **preset formula**
2. Determines **exactly what information is needed** for that scholarship type
3. **Dynamically prompts the user** to fill in only the relevant information
4. Generates a **single, optimized essay** based on the targeted data collected

### Main Idea
**Preset Scholarship Formulas** + **Hidden Criteria Detection** + **Dynamic Questioning** = Targeted Essay Generation

### System Flow
```
Scholarship Input
    ↓
AI Analysis: Detect Hidden Criteria + Match to Formula
    ↓
Determine Required Information Based on Formula
    ↓
Dynamic Prompting: Ask User for Specific Missing Info
    ↓
Generate Optimized Essay Using Formula + Collected Data
```

---

## 2. Preset Scholarship Formulas

### 2.1 Formula Concept

Each scholarship type has a **preset formula** that defines:
- **Weight Profile**: What to emphasize (technical 40%, innovation 30%, etc.)
- **Hidden Criteria**: Signals in description that aren't explicitly stated
- **Required Information**: Specific data points needed from the user
- **Essay Structure Template**: How to organize the narrative
- **Success Patterns**: What winning essays in this category look like

### 2.2 Scholarship Type Registry

**Data Structure:**
```typescript
interface ScholarshipFormula {
  formula_id: string;               // "innovation_tech_formula"
  formula_name: string;             // "Innovation-Focused Technical Scholarship"
  
  // Detection Criteria (how to identify this type)
  detection_signals: {
    keywords: string[];             // ["innovation", "creative", "iterate", "experiment"]
    phrases: string[];              // ["learning from failure", "hands-on projects"]
    values_indicators: string[];    // ["risk-taking", "impact", "problem-solving"]
  };
  
  // Weight Profile
  weights: {
    technical_achievement: number;  // 35
    leadership: number;             // 10
    community_service: number;      // 5
    innovation: number;             // 40
    personal_growth: number;        // 10
    academic_excellence: number;    // 0
    entrepreneurship: number;       // 0
    // Sum = 100
  };
  
  // Hidden Criteria (what's valued but not explicitly stated)
  hidden_criteria: Array<{
    criterion: string;              // "Resilience through failure"
    signals: string[];              // ["iterate", "experiment", "learn from mistakes"]
    importance: "high" | "medium" | "low";
    user_prompt: string;            // "Tell me about a time you failed and what you learned"
  }>;
  
  // Required Information Template
  required_fields: RequiredField[];
  
  // Essay Structure Template
  essay_template: {
    opening_strategy: string;       // "Lead with a compelling failure story that shows resilience"
    body_structure: string[];       // ["Problem identification", "Iteration process", "Technical solution", "Impact"]
    closing_strategy: string;       // "Forward-looking impact statement"
    tone: string;                   // "conversational", "enthusiastic"
  };
  
  // Success Patterns (optional - learned from winner analysis)
  success_patterns?: {
    common_themes: string[];        // ["Started with failure", "Showed technical depth", "Quantified impact"]
    word_count_range: [number, number];  // [500, 700]
    effective_examples: string[];   // ["Used specific numbers", "Showed process over outcome"]
  };
}

interface RequiredField {
  field_id: string;                 // "technical_project_description"
  field_name: string;               // "Primary Technical Project"
  field_type: "text" | "number" | "list" | "date";
  category: string;                 // "technical_achievement" | "leadership" | etc.
  weight_relevance: number;         // How much this field contributes to weighted emphasis (0-100)
  
  prompt_question: string;          // "Describe your most innovative technical project"
  follow_up_questions?: string[];   // ["What problem did it solve?", "What challenges did you face?"]
  
  validation: {
    required: boolean;
    min_length?: number;            // For text fields
    max_length?: number;
    must_include?: string[];        // Keywords that should be present
  };
  
  example_answer?: string;          // Help text for user
}
```

### 2.3 Preset Formula Library

**Initial Formula Set (for MVP):**

```typescript
const FORMULA_LIBRARY: ScholarshipFormula[] = [
  {
    formula_id: "innovation_tech",
    formula_name: "Innovation-Focused Technical Scholarship",
    detection_signals: {
      keywords: ["innovation", "creative", "iterate", "experiment", "technical", "build"],
      phrases: ["learning from failure", "hands-on projects", "real-world impact"],
      values_indicators: ["risk-taking", "creativity", "problem-solving"]
    },
    weights: {
      technical_achievement: 35,
      innovation: 40,
      leadership: 10,
      community_service: 5,
      personal_growth: 10,
      academic_excellence: 0,
      entrepreneurship: 0
    },
    hidden_criteria: [
      {
        criterion: "Resilience through failure",
        signals: ["iterate", "experiment", "learn", "challenge"],
        importance: "high",
        user_prompt: "Tell me about a time your technical project failed and what you learned from it"
      },
      {
        criterion: "Measurable impact",
        signals: ["impact", "used by", "helped", "improved"],
        importance: "high",
        user_prompt: "What measurable impact did your project have? (e.g., time saved, people helped, efficiency gained)"
      },
      {
        criterion: "Technical depth",
        signals: ["built", "developed", "engineered", "designed"],
        importance: "medium",
        user_prompt: "Describe the technical components or technologies you used in detail"
      }
    ],
    required_fields: [
      {
        field_id: "primary_tech_project",
        field_name: "Primary Technical Project",
        field_type: "text",
        category: "technical_achievement",
        weight_relevance: 35,
        prompt_question: "Describe your most innovative technical project in detail (what you built, how it works)",
        follow_up_questions: [
          "What specific problem did this project solve?",
          "What technologies or tools did you use?"
        ],
        validation: {
          required: true,
          min_length: 100,
          max_length: 500
        }
      },
      {
        field_id: "iteration_story",
        field_name: "Iteration/Failure Story",
        field_type: "text",
        category: "innovation",
        weight_relevance: 40,
        prompt_question: "Describe a specific failure or challenge you faced with this project and how you overcame it",
        validation: {
          required: true,
          min_length: 100,
          max_length: 300
        }
      },
      {
        field_id: "measurable_impact",
        field_name: "Quantifiable Impact",
        field_type: "text",
        category: "innovation",
        weight_relevance: 30,
        prompt_question: "What measurable impact did your project have? Provide specific numbers if possible",
        validation: {
          required: true,
          min_length: 50,
          must_include: ["number", "metric", "quantify"] // AI checks for presence of numbers
        }
      },
      {
        field_id: "technical_details",
        field_name: "Technical Implementation Details",
        field_type: "text",
        category: "technical_achievement",
        weight_relevance: 25,
        prompt_question: "Describe the technical implementation: what components, algorithms, or systems did you build?",
        validation: {
          required: true,
          min_length: 100
        }
      }
    ],
    essay_template: {
      opening_strategy: "Lead with a compelling failure/challenge story that demonstrates resilience",
      body_structure: [
        "Hook: Failure or unexpected challenge",
        "Problem: Real-world problem being solved",
        "Process: Iteration and technical problem-solving",
        "Solution: Technical details and innovation",
        "Impact: Measurable outcomes and future potential"
      ],
      closing_strategy: "Forward-looking statement about future innovation and impact",
      tone: "conversational"
    }
  },
  
  {
    formula_id: "merit_academic",
    formula_name: "Merit-Based Academic Scholarship",
    detection_signals: {
      keywords: ["academic", "excellence", "achievement", "GPA", "merit", "honors"],
      phrases: ["academic performance", "scholastic achievement", "high standards"],
      values_indicators: ["dedication", "discipline", "intellectual curiosity"]
    },
    weights: {
      technical_achievement: 10,
      innovation: 5,
      leadership: 15,
      community_service: 10,
      personal_growth: 10,
      academic_excellence: 50,
      entrepreneurship: 0
    },
    hidden_criteria: [
      {
        criterion: "Intellectual curiosity beyond grades",
        signals: ["research", "independent study", "pursued", "explored"],
        importance: "high",
        user_prompt: "Describe how you've pursued learning beyond the classroom"
      },
      {
        criterion: "Balance of excellence and well-roundedness",
        signals: ["balance", "extracurricular", "leadership"],
        importance: "medium",
        user_prompt: "How do you balance academic excellence with other commitments?"
      }
    ],
    required_fields: [
      {
        field_id: "academic_achievements",
        field_name: "Academic Achievements",
        field_type: "text",
        category: "academic_excellence",
        weight_relevance: 50,
        prompt_question: "List your most significant academic achievements (GPA, test scores, honors, advanced courses)",
        validation: { required: true, min_length: 100 }
      },
      {
        field_id: "intellectual_pursuit",
        field_name: "Intellectual Pursuit Story",
        field_type: "text",
        category: "academic_excellence",
        weight_relevance: 30,
        prompt_question: "Describe a specific example of how you pursued learning beyond classroom requirements",
        validation: { required: true, min_length: 150 }
      },
      {
        field_id: "leadership_activities",
        field_name: "Leadership Activities",
        field_type: "text",
        category: "leadership",
        weight_relevance: 15,
        prompt_question: "Describe your leadership roles and impact",
        validation: { required: false, min_length: 100 }
      }
    ],
    essay_template: {
      opening_strategy: "Lead with intellectual curiosity or defining academic moment",
      body_structure: [
        "Hook: Moment of intellectual discovery",
        "Academic excellence: Achievements with context",
        "Intellectual pursuit: Beyond-classroom learning",
        "Balance: How you maintain excellence while being well-rounded",
        "Future: How this scholarship enables continued academic growth"
      ],
      closing_strategy: "Connect academic goals to future contribution",
      tone: "formal"
    }
  },
  
  {
    formula_id: "community_service",
    formula_name: "Community Service Leadership Scholarship",
    detection_signals: {
      keywords: ["community", "service", "volunteer", "impact", "giving back", "help others"],
      phrases: ["community impact", "service to others", "making a difference"],
      values_indicators: ["compassion", "empathy", "social responsibility"]
    },
    weights: {
      technical_achievement: 5,
      innovation: 10,
      leadership: 25,
      community_service: 50,
      personal_growth: 10,
      academic_excellence: 0,
      entrepreneurship: 0
    },
    hidden_criteria: [
      {
        criterion: "Personal connection to cause",
        signals: ["inspired", "motivated", "personal experience"],
        importance: "high",
        user_prompt: "What personal experience inspired your commitment to this cause?"
      },
      {
        criterion: "Sustained commitment (not one-time events)",
        signals: ["ongoing", "continue", "sustained", "years"],
        importance: "high",
        user_prompt: "How long have you been involved in this service work, and what's your ongoing commitment?"
      },
      {
        criterion: "Leadership that empowers others",
        signals: ["recruited", "organized", "mentored", "trained"],
        importance: "medium",
        user_prompt: "How did you mobilize others to join your cause?"
      }
    ],
    required_fields: [
      {
        field_id: "service_initiative",
        field_name: "Primary Service Initiative",
        field_type: "text",
        category: "community_service",
        weight_relevance: 50,
        prompt_question: "Describe your primary community service initiative or volunteer work in detail",
        validation: { required: true, min_length: 150 }
      },
      {
        field_id: "personal_motivation",
        field_name: "Personal Connection to Cause",
        field_type: "text",
        category: "personal_growth",
        weight_relevance: 20,
        prompt_question: "What personal experience or moment inspired your commitment to this cause?",
        validation: { required: true, min_length: 100 }
      },
      {
        field_id: "service_impact",
        field_name: "Community Impact",
        field_type: "text",
        category: "community_service",
        weight_relevance: 30,
        prompt_question: "What measurable impact has your service had on the community? (people helped, change created)",
        validation: { required: true, min_length: 100 }
      },
      {
        field_id: "leadership_mobilization",
        field_name: "Leadership in Service",
        field_type: "text",
        category: "leadership",
        weight_relevance: 25,
        prompt_question: "How did you organize or mobilize others to join your service work?",
        validation: { required: true, min_length: 100 }
      }
    ],
    essay_template: {
      opening_strategy: "Lead with personal story that sparked commitment to service",
      body_structure: [
        "Hook: Personal moment of inspiration",
        "Service work: Detailed description of initiative",
        "Leadership: How you mobilized others",
        "Impact: Measurable community change",
        "Growth: What you learned and future commitment"
      ],
      closing_strategy: "Commitment to continued service and how scholarship enables greater impact",
      tone: "inspirational"
    }
  },
  
  {
    formula_id: "leadership_entrepreneurial",
    formula_name: "Leadership & Entrepreneurial Scholarship",
    detection_signals: {
      keywords: ["leadership", "entrepreneurial", "initiative", "founded", "started", "organized"],
      phrases: ["took initiative", "led a team", "created from scratch"],
      values_indicators: ["self-starter", "vision", "execution"]
    },
    weights: {
      technical_achievement: 10,
      innovation: 20,
      leadership: 40,
      community_service: 5,
      personal_growth: 5,
      academic_excellence: 0,
      entrepreneurship: 20
    },
    hidden_criteria: [
      {
        criterion: "Initiative from zero to one",
        signals: ["founded", "started", "created", "from scratch"],
        importance: "high",
        user_prompt: "Describe something you started from nothing (organization, project, initiative)"
      },
      {
        criterion: "Team building and delegation",
        signals: ["recruited", "delegated", "built a team", "empowered"],
        importance: "high",
        user_prompt: "How did you build and manage your team?"
      },
      {
        criterion: "Overcoming obstacles",
        signals: ["challenge", "obstacle", "persevered", "overcame"],
        importance: "medium",
        user_prompt: "What was the biggest obstacle you faced as a leader and how did you overcome it?"
      }
    ],
    required_fields: [
      {
        field_id: "leadership_initiative",
        field_name: "Primary Leadership Initiative",
        field_type: "text",
        category: "leadership",
        weight_relevance: 40,
        prompt_question: "Describe an organization, project, or initiative you founded or led",
        validation: { required: true, min_length: 150 }
      },
      {
        field_id: "team_building",
        field_name: "Team Building Story",
        field_type: "text",
        category: "leadership",
        weight_relevance: 25,
        prompt_question: "How did you recruit, build, and manage your team?",
        validation: { required: true, min_length: 100 }
      },
      {
        field_id: "leadership_challenge",
        field_name: "Leadership Challenge",
        field_type: "text",
        category: "personal_growth",
        weight_relevance: 20,
        prompt_question: "Describe a significant leadership challenge you faced and how you overcame it",
        validation: { required: true, min_length: 100 }
      },
      {
        field_id: "initiative_impact",
        field_name: "Impact & Growth",
        field_type: "text",
        category: "entrepreneurship",
        weight_relevance: 15,
        prompt_question: "What impact did your leadership have? Include growth metrics if applicable",
        validation: { required: true, min_length: 75 }
      }
    ],
    essay_template: {
      opening_strategy: "Lead with the moment you decided to take initiative",
      body_structure: [
        "Hook: Decision to start something from scratch",
        "Vision: What you wanted to create and why",
        "Execution: How you built the team and project",
        "Challenge: Key obstacle and how you overcame it",
        "Impact: Results and growth achieved"
      ],
      closing_strategy: "How this scholarship enables you to scale your leadership impact",
      tone: "confident"
    }
  }
];
```

**Database Schema:**
```sql
CREATE TABLE scholarship_formulas (
  formula_id TEXT PRIMARY KEY,
  formula_name TEXT NOT NULL,
  detection_signals JSONB NOT NULL,
  weights JSONB NOT NULL,
  hidden_criteria JSONB NOT NULL,
  required_fields JSONB NOT NULL,
  essay_template JSONB NOT NULL,
  success_patterns JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pre-populate with the 4 base formulas
-- Can be extended with more formulas as patterns are discovered
```

---

## 3. Core Data Models

### 3.1 Scholarship Analysis Output

```typescript
interface ScholarshipAnalysis {
  scholarship_id: string;
  
  // Matched Formula
  matched_formula: {
    formula_id: string;             // "innovation_tech"
    formula_name: string;           // "Innovation-Focused Technical Scholarship"
    confidence_score: number;       // 0-100 (how well it matches)
    match_reasoning: string;        // "High presence of keywords: innovation (5x), iterate (3x)..."
  };
  
  // Detected Hidden Criteria (from formula + custom analysis)
  detected_criteria: Array<{
    criterion: string;              // "Resilience through failure"
    source: "formula" | "custom";   // From preset formula or detected by AI
    importance: "high" | "medium" | "low";
    evidence: string[];             // Quotes from scholarship description
    user_prompt: string;            // Question to ask user
  }>;
  
  // Weight Profile (from matched formula)
  weights: {
    technical_achievement: number;
    leadership: number;
    community_service: number;
    innovation: number;
    personal_growth: number;
    academic_excellence: number;
    entrepreneurship: number;
  };
  
  // Required Fields (from formula)
  required_fields: RequiredField[];
  
  // Essay Strategy (from formula)
  essay_strategy: {
    opening_strategy: string;
    body_structure: string[];
    closing_strategy: string;
    tone: string;
  };
  
  // Raw scholarship data
  scholarship_data: {
    title: string;
    description: string;
    essay_prompt: string;
  };
}
```

**Database Schema:**
```sql
CREATE TABLE scholarship_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scholarship_title TEXT NOT NULL,
  scholarship_description TEXT NOT NULL,
  essay_prompt TEXT NOT NULL,
  
  -- Analysis Results
  matched_formula_id TEXT REFERENCES scholarship_formulas(formula_id),
  confidence_score INTEGER,
  match_reasoning TEXT,
  detected_criteria JSONB,
  weights JSONB,
  required_fields JSONB,
  essay_strategy JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analysis_formula ON scholarship_analyses(matched_formula_id);
```

---

### 3.2 User Response Collection

```typescript
interface UserResponseSession {
  session_id: string;
  scholarship_analysis_id: string;
  
  // Progress Tracking
  progress: {
    total_fields: number;           // How many fields need to be filled
    completed_fields: number;       // How many have been filled
    current_field_index: number;    // Which field is currently being asked
    status: "in_progress" | "complete";
  };
  
  // Collected Responses
  responses: Array<{
    field_id: string;               // "primary_tech_project"
    field_name: string;             // "Primary Technical Project"
    category: string;               // "technical_achievement"
    weight_relevance: number;       // 35
    
    // User's response
    answer: string;
    word_count: number;
    
    // AI follow-ups (if answer insufficient)
    follow_up_asked?: string;       // "Can you be more specific about the technologies used?"
    follow_up_answer?: string;
    
    // Validation
    validation_status: "valid" | "needs_more_detail" | "missing_required_element";
    validation_feedback?: string;   // "Great! This gives us enough detail about the technical implementation"
    
    timestamp: timestamp;
  }>;
  
  created_at: timestamp;
  updated_at: timestamp;
}
```

**Database Schema:**
```sql
CREATE TABLE user_response_sessions (
  session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scholarship_analysis_id UUID REFERENCES scholarship_analyses(id),
  
  -- Progress
  total_fields INTEGER NOT NULL,
  completed_fields INTEGER DEFAULT 0,
  current_field_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  
  -- Responses (stored as JSONB array)
  responses JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_session_analysis ON user_response_sessions(scholarship_analysis_id);
CREATE INDEX idx_session_status ON user_response_sessions(status);
```

---

### 3.3 Generated Essay

```typescript
interface GeneratedEssay {
  essay_id: string;
  session_id: string;
  scholarship_analysis_id: string;
  
  // Essay Content
  content: {
    body: string;                   // Full essay text
    word_count: number;
  };
  
  // How it was generated
  generation_metadata: {
    formula_used: string;           // "innovation_tech"
    weights_applied: object;        // Weight profile used
    
    // Which user responses were used where
    response_mapping: Array<{
      essay_section: string;        // "introduction", "body_paragraph_1", etc.
      field_ids_used: string[];     // ["primary_tech_project", "iteration_story"]
      emphasis_percentage: number;  // What % of this section's space
    }>;
    
    template_applied: {
      opening_strategy: string;
      body_structure: string[];
      closing_strategy: string;
      tone: string;
    };
  };
  
  // Explanations
  explanations: Array<{
    section: string;                // "introduction"
    reasoning: string;              // "We led with your flooding story because..."
    criterion_addressed: string;    // "Resilience through failure"
    weight_applied: string;         // "innovation (40%)"
  }>;
  
  created_at: timestamp;
}
```

**Database Schema:**
```sql
CREATE TABLE generated_essays (
  essay_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES user_response_sessions(session_id),
  scholarship_analysis_id UUID REFERENCES scholarship_analyses(id),
  
  -- Content
  body TEXT NOT NULL,
  word_count INTEGER,
  
  -- Metadata
  formula_used TEXT,
  generation_metadata JSONB,
  explanations JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_essay_session ON generated_essays(session_id);
```

---

## 4. Dynamic Data Collection Flow

### 4.1 Flow Overview

```
Step 1: Scholarship Analysis
├─ Input: Scholarship description + essay prompt
├─ LLM analyzes and matches to preset formula
├─ Extracts hidden criteria
└─ Outputs: Formula match + required fields + weights

Step 2: User Onboarding
├─ Show user what the scholarship really values (transparency)
├─ Show detected hidden criteria
├─ Explain what information will be asked for and why
└─ User confirms ready to proceed

Step 3: Dynamic Questioning (Progressive)
├─ For each required field (ordered by weight_relevance):
│   ├─ Display prompt question
│   ├─ Show example answer (optional)
│   ├─ User provides answer
│   ├─ AI validates answer (sufficient detail?)
│   │   ├─ If insufficient → Ask follow-up question
│   │   └─ If sufficient → Confirm and move to next
│   └─ Save response
└─ Continue until all required fields complete

Step 4: Essay Generation
├─ Input: All collected responses + matched formula
├─ LLM generates essay using template + weights
└─ Output: Optimized essay + explanations

Step 5: Review & Refinement
├─ User reviews essay with explanations
├─ Can edit or request regeneration
└─ Export final version
```

### 4.2 State Machine

```typescript
type SessionState = 
  | "analyzing_scholarship"         // LLM analyzing scholarship
  | "onboarding"                    // Showing user what will be asked
  | "collecting_responses"          // In the dynamic Q&A loop
  | "validating_response"           // AI checking if answer is sufficient
  | "asking_follow_up"              // AI asking for more detail
  | "generating_essay"              // Creating the essay
  | "complete"                      // Essay ready for review
  | "error";

interface SessionStateData {
  current_state: SessionState;
  
  // Context for current state
  context: {
    current_field?: RequiredField;
    follow_up_question?: string;
    validation_feedback?: string;
    error_message?: string;
  };
  
  // Transition history
  state_history: Array<{
    state: SessionState;
    timestamp: timestamp;
  }>;
}
```

---

## 5. LLM Interaction Points

### 5.1 Scholarship Analysis & Formula Matching

**Purpose:** Analyze scholarship and match to preset formula

**LLM Input:**
```typescript
{
  scholarship_description: string;
  essay_prompt: string;
  available_formulas: ScholarshipFormula[];  // All formulas from library
}
```

**LLM Prompt Structure:**
```
You are analyzing a scholarship to identify its type and hidden criteria.

SCHOLARSHIP DESCRIPTION:
{scholarship_description}

ESSAY PROMPT:
{essay_prompt}

AVAILABLE FORMULA TYPES:
{JSON.stringify(available_formulas.map(f => ({
  formula_id: f.formula_id,
  formula_name: f.formula_name,
  detection_signals: f.detection_signals
})))}

TASK:
1. Match this scholarship to the best formula from the list above
2. Calculate confidence score (0-100) for the match
3. Extract hidden criteria from the description (what's valued but not explicitly stated)
4. Provide evidence for each criterion detected

Respond with JSON only:
{
  "matched_formula_id": "...",
  "confidence_score": 85,
  "match_reasoning": "High density of keywords: innovation (5x), iterate (3x), hands-on (2x)...",
  "detected_criteria": [
    {
      "criterion": "Resilience through failure",
      "source": "formula",  // or "custom" if you detected something new
      "importance": "high",
      "evidence": ["Quote from description showing this is valued", "Another quote"],
      "user_prompt": "Tell me about a time your technical project failed and what you learned"
    }
  ]
}
```

**LLM Output:**
```typescript
{
  matched_formula_id: string;
  confidence_score: number;
  match_reasoning: string;
  detected_criteria: Array<{
    criterion: string;
    source: "formula" | "custom";
    importance: "high" | "medium" | "low";
    evidence: string[];
    user_prompt: string;
  }>;
}
```

**Post-Processing:**
- Retrieve full formula from database using matched_formula_id
- Merge formula's required_fields with detected custom criteria
- Store complete analysis

---

### 5.2 Response Validation

**Purpose:** Check if user's answer is sufficient or needs follow-up

**LLM Input:**
```typescript
{
  field: RequiredField;
  user_answer: string;
  scholarship_context: {
    formula_name: string;
    weights: object;
    hidden_criteria: string[];
  };
}
```

**LLM Prompt Structure:**
```
You are validating a user's response to ensure it contains enough detail for essay generation.

FIELD BEING ASKED:
{field.prompt_question}

VALIDATION REQUIREMENTS:
- Min length: {field.validation.min_length} characters
- Required: {field.validation.required}
- Must include: {field.validation.must_include?.join(', ')}

USER'S ANSWER:
{user_answer}

CONTEXT:
This is for a {scholarship_context.formula_name} scholarship which values {hidden_criteria}.
This field contributes {field.weight_relevance}% to the essay emphasis.

TASK:
Evaluate if the answer is sufficient. If not, generate a helpful follow-up question.

Respond with JSON only:
{
  "validation_status": "valid" | "needs_more_detail" | "missing_required_element",
  "validation_feedback": "Great! This gives enough detail..." OR "This is helpful, but could you...",
  "follow_up_question": null OR "Can you provide more specific details about..."
}
```

**LLM Output:**
```typescript
{
  validation_status: "valid" | "needs_more_detail" | "missing_required_element";
  validation_feedback: string;
  follow_up_question: string | null;
}
```

---

### 5.3 Essay Generation Using Formula

**Purpose:** Generate essay using template and collected responses

**LLM Input:**
```typescript
{
  formula: ScholarshipFormula;
  responses: UserResponseSession['responses'];
  essay_prompt: string;
  target_word_count: number;
}
```

**LLM Prompt Structure:**
```
You are writing a scholarship essay using a proven formula for {formula.formula_name} scholarships.

ESSAY PROMPT:
{essay_prompt}

FORMULA REQUIREMENTS:
Weights (allocate essay space accordingly):
{JSON.stringify(formula.weights, null, 2)}

Essay Template:
- Opening Strategy: {formula.essay_template.opening_strategy}
- Body Structure: {formula.essay_template.body_structure.join(' → ')}
- Closing Strategy: {formula.essay_template.closing_strategy}
- Tone: {formula.essay_template.tone}

USER'S INFORMATION (organized by category):
{responses.map(r => `
[${r.category}] ${r.field_name}:
${r.answer}
${r.follow_up_answer ? `Additional detail: ${r.follow_up_answer}` : ''}
`).join('\n\n')}

HIDDEN CRITERIA TO ADDRESS:
{formula.hidden_criteria.map(c => `- ${c.criterion} (${c.importance} importance)`).join('\n')}

INSTRUCTIONS:
1. Follow the essay template structure exactly
2. Allocate space according to weight percentages
3. Use a {formula.essay_template.tone} tone
4. Address each hidden criterion naturally
5. Incorporate the user's specific examples and details
6. Target word count: {target_word_count} words

Write ONLY the essay text. No preamble or metadata.
```

**LLM Output:**
```typescript
{
  essay_text: string;
}
```

**Post-Processing:**
- Count words
- Map which responses were used in which sections
- Calculate actual emphasis breakdown
- Store with metadata

---

### 5.4 Explanation Generation

**Purpose:** Explain why essay was written this way

**LLM Input:**
```typescript
{
  essay_text: string;
  formula: ScholarshipFormula;
  responses: UserResponseSession['responses'];
}
```

**LLM Prompt Structure:**
```
You are explaining to a student why their essay was written in a specific way.

ESSAY:
{essay_text}

FORMULA USED:
{formula.formula_name}
Weights: {JSON.stringify(formula.weights)}
Hidden Criteria: {formula.hidden_criteria.map(c => c.criterion).join(', ')}

USER'S RESPONSES:
{responses.map(r => `${r.field_name}: ${r.answer.substring(0, 100)}...`)}

Generate 4-6 explanations showing:
- Which parts of the essay address which hidden criteria
- Why we emphasized certain information over others (weight-based)
- How the essay structure follows the proven formula

Respond with JSON only:
{
  "explanations": [
    {
      "section": "introduction",
      "reasoning": "We led with your flooding story because...",
      "criterion_addressed": "Resilience through failure",
      "weight_applied": "innovation (40%)"
    }
  ]
}
```

**LLM Output:**
```typescript
{
  explanations: Array<{
    section: string;
    reasoning: string;
    criterion_addressed: string;
    weight_applied: string;
  }>;
}
```

---

## 6. API Contracts

### 6.1 Analyze Scholarship

**Endpoint:** `POST /api/analyze-scholarship`

**Request:**
```typescript
{
  title: string;
  description: string;
  essay_prompt: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    analysis_id: string;
    matched_formula: {
      formula_id: string;
      formula_name: string;
      confidence_score: number;
      match_reasoning: string;
    };
    weights: object;
    detected_criteria: Array<{
      criterion: string;
      importance: string;
      user_prompt: string;
    }>;
    required_fields: RequiredField[];
    essay_strategy: object;
  };
  error?: string;
}
```

---

### 6.2 Start Response Session

**Endpoint:** `POST /api/start-session`

**Request:**
```typescript
{
  analysis_id: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    session_id: string;
    total_fields: number;
    first_field: {
      field_id: string;
      prompt_question: string;
      example_answer?: string;
      category: string;
      why_asking: string;  // e.g., "This scholarship highly values innovation (40%), so we need to understand your innovative project"
    };
  };
  error?: string;
}
```

---

### 6.3 Submit Response

**Endpoint:** `POST /api/submit-response`

**Request:**
```typescript
{
  session_id: string;
  field_id: string;
  answer: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    validation_status: "valid" | "needs_more_detail";
    feedback: string;
    
    // If valid
    next_field?: {
      field_id: string;
      prompt_question: string;
      example_answer?: string;
      category: string;
      why_asking: string;
    };
    
    // If needs more detail
    follow_up_question?: string;
    
    // Progress tracking
    progress: {
      completed: number;
      total: number;
      percentage: number;
    };
    
    // If all complete
    ready_to_generate?: boolean;
  };
  error?: string;
}
```

---

### 6.4 Generate Essay

**Endpoint:** `POST /api/generate-essay`

**Request:**
```typescript
{
  session_id: string;
  target_word_count?: number;  // Optional, default from formula
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    essay_id: string;
    content: {
      body: string;
      word_count: number;
    };
    explanations: Array<{
      section: string;
      reasoning: string;
      criterion_addressed: string;
      weight_applied: string;
    }>;
    metadata: {
      formula_used: string;
      weights_applied: object;
    };
  };
  error?: string;
}
```

---

### 6.5 Get Session Status

**Endpoint:** `GET /api/session/{session_id}/status`

**Response:**
```typescript
{
  success: boolean;
  data: {
    session_id: string;
    status: SessionState;
    progress: {
      completed_fields: number;
      total_fields: number;
      percentage: number;
    };
    current_field?: RequiredField;
    responses_collected: number;
    essay_generated: boolean;
  };
}
```

---

## 7. Example Workflows

### 7.1 Complete User Journey Example

**Scenario:** Student applying for "Tech Innovators Scholarship"

#### Step 1: Scholarship Input
```
User pastes scholarship description and essay prompt
↓
POST /api/analyze-scholarship
```

**Response Preview:**
```json
{
  "matched_formula": {
    "formula_id": "innovation_tech",
    "formula_name": "Innovation-Focused Technical Scholarship",
    "confidence_score": 92
  },
  "weights": {
    "innovation": 40,
    "technical_achievement": 35,
    "leadership": 10,
    "community_service": 5,
    "personal_growth": 10
  },
  "detected_criteria": [
    {
      "criterion": "Resilience through failure",
      "importance": "high",
      "user_prompt": "Tell me about a time your technical project failed..."
    },
    {
      "criterion": "Measurable impact",
      "importance": "high",
      "user_prompt": "What measurable impact did your project have?"
    }
  ],
  "required_fields": [
    /* 4 fields from innovation_tech formula */
  ]
}
```

**UI Shows:**
- "This scholarship values **Innovation (40%)** and **Technical Achievement (35%)** most"
- "We detected 3 hidden criteria this scholarship cares about but doesn't explicitly state"
- "We'll ask you 4 targeted questions to create your optimized essay"

#### Step 2: Start Session
```
POST /api/start-session
```

**Response:**
```json
{
  "session_id": "sess_123",
  "total_fields": 4,
  "first_field": {
    "field_id": "iteration_story",
    "prompt_question": "Describe a specific failure or challenge you faced with this project and how you overcame it",
    "category": "innovation",
    "why_asking": "This scholarship highly values 'learning from failure' and innovation (40% weight). Showing your iteration process is critical."
  }
}
```

**UI Shows:**
- Progress: 1 of 4 questions
- Why we're asking this
- Text area for answer
- Character count (min 100)

#### Step 3: User Responds
```
POST /api/submit-response
{
  "session_id": "sess_123",
  "field_id": "iteration_story",
  "answer": "My first automated watering system flooded the greenhouse at 3 AM. The soil moisture sensors gave false readings when wet, creating a feedback loop. I spent weeks debugging and learning about sensor calibration."
}
```

**Response:**
```json
{
  "validation_status": "needs_more_detail",
  "feedback": "Great start! The flooding story is compelling.",
  "follow_up_question": "What specific steps did you take to fix the sensor calibration issue? The scholarship values technical depth.",
  "progress": {
    "completed": 0,
    "total": 4,
    "percentage": 0
  }
}
```

**UI Shows:**
- "Good start! Can you add a bit more detail?"
- Follow-up question appears
- User adds more detail

#### Step 4: Follow-up Response
```
POST /api/submit-response
{
  "session_id": "sess_123",
  "field_id": "iteration_story",
  "answer": "I researched capacitive vs resistive sensors, tested threshold ranges, and added validation logic to ignore outlier readings. I also built a test rig to calibrate sensors across different soil types."
}
```

**Response:**
```json
{
  "validation_status": "valid",
  "feedback": "Perfect! This level of technical detail is exactly what this scholarship is looking for.",
  "next_field": {
    "field_id": "primary_tech_project",
    "prompt_question": "Describe your most innovative technical project in detail...",
    "category": "technical_achievement",
    "why_asking": "This field contributes 35% to your essay emphasis..."
  },
  "progress": {
    "completed": 1,
    "total": 4,
    "percentage": 25
  }
}
```

**UI Shows:**
- ✓ Question 1 complete
- Progress: 2 of 4 questions
- Next question appears

#### Step 5-7: Continue Q&A
_User answers remaining 3 questions with AI validation at each step_

#### Step 8: Generate Essay
```
POST /api/generate-essay
{
  "session_id": "sess_123"
}
```

**Response:**
```json
{
  "essay_id": "essay_456",
  "content": {
    "body": "My first automated watering system was a spectacular failure—it flooded the school greenhouse at 3 AM. But that 3 AM wake-up call taught me more about innovation than any success could have...",
    "word_count": 647
  },
  "explanations": [
    {
      "section": "introduction",
      "reasoning": "We led with your flooding story because this scholarship explicitly values 'learning from failure.' Starting with failure shows resilience and sets up the innovation narrative.",
      "criterion_addressed": "Resilience through failure",
      "weight_applied": "innovation (40%)"
    },
    {
      "section": "body_paragraph_2",
      "reasoning": "We dedicated significant space to your sensor calibration process because technical achievement is weighted at 35%. The specific details (capacitive vs resistive, threshold testing) prove deep technical knowledge.",
      "criterion_addressed": "Technical depth",
      "weight_applied": "technical_achievement (35%)"
    }
  ]
}
```

**UI Shows:**
- Full essay with highlighting
- Explanation panel showing reasoning for each section
- "This essay addresses all 3 hidden criteria we detected"
- Edit and export options

---

### 7.2 Data Flow Diagram

```
┌─────────────────────┐
│  User Input:        │
│  Scholarship Desc   │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────────────────────┐
│  LLM Analysis                       │
│  • Match to preset formula          │
│  • Extract hidden criteria          │
│  • Determine required fields        │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│  Start Response Session             │
│  • Create session with 4 fields     │
│  • Order by weight_relevance        │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│  Dynamic Q&A Loop                   │
│  For each field:                    │
│    1. Ask question                  │
│    2. Get user answer               │
│    3. LLM validates                 │
│    4. If insufficient → Follow-up   │
│    5. If valid → Next question      │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│  Essay Generation                   │
│  • Use formula template             │
│  • Apply weights to emphasis        │
│  • Incorporate responses            │
│  • Address hidden criteria          │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│  Generate Explanations              │
│  • Show why sections were written   │
│  • Map to hidden criteria           │
│  • Reference weights applied        │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│  Deliver to User                    │
│  • Essay with explanations          │
│  • Highlighted sections             │
│  • Edit/export options              │
└─────────────────────────────────────┘
```

---

## 8. Frontend State Management

```typescript
interface AppState {
  // Scholarship Analysis
  scholarship: {
    raw: {
      title: string;
      description: string;
      essay_prompt: string;
    } | null;
    analysis: ScholarshipAnalysis | null;
    status: 'idle' | 'analyzing' | 'complete' | 'error';
  };
  
  // Response Collection Session
  session: {
    session_id: string | null;
    status: SessionState;
    progress: {
      completed: number;
      total: number;
      percentage: number;
    };
    current_field: RequiredField | null;
    current_answer: string;
    validation_feedback: string | null;
    follow_up_question: string | null;
    all_responses: UserResponseSession['responses'];
  };
  
  // Essay
  essay: {
    essay_id: string | null;
    content: string | null;
    word_count: number | null;
    explanations: Array<any> | null;
    status: 'not_started' | 'generating' | 'complete' | 'error';
  };
  
  // UI
  ui: {
    current_step: 'upload' | 'review_analysis' | 'answer_questions' | 'review_essay';
    show_explanations: boolean;
    show_hidden_criteria: boolean;
  };
}
```

---

## 9. Success Metrics

### Performance Metrics
| Metric | Target |
|--------|--------|
| Formula Match Accuracy | 85%+ |
| Question Validation Accuracy | 80%+ (correctly identifies when more detail needed) |
| Essay Generation Time | < 45 seconds |
| Average Q&A Completion Time | < 15 minutes for 4-5 questions |

### Quality Metrics
| Metric | Target |
|--------|--------|
| Essay addresses all detected hidden criteria | 100% |
| Weight distribution matches formula | ±10% |
| User satisfaction with dynamic prompting | 4/5 rating |
| Reduction in user effort vs. traditional essay writing | 50%+ time saved |

---

**End of Document**

*This FRD provides the data structures and flow for developers to implement the system. ML researchers should use Section 5 (LLM Interaction Points) to develop and refine prompts.*
