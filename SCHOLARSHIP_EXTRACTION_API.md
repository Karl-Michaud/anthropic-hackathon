# Scholarship Extraction Pipeline API

This pipeline extracts structured information from scholarship descriptions in TXT, JSON, and PDF formats.

## Overview

The pipeline uses Claude (Anthropic) to intelligently extract:
- **title**: Scholarship name
- **criteria**: Best matching scholarship type (from FRD Section 2.3)
- **amount**: Monetary value with $ sign
- **deadline**: Application deadline in DD-MM-YYYY format
- **eligibility**: Array of applicant requirements

## Installation

1. Install dependencies:
```bash
cd app
npm install
```

This will install:
- `@anthropic-ai/sdk` - Anthropic Claude SDK
- `pdf-parse` - PDF parsing library

2. Set up environment variables:

Create a `.env.local` file in the `app/` directory:
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

## API Endpoint

### POST /api/extract-scholarship

Extracts scholarship information from text input.

**Request Body:**
```typescript
{
  "content": string,      // File content (base64 for PDF, string for TXT/JSON)
  "fileType": "txt" | "json" | "pdf"
}
```

**Response:**
```typescript
{
  "success": boolean,
  "data": {
    "title": string,
    "criteria": "innovation_tech" | "merit_academic" | "community_service" | "leadership_entrepreneurial" | "Missing",
    "amount": string,       // e.g., "$5000"
    "deadline": string,     // Format: DD-MM-YYYY
    "eligibility": string[]
  },
  "error"?: string
}
```

## Scholarship Criteria Types

Based on FRD Section 2.3, the pipeline matches scholarships to these types:

| Type | Keywords |
|------|----------|
| **innovation_tech** | innovation, creative, iterate, experiment, technical, build, learning from failure, hands-on projects, real-world impact |
| **merit_academic** | academic, excellence, achievement, GPA, merit, honors, academic performance, scholastic achievement, high standards |
| **community_service** | community, service, volunteer, impact, giving back, help others, community impact, service to others, making a difference |
| **leadership_entrepreneurial** | leadership, entrepreneurial, initiative, founded, started, organized, took initiative, led a team, created from scratch |

## Usage Examples

### Example 1: TXT Format

```bash
curl -X POST http://localhost:3000/api/extract-scholarship \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Tech Innovators Scholarship\n\nAward: $5,000\n\nDeadline: March 15, 2025\n\nThis scholarship is for students who demonstrate innovation and creativity in technical projects. Applicants must be enrolled in a STEM program with a GPA of 3.5 or higher.",
    "fileType": "txt"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Tech Innovators Scholarship",
    "criteria": "innovation_tech",
    "amount": "$5,000",
    "deadline": "15-03-2025",
    "eligibility": [
      "Must be enrolled in a STEM program",
      "GPA of 3.5 or higher"
    ]
  }
}
```

### Example 2: JSON Format

```bash
curl -X POST http://localhost:3000/api/extract-scholarship \
  -H "Content-Type: application/json" \
  -d '{
    "content": "{\"name\": \"Community Leaders Award\", \"value\": \"$10000\", \"due_date\": \"2025-06-30\", \"description\": \"For students who have demonstrated exceptional community service and volunteer work. Must have completed 100+ hours of community service.\"}",
    "fileType": "json"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Community Leaders Award",
    "criteria": "community_service",
    "amount": "$10,000",
    "deadline": "30-06-2025",
    "eligibility": [
      "Must have completed 100+ hours of community service"
    ]
  }
}
```

### Example 3: PDF Format

```javascript
// Frontend example using File API
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

// Convert PDF to base64
const reader = new FileReader();
reader.onload = async (e) => {
  const base64 = e.target.result.split(',')[1];

  const response = await fetch('/api/extract-scholarship', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: base64,
      fileType: 'pdf'
    })
  });

  const result = await response.json();
  console.log(result);
};
reader.readAsDataURL(file);
```

### Example 4: Using Node.js/TypeScript

```typescript
import fs from 'fs';

async function extractScholarship(filePath: string, fileType: 'txt' | 'json' | 'pdf') {
  let content: string;

  if (fileType === 'pdf') {
    // Read as base64 for PDF
    content = fs.readFileSync(filePath, 'base64');
  } else {
    // Read as text for TXT/JSON
    content = fs.readFileSync(filePath, 'utf-8');
  }

  const response = await fetch('http://localhost:3000/api/extract-scholarship', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, fileType })
  });

  return await response.json();
}

// Usage
const result = await extractScholarship('./scholarship.txt', 'txt');
console.log(result);
```

## Missing Fields

If any field cannot be determined from the input, it will be set to:
- **Strings**: `"Missing"`
- **Arrays**: `"Missing"`

Example:
```json
{
  "success": true,
  "data": {
    "title": "Some Scholarship",
    "criteria": "innovation_tech",
    "amount": "Missing",
    "deadline": "Missing",
    "eligibility": "Missing"
  }
}
```

## Error Handling

### Invalid File Type
```json
{
  "success": false,
  "error": "Invalid or missing fileType. Must be: txt, json, or pdf"
}
```

### Empty Content
```json
{
  "success": false,
  "error": "File content is empty or could not be parsed"
}
```

### PDF Parsing Error
```json
{
  "success": false,
  "error": "PDF parsing requires 'pdf-parse' package. Install with: npm install pdf-parse"
}
```

### LLM Extraction Error
```json
{
  "success": false,
  "error": "Failed to extract scholarship information: <error details>"
}
```

## File Structure

```
app/
├── app/
│   ├── api/
│   │   └── extract-scholarship/
│   │       └── route.ts              # API endpoint
│   ├── lib/
│   │   ├── file-parser.ts            # File parsing utilities
│   │   └── scholarship-extractor.ts  # LLM extraction logic
│   └── types/
│       └── scholarship-extraction.ts # TypeScript types
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
# Create a test file
echo "Academic Excellence Scholarship
Award: $2500
Deadline: April 1, 2025
For students with GPA 3.8 or higher" > test.txt

# Test the endpoint
curl -X POST http://localhost:3000/api/extract-scholarship \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"$(cat test.txt)\", \"fileType\": \"txt\"}"
```

## Integration with Existing System

This extraction pipeline is designed to work with the Dynamic Essay Optimizer system (see FRD). The extracted `criteria` field maps directly to the scholarship formulas:

- `innovation_tech` → Innovation-Focused Technical Scholarship formula
- `merit_academic` → Merit-Based Academic Scholarship formula
- `community_service` → Community Service Leadership Scholarship formula
- `leadership_entrepreneurial` → Leadership & Entrepreneurial Scholarship formula

## Performance

- **Average extraction time**: 2-4 seconds
- **Supported file size**: Up to 10MB (configurable)
- **Model used**: Claude Sonnet 4.5

## Notes

- The LLM intelligently converts various date formats to DD-MM-YYYY
- Dollar amounts are normalized to include $ sign
- Eligibility requirements are extracted as individual items
- The criteria matching uses keyword density analysis from the scholarship description
