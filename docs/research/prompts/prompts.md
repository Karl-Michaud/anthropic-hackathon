# LLM Prompts Documentation

This document describes all LLM prompts used in the Socratic AI scholarship essay system, their data types, and connections.

## Table of Contents
1. [Overview](#overview)
2. [Model Configuration](#model-configuration)
3. [Core Prompt Libraries](#core-prompt-libraries)
4. [Detailed Prompt Specifications](#detailed-prompt-specifications)
5. [Data Type Definitions](#data-type-definitions)
6. [Data Flow and Connections](#data-flow-and-connections)
7. [Component Integration](#component-integration)

---

## Overview

The codebase uses **Anthropic Claude Sonnet 4.5** (`claude-sonnet-4-5-20250929`) for all LLM operations. The system implements 13 distinct prompts across 4 main library files to analyze scholarships, generate essays, and provide iterative feedback.

**Primary Workflow:**
1. Extract scholarship information from user input
2. Analyze scholarship across 4 dimensions (personality, priorities, values, weights)
3. Generate essay draft or analyze custom draft
4. Iteratively improve essay through Socratic questions or feedback

---

## Model Configuration

**Model Used:** `claude-sonnet-4-5-20250929` (Claude Sonnet 4.5)

**API Configuration:**
```typescript
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

**Standard Parameters:**
- `model`: "claude-sonnet-4-5-20250929"
- `max_tokens`: 1024-4096 (varies by prompt)
- `temperature`: Not explicitly set (defaults to 1.0)

---

## Core Prompt Libraries

### 1. Scholarship Information Extraction
**File:** `app/lib/claudeApi.ts`
**Primary Function:** `extractScholarshipInfo(content: string)`

### 2. Scholarship Analysis
**File:** `app/lib/request.ts`
**Primary Functions:**
- `requestClaude<T>(type, scholarshipTitle, scholarshipDescription, essayPrompt)`
- Supports 7 analysis types via `type` parameter

### 3. Socratic Question Generation
**File:** `app/lib/socratic.ts`
**Primary Functions:**
- `analyzeSocratic(essayContent, scholarshipTitle?, userId?)`
- `submitSocraticAnswers(essayContent, answers, userId?)`

### 4. Feedback Analysis
**File:** `app/lib/feedback.ts`
**Primary Functions:**
- `analyzeFeedback(request: AnalyzeFeedbackRequest)`
- `submitFeedback(essayContent, feedbackData, userId?)`

---

## Detailed Prompt Specifications

### Prompt 1: Scholarship Information Extraction

**Location:** `app/lib/claudeApi.ts:47-79`

**Purpose:** Extract structured scholarship data from free-form user input

**Input Data Type:**
```typescript
content: string  // User's raw input about scholarship
```

**Prompt Template:**
```
Extract scholarship name, description, and essay prompt from user input.
Return ONLY valid JSON with three fields:
- ScholarshipName: The name of the scholarship
- ScholarshipDescription: Comprehensive info (amount, eligibility, deadline, requirements)
- EssayPrompt: The essay question to answer
```

**Output Data Type:**
```typescript
{
  ScholarshipName: string;
  ScholarshipDescription: string;
  EssayPrompt: string;
}
```

**Model Parameters:**
- Max tokens: 1024
- System prompt: "You are a helpful assistant that extracts scholarship information."

**Database Connection:**
- Stored in `Scholarship` table
- Fields: `title`, `description`, `essayPrompt`

---

### Prompt 2: Personality Profile Analysis

**Location:** `app/lib/request.ts:116-166`

**Purpose:** Extract scholarship's "personality" archetype and messaging strategy

**Input Data Type:**
```typescript
scholarshipTitle: string;
scholarshipDescription: string;
essayPrompt: string;
```

**Prompt Structure:**
```
Analyze this scholarship and extract:
1. Core Identity/Archetype (Innovator, Scholar, Servant Leader, etc.)
2. Tone & Style Preference (formal, energetic, heartfelt, technical, visionary)
3. Communication Strategy (how they want to be approached)
4. Values Emphasized (4-6 core values)
5. Recommended Essay Focus (how to frame your story)
6. Contrast Examples (vs. Merit Academic, vs. Community Service)
```

**Output Data Type:** `IPromptPersonality`
```typescript
interface IPromptPersonality {
  personality_profile: {
    core_identity: string;
    tone_and_style: string[];
    communication_strategy: string;
    values_emphasized: string[];
    recommended_essay_focus: string;
    contrast_examples: {
      vs_merit_academic: string;
      vs_community_service: string;
    };
  };
}
```

**Model Parameters:**
- Max tokens: 1024

**Database Connection:**
- Stored in `PromptPersonality` table
- Relation: `Scholarship.promptPersonality`

---

### Prompt 3: Priorities Analysis

**Location:** `app/lib/request.ts:169-204`

**Purpose:** Identify scholarship selection priorities and their weighted importance

**Input Data Type:**
```typescript
scholarshipTitle: string;
scholarshipDescription: string;
essayPrompt: string;
```

**Prompt Structure:**
```
Analyze selection priorities:
1. Primary Focus (merit, innovation, leadership, community service, etc.)
2. Priority Weights (percentage distribution across criteria)
3. Selection Signals (specific language indicating priorities)
4. Success Profile (type of student who matches best)
5. Summary and Confidence Score (0-100)
```

**Output Data Type:** `IPromptPriority`
```typescript
interface IPromptPriority {
  primary_focus: string;
  priority_weights: {
    [key: string]: number;  // e.g., "academic_excellence": 30
  };
  selection_signals: string[];
  success_profile: string;
  summary: string;
  confidence_score: number;
}
```

**Model Parameters:**
- Max tokens: 1024

**Database Connection:**
- Stored in `PromptPriority` table
- Relation: `Scholarship.promptPriority`

---

### Prompt 4: Values Analysis

**Location:** `app/lib/request.ts:207-241`

**Purpose:** Identify core values emphasized by the scholarship

**Input Data Type:**
```typescript
scholarshipTitle: string;
scholarshipDescription: string;
essayPrompt: string;
```

**Prompt Structure:**
```
Identify core values:
1. Values Emphasized (top values list)
2. Value Definitions (what each value means in this context)
3. Evidence Phrases (supporting language from scholarship)
4. Summary and Confidence Score
```

**Output Data Type:** `IPromptValues`
```typescript
interface IPromptValues {
  values_emphasized: string[];
  value_definitions: {
    [key: string]: string;  // e.g., "innovation": "Creating novel solutions..."
  };
  evidence_phrases: string[];
  summary: string;
  confidence_score: number;
}
```

**Model Parameters:**
- Max tokens: 1024

**Database Connection:**
- Stored in `PromptValue` table
- Relation: `Scholarship.promptValue`

---

### Prompt 5: Hidden Weights Analysis

**Location:** `app/lib/request.ts:244-404`

**Purpose:** Assign weighted importance to 10 hidden evaluation criteria

**Input Data Type:**
```typescript
scholarshipTitle: string;
scholarshipDescription: string;
essayPrompt: string;
```

**Prompt Structure:**
```
Assign weights (summing to 1.0) across 10 categories:
1. Sustained Depth Over Resume Padding
2. Values-Driven Decision Making
3. Problem-Solving Orientation
4. Entrepreneurial vs. Theoretical Mindset
5. Future Investment Potential
6. Adversity Plus Agency
7. Interview Performance
8. Language Mirroring & Framing
9. Regional & Nomination Strategy
10. Academic Threshold Sufficiency

Each category has 3 sub-criteria with sub-weights.
```

**Output Data Type:** `IPromptWeights`
```typescript
interface IPromptWeights {
  categories: {
    [key: string]: {
      weight: number;
      subcategories: {
        [key: string]: number;  // Sub-weights (sum to 1.0 within category)
      };
    };
  };
}
```

**Model Parameters:**
- Max tokens: 1024

**Database Connection:**
- Stored in `PromptWeight` table
- Relation: `Scholarship.promptWeight`

---

### Prompt 6: Essay Draft Generation

**Location:** `app/lib/request.ts:407-544`

**Purpose:** Generate complete essay draft using all scholarship analyses

**Input Data Type:**
```typescript
scholarshipTitle: string;
scholarshipDescription: string;
essayPrompt: string;
personalityAnalysis: IPromptPersonality;
prioritiesAnalysis: IPromptPriority;
valuesAnalysis: IPromptValues;
weightsAnalysis: IPromptWeights;
userProfile?: {
  firstName: string;
  lastName: string;
  cvSummary: string;
  userSummary: string;
};
```

**Prompt Structure:**
```
Generate essay (500-750 words) that:
1. Directly addresses essay prompt
2. Matches expected tone and personality
3. Emphasizes primary focus with proportional weighting
4. Demonstrates key values through examples
5. Addresses hidden criteria by weight
6. Uses actual applicant experiences (no fabrication)

Also identify 3-5 sections for elaboration with:
- Character position indices (0-indexed)
- Title (3-5 words)
- Explanation of improvement opportunity
- 2-4 Socratic questions
```

**Output Data Type:** `IGenerateDraft`
```typescript
interface IGenerateDraft {
  essay: string;
  sections: Array<{
    startIndex: number;
    endIndex: number;
    title: string;
    explanation: string;
    questions: string[];
  }>;
}
```

**Model Parameters:**
- Max tokens: 2048

**Database Connection:**
- Essay stored in `Essay` table
- Sections stored in `Section` table with relation to Essay

---

### Prompt 7: Custom Draft Analysis (Scoring)

**Location:** `app/lib/request.ts:547-708`

**Purpose:** Score student's custom essay against scholarship requirements

**Input Data Type:**
```typescript
scholarshipTitle: string;
scholarshipDescription: string;
essayPrompt: string;
studentEssay: string;
personalityAnalysis: IPromptPersonality;
prioritiesAnalysis: IPromptPriority;
valuesAnalysis: IPromptValues;
weightsAnalysis: IPromptWeights;
userProfile?: {...};
```

**Prompt Structure:**
```
Score across 4 dimensions:
1. Personality Alignment (tone/spirit match)
2. Priorities Alignment (emphasis on primary focus)
3. Values Alignment (demonstration of values)
4. Weights Alignment (addressing hidden criteria by weight)

For each: score (0-100), strengths, gaps, suggestions
Overall: score, 3-5 strengths, 3-5 improvements, summary
```

**Output Data Type:** `ICustomDraftAnalysis`
```typescript
interface ICustomDraftAnalysis {
  personality_alignment: {
    score: number;
    what_works: string;
    what_is_missing: string;
    suggestions: string;
  };
  priorities_alignment: { /* same structure */ };
  values_alignment: { /* same structure */ };
  weights_alignment: { /* same structure */ };
  overall: {
    overall_score: number;
    key_strengths: string[];
    critical_improvements: string[];
    summary: string;
  };
}
```

**Model Parameters:**
- Max tokens: 3072

**Validation:**
- Essay must be at least 50% of original length

---

### Prompt 8: Custom Draft Highlighting

**Location:** `app/lib/request.ts:547-708` (combined with scoring)

**Purpose:** Identify specific improvement areas in custom essay

**Input Data Type:** Same as Custom Draft Analysis

**Prompt Structure:**
```
Identify 3-5 specific sections that need improvement:
- Character indices (0-indexed, no overlap)
- Reason for improvement
- 2-4 guiding questions

Prioritize areas that would most improve alignment scores.
```

**Output Data Type:**
```typescript
{
  sections: Array<{
    startIndex: number;
    endIndex: number;
    reason: string;
    questions: string[];
  }>;
}
```

**Model Parameters:**
- Max tokens: 2048

---

### Prompt 9: Socratic Question Analysis

**Location:** `app/lib/socratic.ts:111-155`

**Purpose:** Analyze essay and generate Socratic questions for elaboration

**Input Data Type:**
```typescript
interface AnalyzeSocraticRequest {
  essayContent: string;
  scholarshipTitle?: string;
  userId?: string;
}
```

**Prompt Structure:**
```
Identify 1-5 highlighted sections (based on essay length):
- Color-coded (amber, cyan, pink, lime, purple)
- Character indices (0-indexed, validated)
- Section property: personality, value, weight, or priority
- 2-4 Socratic questions per section
- Questions address student as "You"

Include user profile context when available.
```

**Output Data Type:**
```typescript
{
  sections: Array<{
    startIndex: number;
    endIndex: number;
    color: string;
    property: 'personality' | 'value' | 'weight' | 'priority';
    questions: string[];
  }>;
}
```

**Model Parameters:**
- Max tokens: 2048

**Validation:**
- Essay must be at least 10 words

**Database Connection:**
- Sections stored with Essay
- Questions stored in Section.questions

---

### Prompt 10: Socratic Answer Integration

**Location:** `app/lib/socratic.ts:366-377`

**Purpose:** Improve essay using student's Socratic answer responses

**Input Data Type:**
```typescript
interface SubmitSocraticRequest {
  essayContent: string;
  answers: Array<{
    sectionId: string;
    questionId: number;
    answer: string;
  }>;
  userId?: string;
}
```

**Prompt Structure:**
```
Improve essay by:
1. Combining student elaborations with original essay
2. Maintaining structure, tone, first-person perspective
3. Incorporating insights naturally
4. Not fabricating details
5. Using student's actual responses

Include user profile for consistency.
```

**Output Data Type:**
```typescript
string  // Improved essay text
```

**Model Parameters:**
- Max tokens: 4096

**Database Connection:**
- New essay version saved to `Essay` table
- Linked to scholarship via `Essay.scholarshipId`

---

### Prompt 11: Feedback Analysis

**Location:** `app/lib/feedback.ts:75-110`

**Purpose:** Analyze essay and generate 2-3 improvement areas with guiding questions

**Input Data Type:**
```typescript
interface AnalyzeFeedbackRequest {
  essayContent: string;
  scholarshipTitle?: string;
  userId?: string;
}
```

**Prompt Structure:**
```
Identify 2-3 key improvement areas:
1. Description of what needs improvement
2. 2-3 thought-provoking questions per area

Focus areas:
- Adding specific examples/concrete details
- Clarifying motivations/deeper insights
- Demonstrating impact/measurable outcomes
- Making stronger connections to values/goals

Include user profile context when available.
```

**Output Data Type:**
```typescript
{
  sections: Array<{
    title: string;
    description: string;
    questions: string[];
  }>;
}
```

**Model Parameters:**
- Max tokens: 2048

**Validation:**
- Essay must be at least 20 words

---

### Prompt 12: Feedback Integration

**Location:** `app/lib/feedback.ts:265-291`

**Purpose:** Enhance essay based on feedback responses

**Input Data Type:**
```typescript
interface SubmitFeedbackRequest {
  essayContent: string;
  feedbackData: {
    sections: Array<{
      title: string;
      responses: string[];
    }>;
  };
  userId?: string;
}
```

**Prompt Structure:**
```
Enhance essay by:
1. Incorporating feedback responses
2. Expanding weak areas with concrete examples
3. Maintaining original voice and structure
4. Adding 10-20% more content for clarity
5. Not fabricating details

Include user profile for consistency.
```

**Output Data Type:**
```typescript
string  // Enhanced essay text
```

**Model Parameters:**
- Max tokens: 4096

**Validation:**
- Essay must be at least 50% of original length

---

### Prompt 13: User Profile Summarization

**Location:** `app/lib/request.ts:711-757`

**Purpose:** Summarize student's CV and personal information for context

**Input Data Type:**
```typescript
{
  firstName: string;
  lastName: string;
  cv: string;          // Resume content
  aboutYourself: string;  // Extracurricular involvement
}
```

**Prompt Structure:**
```
Generate two summaries (third person):
1. CV/Resume Summary:
   - Academic background
   - Work experience
   - Skills and achievements
   - Leadership roles
   (2-3 paragraphs)

2. User Summary:
   - Core strengths
   - Passions and interests
   - Key themes
   - What makes them stand out
   (2-3 paragraphs)
```

**Output Data Type:**
```typescript
{
  cvSummary: string;
  userSummary: string;
}
```

**Model Parameters:**
- Max tokens: 2048

**Database Connection:**
- Stored in `UserProfile` table
- Fields: `cvSummary`, `aboutSummary`

---

## Data Type Definitions

### Core Interfaces Location
**File:** `app/types/interfaces.ts`

### Scholarship Analysis Types

```typescript
// Personality Analysis
interface IPromptPersonality {
  personality_profile: {
    core_identity: string;
    tone_and_style: string[];
    communication_strategy: string;
    values_emphasized: string[];
    recommended_essay_focus: string;
    contrast_examples: {
      vs_merit_academic: string;
      vs_community_service: string;
    };
  };
}

// Priority Analysis
interface IPromptPriority {
  primary_focus: string;
  priority_weights: Record<string, number>;
  selection_signals: string[];
  success_profile: string;
  summary: string;
  confidence_score: number;
}

// Values Analysis
interface IPromptValues {
  values_emphasized: string[];
  value_definitions: Record<string, string>;
  evidence_phrases: string[];
  summary: string;
  confidence_score: number;
}

// Hidden Weights Analysis
interface IPromptWeights {
  categories: Record<string, {
    weight: number;
    subcategories: Record<string, number>;
  }>;
}
```

### Essay Generation Types

```typescript
// Draft Generation
interface IGenerateDraft {
  essay: string;
  sections: Array<{
    startIndex: number;
    endIndex: number;
    title: string;
    explanation: string;
    questions: string[];
  }>;
}

// Custom Draft Analysis
interface ICustomDraftAnalysis {
  personality_alignment: AlignmentScore;
  priorities_alignment: AlignmentScore;
  values_alignment: AlignmentScore;
  weights_alignment: AlignmentScore;
  overall: {
    overall_score: number;
    key_strengths: string[];
    critical_improvements: string[];
    summary: string;
  };
}

interface AlignmentScore {
  score: number;
  what_works: string;
  what_is_missing: string;
  suggestions: string;
}
```

### Feedback Types

```typescript
// Socratic Analysis
interface SocraticSection {
  startIndex: number;
  endIndex: number;
  color: string;
  property: 'personality' | 'value' | 'weight' | 'priority';
  questions: string[];
}

// Feedback Analysis
interface FeedbackSection {
  title: string;
  description: string;
  questions: string[];
}

// Answer Submission
interface AnswerData {
  sectionId: string;
  questionId: number;
  answer: string;
}
```

### User Profile Types

```typescript
interface UserProfile {
  firstName: string;
  lastName: string;
  cv: string;
  aboutYourself: string;
  cvSummary?: string;      // Generated by LLM
  userSummary?: string;    // Generated by LLM
}
```

---

## Data Flow and Connections

### 1. Scholarship Input Flow

```
User Input (free text)
  ↓
[Prompt 1: Scholarship Extraction] → claudeApi.ts
  ↓
{ScholarshipName, ScholarshipDescription, EssayPrompt}
  ↓
Database: Scholarship table
  ├── id (auto-generated)
  ├── title
  ├── description
  └── essayPrompt
```

### 2. Scholarship Analysis Flow

```
Scholarship {title, description, essayPrompt}
  ↓
Parallel Analysis (4 prompts) → request.ts
  ├── [Prompt 2: Personality] → PromptPersonality table
  ├── [Prompt 3: Priorities] → PromptPriority table
  ├── [Prompt 4: Values] → PromptValue table
  └── [Prompt 5: Weights] → PromptWeight table
  ↓
Scholarship.relations = {
  promptPersonality,
  promptPriority,
  promptValue,
  promptWeight
}
```

### 3. User Profile Flow

```
User {firstName, lastName, cv, aboutYourself}
  ↓
[Prompt 13: User Profile] → request.ts
  ↓
{cvSummary, userSummary}
  ↓
Database: UserProfile table
  ├── userId
  ├── cvSummary
  └── aboutSummary
```

### 4. Essay Draft Generation Flow (AI-Generated)

```
Inputs:
  - Scholarship {title, description, essayPrompt}
  - Analysis {personality, priorities, values, weights}
  - UserProfile {cvSummary, userSummary} [optional]
  ↓
[Prompt 6: Draft Generation] → request.ts
  ↓
{essay: string, sections: Section[]}
  ↓
Database:
  Essay table
    ├── id
    ├── scholarshipId
    ├── content
    └── sections → Section[]

  Section table
    ├── id
    ├── essayId
    ├── startIndex
    ├── endIndex
    ├── title
    ├── explanation
    └── questions: string[]
```

### 5. Custom Essay Analysis Flow (User-Provided)

```
Inputs:
  - studentEssay: string
  - Scholarship data
  - All 4 analyses {personality, priorities, values, weights}
  - UserProfile [optional]
  ↓
[Prompt 7: Custom Draft Scoring] → request.ts
  ↓
{
  personality_alignment: {score, strengths, gaps, suggestions},
  priorities_alignment: {...},
  values_alignment: {...},
  weights_alignment: {...},
  overall: {overall_score, strengths, improvements, summary}
}
  ↓
Display to user (not stored)
```

### 6. Socratic Feedback Loop

```
Essay (draft or custom)
  ↓
[Prompt 9: Socratic Analysis] → socratic.ts
  ↓
{sections: [{startIndex, endIndex, color, property, questions}]}
  ↓
UI: Display highlighted sections with questions
  ↓
User answers questions
  ↓
{answers: [{sectionId, questionId, answer}]}
  ↓
[Prompt 10: Socratic Integration] → socratic.ts
  ↓
improvedEssay: string
  ↓
Database: New Essay version
  ├── scholarshipId (same)
  ├── content (improved)
  └── parentEssayId (reference to original)
```

### 7. General Feedback Loop

```
Essay
  ↓
[Prompt 11: Feedback Analysis] → feedback.ts
  ↓
{sections: [{title, description, questions}]}
  ↓
UI: Display feedback sections with questions
  ↓
User provides responses
  ↓
{feedbackData: {sections: [{title, responses}]}}
  ↓
[Prompt 12: Feedback Integration] → feedback.ts
  ↓
enhancedEssay: string
  ↓
Database: New Essay version
```

---

## Component Integration

### Database Schema Connections

**Prisma Models:**

```prisma
model Scholarship {
  id                String             @id @default(uuid())
  title             String
  description       String
  essayPrompt       String
  promptPersonality PromptPersonality?
  promptPriority    PromptPriority?
  promptValue       PromptValue?
  promptWeight      PromptWeight?
  essays            Essay[]
}

model PromptPersonality {
  id             String      @id @default(uuid())
  scholarshipId  String      @unique
  scholarship    Scholarship @relation(fields: [scholarshipId])
  data           Json        // IPromptPersonality
}

model PromptPriority {
  id             String      @id @default(uuid())
  scholarshipId  String      @unique
  scholarship    Scholarship @relation(fields: [scholarshipId])
  data           Json        // IPromptPriority
}

model PromptValue {
  id             String      @id @default(uuid())
  scholarshipId  String      @unique
  scholarship    Scholarship @relation(fields: [scholarshipId])
  data           Json        // IPromptValues
}

model PromptWeight {
  id             String      @id @default(uuid())
  scholarshipId  String      @unique
  scholarship    Scholarship @relation(fields: [scholarshipId])
  data           Json        // IPromptWeights
}

model Essay {
  id            String      @id @default(uuid())
  scholarshipId String
  scholarship   Scholarship @relation(fields: [scholarshipId])
  content       String
  sections      Section[]
  createdAt     DateTime    @default(now())
}

model Section {
  id          String   @id @default(uuid())
  essayId     String
  essay       Essay    @relation(fields: [essayId])
  startIndex  Int
  endIndex    Int
  color       String?
  property    String?
  title       String?
  explanation String?
  questions   Json     // string[]
}

model UserProfile {
  userId       String  @id
  cvSummary    String?
  aboutSummary String?
}
```

### UI Components Using Prompts

**1. Navigation Component**
**File:** `app/components/Navigation.tsx`

**Prompts Used:**
- Line 735: `extractScholarshipInfo()` - Extracts scholarship data
- Line 765, 824: `requestClaude('promptWeights')` - Analyzes weights

**Data Flow:**
```
User enters scholarship →
  extractScholarshipInfo() →
    {ScholarshipName, ScholarshipDescription, EssayPrompt} →
      Save to database →
        Trigger 4 analysis prompts
```

**2. ScholarshipBlock Component**
**File:** `app/components/ScholarshipBlock.tsx`

**Displays:**
- Personality analysis results
- Priority analysis results
- Values analysis results
- Weight analysis results

**3. Whiteboard Component**
**File:** `app/components/Whiteboard.tsx`

**Prompts Used:**
- Line 415: `generateDraftWithAnalysis()` - Generates AI draft
- Line 545: `analyzeSocraticQuestions()` - Analyzes for Socratic feedback

**Data Flow:**
```
User requests draft →
  generateDraftWithAnalysis() →
    {essay, sections} →
      Display in editor →
        User can trigger Socratic analysis →
          analyzeSocraticQuestions() →
            {highlighted sections, questions}
```

### API Wrapper Layer

**Feedback API Wrapper**
**File:** `app/lib/dynamicFeedback/feedbackApi.ts`

**Exports:**
```typescript
export {
  analyzeSocraticQuestions,
  submitSocraticAnswers,
  analyzeFeedback,
  submitFeedbackAnswers
}
```

**Purpose:** Provides clean interface for UI components to access feedback functionality

---

## Prompt Design Patterns

### Common Patterns Across All Prompts

1. **JSON-Only Output**
   - All prompts explicitly request "ONLY valid JSON"
   - No markdown code blocks allowed
   - Strict schema enforcement

2. **User Context Integration**
   - When `userId` provided, includes user profile summaries
   - Personalizes prompts with "You" addressing student
   - Never uses student's name in prompts

3. **Character-Based Indexing**
   - All highlighting uses 0-indexed character positions
   - Not word positions or line numbers
   - Enables precise text highlighting in UI

4. **Validation Requirements**
   - Minimum word counts enforced
   - Schema validation on responses
   - Error handling for malformed JSON

5. **No Fabrication Policy**
   - Explicit instructions to use only provided information
   - No making up details about student
   - Uses placeholder language when info unavailable

6. **Progressive Enhancement**
   - Base prompts work without user profile
   - Enhanced quality when profile provided
   - Graceful degradation

---

## Token Allocation Strategy

| Prompt Type | Max Tokens | Rationale |
|---|---|---|
| Extraction | 1024 | Simple structured output |
| Analysis (4 types) | 1024 | Moderate JSON structures |
| Draft Generation | 2048 | Full essay + sections |
| Custom Analysis | 3072 | Detailed scoring + feedback |
| Socratic Analysis | 2048 | Multiple sections + questions |
| Essay Improvement | 4096 | Full essay rewrite |
| Feedback Analysis | 2048 | 2-3 sections + questions |
| Feedback Integration | 4096 | Full essay enhancement |
| User Profile | 2048 | Two detailed summaries |

**Total Token Budget:**
- Analysis Phase: ~6 prompts × 1024-2048 = 6,144-12,288 tokens
- Essay Phase: 1-2 prompts × 2048-4096 = 2,048-8,192 tokens
- Iteration Phase: 1-2 prompts × 4096 = 4,096-8,192 tokens

---

## Error Handling

### Common Validation Checks

```typescript
// Minimum essay length
if (essayContent.split(' ').length < 10) {
  throw new Error("Essay must be at least 10 words");
}

// JSON parsing
try {
  const result = JSON.parse(response.content[0].text);
} catch (error) {
  throw new Error("Failed to parse LLM response as JSON");
}

// Character index validation
if (section.startIndex < 0 || section.endIndex > essayContent.length) {
  throw new Error("Invalid character indices");
}

// Weight sum validation
const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
if (Math.abs(totalWeight - 1.0) > 0.01) {
  throw new Error("Weights must sum to 1.0");
}
```

---

## Performance Considerations

### Parallel Execution
```typescript
// All 4 analyses run in parallel
const [personality, priorities, values, weights] = await Promise.all([
  requestClaude('promptPersonality', ...),
  requestClaude('promptPriority', ...),
  requestClaude('promptValue', ...),
  requestClaude('promptWeights', ...)
]);
```

### Caching Strategy
- Scholarship analyses cached in database
- Only regenerate if scholarship data changes
- User profile summaries cached per user
- Essay analyses ephemeral (not cached)

### Rate Limiting
- Anthropic API: 50 requests/minute (tier-dependent)
- Consider implementing request queuing for bulk operations
- Current implementation: Sequential for feedback loops, parallel for analyses

---

## Security Considerations

### API Key Management
```typescript
// Environment variable required
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error("ANTHROPIC_API_KEY not configured");
}
```

### Input Sanitization
- No SQL injection risk (using Prisma ORM)
- JSON parsing wrapped in try-catch
- Character indices validated before use
- No user input directly interpolated into prompts

### Data Privacy
- User profile data stored securely
- No PII sent to Anthropic beyond what user provides
- Essays and analyses linked to anonymous userId
- No third-party analytics on essay content

---

## Future Enhancement Opportunities

1. **Prompt Versioning**
   - Track prompt template versions
   - A/B test different prompt formulations
   - Rollback capability for regression

2. **Response Quality Monitoring**
   - Log confidence scores
   - Track JSON parsing failures
   - Monitor token usage patterns

3. **Adaptive Token Allocation**
   - Adjust max_tokens based on input length
   - Dynamic token budgets for complex scholarships

4. **Multi-Model Support**
   - Fallback to different models if primary fails
   - Cost optimization with model selection

5. **Prompt Chaining Optimization**
   - Reduce redundant context in sequential prompts
   - Cache intermediate results more aggressively

---

## Summary Table: All Prompts

| # | Prompt Name | File | Function | Input | Output | Tokens | Database |
|---|---|---|---|---|---|---|---|
| 1 | Scholarship Extraction | claudeApi.ts | extractScholarshipInfo | Free text | {name, desc, prompt} | 1024 | Scholarship |
| 2 | Personality Profile | request.ts | requestClaude('promptPersonality') | Scholarship data | IPromptPersonality | 1024 | PromptPersonality |
| 3 | Priorities Analysis | request.ts | requestClaude('promptPriority') | Scholarship data | IPromptPriority | 1024 | PromptPriority |
| 4 | Values Analysis | request.ts | requestClaude('promptValue') | Scholarship data | IPromptValues | 1024 | PromptValue |
| 5 | Hidden Weights | request.ts | requestClaude('promptWeights') | Scholarship data | IPromptWeights | 1024 | PromptWeight |
| 6 | Draft Generation | request.ts | requestClaude('generateDraft') | All analyses + profile | IGenerateDraft | 2048 | Essay + Section |
| 7 | Custom Draft Scoring | request.ts | requestClaude('analyzeCustomDraft') | Essay + analyses | ICustomDraftAnalysis | 3072 | None |
| 8 | Custom Draft Highlighting | request.ts | (within analyzeCustomDraft) | Essay + analyses | {sections} | 2048 | Section |
| 9 | Socratic Analysis | socratic.ts | analyzeSocratic | Essay | {sections, questions} | 2048 | Section |
| 10 | Socratic Integration | socratic.ts | submitSocraticAnswers | Essay + answers | Improved essay | 4096 | Essay |
| 11 | Feedback Analysis | feedback.ts | analyzeFeedback | Essay | {sections, questions} | 2048 | None |
| 12 | Feedback Integration | feedback.ts | submitFeedback | Essay + responses | Enhanced essay | 4096 | Essay |
| 13 | User Profile Summary | request.ts | requestClaude('processUserProfile') | CV + about | {cvSummary, userSummary} | 2048 | UserProfile |

---

**Document Version:** 1.0
**Last Updated:** 2025-01-23
**Maintainer:** Development Team
