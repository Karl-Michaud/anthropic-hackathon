# Adaptive Weighting Algorithm API

This API analyzes scholarship descriptions and generates weighted criteria for essay optimization based on hidden signals in the scholarship text.

## Overview

The adaptive weighting algorithm uses Claude (Anthropic) to analyze scholarship descriptions and assign weights to 10 primary categories and their subcategories, identifying what the scholarship committee truly values.

## API Endpoint

### POST /api/adaptive-weighting

Analyzes scholarship information and generates weighted criteria.

**Request Body:**
```typescript
{
  "ScholarshipName": string,        // Name of the scholarship
  "ScholarshipDescription": string, // Full scholarship description
  "EssayPrompt": string            // The essay prompt to answer
}
```

**Response:**
```typescript
{
  "success": boolean,
  "data": AdaptiveWeightingOutput,  // See structure below
  "error"?: string
}
```

## Weight Categories

The algorithm analyzes 10 primary categories, each with 3 subcategories. Primary weights sum to 1.0, and subcategory weights within each category sum to 1.0.

### 1. Sustained Depth Over Resume Padding

Signals: long-term commitment, progression, depth over breadth

| Subcategory | Description |
|-------------|-------------|
| Multi-year commitment | 3+ years in primary activities - highest differentiator |
| Progressive responsibility | Evolution from participant to leader/founder |
| Consistency of theme | Thematic coherence across activities |

### 2. Values-Driven Decision Making

Signals: motivation, character, authenticity

| Subcategory | Description |
|-------------|-------------|
| Why over what | Motivation for choices equally weighted with character |
| Character under pressure | How you respond when tested |
| Authentic alignment | Natural fit with scholarship values |

### 3. Problem-Solving Orientation

Signals: problem identification, solutions, outcomes

| Subcategory | Description |
|-------------|-------------|
| Problem identification | Seeing specific gaps/failures |
| Solution creation | Developing new approaches |
| Measurable outcomes | Quantified impact |

### 4. Entrepreneurial vs. Theoretical Mindset

Signals: creation, innovation, real-world application

| Subcategory | Description |
|-------------|-------------|
| Commercial/social viability | Real-world application potential |
| Creation evidence | Founded, developed, launched |
| Innovation iteration | Multiple design attempts |

### 5. Future Investment Potential

Signals: future contribution, scalability, knowledge sharing

| Subcategory | Description |
|-------------|-------------|
| Canadian contribution | Commitment to Canadian society/economy |
| Scalable impact vision | Solutions that can grow |
| Knowledge translation | Teaching/mentoring plans |

### 6. Adversity Plus Agency

Signals: resilience, active response to challenges

| Subcategory | Description |
|-------------|-------------|
| Service despite struggle | Maintaining humanitarian commitment - dominant |
| Active response | What you did, not what happened |
| Challenge specificity | Concrete obstacles faced |

### 7. Interview Performance

Signals: multi-stage selection, character assessment

| Subcategory | Description |
|-------------|-------------|
| Multi-stage assessment | Character through extended interaction |
| Values articulation | Equal weight with assessment |
| Pressure testing | Maintaining authenticity under stress |

### 8. Language Mirroring & Framing

Signals: specific terminology that should be echoed

| Subcategory | Description |
|-------------|-------------|
| Scholarship-specific language | Using their exact terminology |
| Story selection | Leading with aligned experiences |
| Authentic positioning | Same facts, different emphasis |

### 9. Regional & Nomination Strategy

Signals: geographic preferences, nomination requirements

| Subcategory | Description |
|-------------|-------------|
| Geographic advantage | Regional preferences (2.5x in Territories, 2.25x in Atlantic) |
| School nomination | 1-4 nominee bottleneck |
| Regional narrative | Local community connection |

### 10. Academic Threshold Sufficiency

Signals: academic requirements and intellectual signals

| Subcategory | Description |
|-------------|-------------|
| Intellectual curiosity | Self-directed learning most important |
| Applied knowledge | Using academics to solve problems |
| Meeting minimums | 75-85% sufficient - least important |

## Usage Examples

### Example 1: Basic Request

```bash
curl -X POST http://localhost:3000/api/adaptive-weighting \
  -H "Content-Type: application/json" \
  -d '{
    "ScholarshipName": "Tech Innovation Award",
    "ScholarshipDescription": "This $5,000 scholarship supports students who demonstrate innovation and problem-solving in technology. We value hands-on projects, creative solutions, and measurable impact. Deadline: March 15, 2025.",
    "EssayPrompt": "Describe a technical project where you identified a problem and created an innovative solution."
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "Sustained Depth Over Resume Padding": {
      "weight": 0.08,
      "subweights": {
        "Multi-year commitment": 0.30,
        "Progressive responsibility": 0.35,
        "Consistency of theme": 0.35
      }
    },
    "Problem-Solving Orientation": {
      "weight": 0.25,
      "subweights": {
        "Problem identification": 0.40,
        "Solution creation": 0.35,
        "Measurable outcomes": 0.25
      }
    },
    "Entrepreneurial vs. Theoretical Mindset": {
      "weight": 0.22,
      "subweights": {
        "Commercial/social viability": 0.30,
        "Creation evidence": 0.40,
        "Innovation iteration": 0.30
      }
    }
  }
}
```

### Example 2: Using with Scholarship Extraction Pipeline

```javascript
// First extract scholarship info
const extractionResponse = await fetch('/api/extract-scholarship', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: scholarshipDocument,
    fileType: 'pdf'
  })
});

const { data: scholarship } = await extractionResponse.json();

// Then generate adaptive weights
const weightingResponse = await fetch('/api/adaptive-weighting', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ScholarshipName: scholarship.ScholarshipName,
    ScholarshipDescription: scholarship.ScholarshipDescription,
    EssayPrompt: scholarship.EssayPrompt
  })
});

const { data: weights } = await weightingResponse.json();
console.log(weights);
```

### Example 3: Node.js/TypeScript

```typescript
import {
  AdaptiveWeightingRequest,
  AdaptiveWeightingResponse
} from './app/types/adaptive-weighting';

async function getScholarshipWeights(
  name: string,
  description: string,
  prompt: string
): Promise<AdaptiveWeightingResponse> {
  const request: AdaptiveWeightingRequest = {
    ScholarshipName: name,
    ScholarshipDescription: description,
    EssayPrompt: prompt
  };

  const response = await fetch('http://localhost:3000/api/adaptive-weighting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  return await response.json();
}

// Usage
const result = await getScholarshipWeights(
  'Loran Award',
  'The Loran Award values character, service, and leadership...',
  'Describe a time when you demonstrated leadership...'
);

// Get top weighted categories
const topCategories = Object.entries(result.data)
  .sort((a, b) => b[1].weight - a[1].weight)
  .slice(0, 3);

console.log('Top priorities for this essay:', topCategories);
```

## Response Structure

The full response includes all 10 categories:

```typescript
{
  "Sustained Depth Over Resume Padding": {
    "weight": number,  // Primary weight (all sum to 1.0)
    "subweights": {
      "Multi-year commitment": number,      // Subweights sum to 1.0
      "Progressive responsibility": number,
      "Consistency of theme": number
    }
  },
  "Values-Driven Decision Making": {
    "weight": number,
    "subweights": {
      "Why over what": number,
      "Character under pressure": number,
      "Authentic alignment": number
    }
  },
  // ... remaining 8 categories with same structure
}
```

## Using Weights for Essay Generation

The weights can be used to:

1. **Allocate essay space** proportionally to category weights
2. **Prioritize stories** that align with highest-weighted categories
3. **Emphasize subcategories** based on their relative weights
4. **Mirror language** from scholarship description

Example weight interpretation:
- If "Adversity Plus Agency" has weight 0.20 (20%), dedicate ~20% of essay to resilience/challenges
- If "Service despite struggle" subcategory has weight 0.50, lead that section with service during hardship

## Error Handling

### Missing Required Fields
```json
{
  "success": false,
  "error": "Missing required field: ScholarshipName"
}
```

### LLM Error
```json
{
  "success": false,
  "error": "Failed to generate adaptive weights: <error details>"
}
```

## File Structure

```
app/
├── app/
│   ├── api/
│   │   └── adaptive-weighting/
│   │       └── route.ts              # API endpoint
│   ├── lib/
│   │   └── adaptive-weighting-extractor.ts  # LLM weight generation
│   └── types/
│       └── adaptive-weighting.ts     # TypeScript types
└── package.json
```

## Development

### Run the dev server:
```bash
cd app
npm run dev
```

### Test the API:
```bash
node examples/test-adaptive-weighting.js
```

## Integration with Essay Optimizer

This adaptive weighting algorithm integrates with the Dynamic Essay Optimizer system:

1. **Scholarship Extraction** → Extract scholarship info from documents
2. **Adaptive Weighting** → Generate weighted criteria from description
3. **User Response Collection** → Gather targeted information based on weights
4. **Essay Generation** → Create essay emphasizing weighted categories

The weights directly inform:
- Which questions to ask the user
- How much essay space to allocate per category
- Which stories/experiences to highlight
- Language and framing choices

## Performance

- **Average analysis time**: 3-5 seconds
- **Model used**: Claude Sonnet 4.5
- **Max tokens**: 4096

## Notes

- Weights are automatically normalized if they don't sum to exactly 1.0
- The algorithm identifies both explicit and implicit signals in the text
- Regional weighting (category 9) may be lower for scholarships without geographic focus
- Academic threshold (category 10) is typically weighted lower as it's a baseline requirement
