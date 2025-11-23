# Dynamic Feedback Component - Implementation Plan

## Overview
Create a dynamic feedback panel system that appears on the whiteboard when users click "Get Feedback" on an essay. The panel will analyze the essay against scholarship requirements and present targeted questions to help improve the submission.

---

## 📁 Component Structure

```
app/components/DynamicFeedback/
├── index.ts                      # Export all components
├── core/
│   ├── Question.tsx              # Individual question with text input
│   ├── FeedbackSection.tsx       # Section grouping related questions
│   └── FeedbackPanel.tsx         # Main panel container
├── types.ts                      # TypeScript interfaces
└── utils/
    └── feedbackApi.ts            # API functions (empty/stub for now)
```

---

## 🎯 Implementation Steps

### **Step 1: Create Type Definitions** (`types.ts`)
Define all TypeScript interfaces:

```typescript
export interface Question {
  id: string
  text: string
  answer: string
  placeholder?: string
}

export interface FeedbackSection {
  id: string
  title: string
  description?: string
  questions: Question[]
  isComplete: boolean
}

export interface FeedbackData {
  id: string // feedback panel ID
  essayId: string
  scholarshipId: string
  problemTitle: string
  sections: FeedbackSection[]
  createdAt: number
}

export interface FeedbackPanelProps {
  data: FeedbackData
  onClose: () => void
  onSectionAnswerChange: (sectionId: string, questionId: string, answer: string) => void
  onSectionComplete: (sectionId: string) => void
  onSubmitToAI: () => void
}
```

---

### **Step 2: Create Question Component** (`core/Question.tsx`)

**Props:**
```typescript
interface QuestionProps {
  question: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}
```

**Features:**
- Multiline textarea (auto-resize)
- Tailwind styling matching existing design
- Optional character counter
- Placeholder text

**Styling:**
- Question text: `text-sm font-medium text-gray-700 mb-2`
- Textarea: `w-full p-3 border border-gray-300 rounded-lg resize-none`
- Focus state: `focus:ring-2 focus:ring-blue-500 focus:border-blue-500`

---

### **Step 3: Create FeedbackSection Component** (`core/FeedbackSection.tsx`)

**Props:**
```typescript
interface FeedbackSectionProps {
  title: string
  description?: string
  questions: Question[]
  isComplete: boolean
  onAnswerChange: (questionId: string, answer: string) => void
  onComplete: () => void
}
```

**Features:**
- Render all Question components
- "Complete Section" button at bottom
- Button disabled until all questions have non-empty answers
- Visual completion indicator (green border, checkmark)
- Section background changes when complete

**Styling:**
- Container: `border rounded-lg p-5 mb-4`
- Incomplete: `border-gray-300 bg-white`
- Complete: `border-green-500 bg-green-50`
- Title: `text-lg font-semibold text-gray-900 mb-2`
- Complete button: `bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300`
- Complete indicator: Green checkmark icon + "Completed" text

---

### **Step 4: Create FeedbackPanel Component** (`core/FeedbackPanel.tsx`)

**Props:**
```typescript
interface FeedbackPanelProps {
  data: FeedbackData
  onClose: () => void
  onSectionAnswerChange: (sectionId: string, questionId: string, answer: string) => void
  onSectionComplete: (sectionId: string) => void
  onSubmitToAI: () => void
}
```

**Features:**
- Fixed width: 600px (adjustable based on preference 500-700px)
- Height: Match sidebar height or auto-scroll if needed
- Header with problem title
- Close button (X) in top-right
- Scrollable content area
- Render all FeedbackSection components
- "Send to AI" button at bottom
  - Enabled only when ALL sections are complete
  - Shows count: "2/3 sections complete" when incomplete

**Layout Structure:**
```
┌─────────────────────────────────────┐
│  [X] Hidden Weight Type: Resiliency │
│      (40%)                           │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ Section 1: Missing Experience   ││
│  │ ┌─────────────────────────────┐ ││
│  │ │ Q: What challenges overcome? │ ││
│  │ │ [Textarea]                  │ ││
│  │ └─────────────────────────────┘ ││
│  │ [✓ Complete Section]            ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Section 2: Impact Description   ││
│  │ ┌─────────────────────────────┐ ││
│  │ │ Q: How did it change you?   │ ││
│  │ │ [Textarea]                  │ ││
│  │ └─────────────────────────────┘ ││
│  │ [ Complete Section ]            ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  [Send to AI] (2/3 complete)       │
└─────────────────────────────────────┘
```

**Styling:**
- Container: `w-[600px] bg-white rounded-xl shadow-lg border border-gray-200`
- Header: `p-6 border-b border-gray-200`
- Title: `text-2xl font-bold text-gray-900`
- Close button: `absolute top-4 right-4 text-gray-400 hover:text-gray-600`
- Content area: `p-6 overflow-y-auto` with max-height
- Footer: `p-6 border-t border-gray-200`
- Send button: `bg-green-600 text-white px-6 py-3 rounded-lg disabled:bg-gray-300`

---

### **Step 5: Create API Functions** (`utils/feedbackApi.ts`)

#### Function Signatures:

```typescript
/**
 * Analyze essay and return feedback data
 * STUB: Returns null for now
 * FUTURE: Call AI to analyze essay against requirements
 */
export async function analyzeFeedback(
  essayId: string,
  scholarshipId: string
): Promise<FeedbackData | null> {
  // TODO: Implement AI analysis
  console.log('analyzeFeedback called:', { essayId, scholarshipId })
  return null
}

/**
 * Submit completed feedback answers to AI
 * STUB: Console logs data for now
 * FUTURE: Send to backend/AI pipeline
 */
export async function submitFeedbackAnswers(
  feedbackData: FeedbackData
): Promise<void> {
  // TODO: Implement submission to backend
  console.log('submitFeedbackAnswers called:', feedbackData)
}

/**
 * Auto-save feedback progress
 * IMPLEMENTATION: Save to localStorage
 */
export function saveFeedbackDraft(feedbackData: FeedbackData): void {
  const key = `feedback-draft-${feedbackData.essayId}`
  localStorage.setItem(key, JSON.stringify(feedbackData))
}

/**
 * Load saved feedback draft
 * IMPLEMENTATION: Load from localStorage
 */
export function loadFeedbackDraft(essayId: string): FeedbackData | null {
  const key = `feedback-draft-${essayId}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}

/**
 * Clear feedback draft after successful submission
 * IMPLEMENTATION: Remove from localStorage
 */
export function clearFeedbackDraft(essayId: string): void {
  const key = `feedback-draft-${essayId}`
  localStorage.removeItem(key)
}
```

---

### **Step 6: Integration with Whiteboard Context** (`context/WhiteboardContext.tsx`)

Add feedback panel management:

```typescript
// Add to context state
const [feedbackPanels, setFeedbackPanels] = useState<FeedbackData[]>([])

// Add functions
const addFeedbackPanel = (data: FeedbackData) => {
  setFeedbackPanels(prev => [...prev, data])
  saveFeedbackDraft(data) // Auto-save
}

const updateFeedbackPanel = (feedbackId: string, updates: Partial<FeedbackData>) => {
  setFeedbackPanels(prev =>
    prev.map(panel =>
      panel.id === feedbackId
        ? { ...panel, ...updates }
        : panel
    )
  )
  // Auto-save updated panel
  const updatedPanel = feedbackPanels.find(p => p.id === feedbackId)
  if (updatedPanel) {
    saveFeedbackDraft({ ...updatedPanel, ...updates })
  }
}

const deleteFeedbackPanel = (feedbackId: string) => {
  const panel = feedbackPanels.find(p => p.id === feedbackId)
  if (panel) {
    clearFeedbackDraft(panel.essayId)
  }
  setFeedbackPanels(prev => prev.filter(p => p.id !== feedbackId))
}

// Load drafts on mount
useEffect(() => {
  essays.forEach(essay => {
    const draft = loadFeedbackDraft(essay.id)
    if (draft && !feedbackPanels.find(p => p.essayId === essay.id)) {
      setFeedbackPanels(prev => [...prev, draft])
    }
  })
}, [essays])
```

---

### **Step 7: Render Feedback Panels in Whiteboard** (`components/Whiteboard.tsx`)

Position and render feedback panels:

```typescript
// Initialize positions for new feedback panels (to LEFT of essay)
useEffect(() => {
  feedbackPanels.forEach((panel) => {
    const existing = blockPositions.find((p) => p.id === panel.id)
    if (!existing) {
      const essayPos = blockPositions.find((p) => p.id === panel.essayId)
      // Position 650px to the LEFT of essay
      const canvasX = essayPos ? essayPos.x - 650 : 100
      const canvasY = essayPos ? essayPos.y : 100
      const clamped = clampToCanvas(canvasX, canvasY)
      updateBlockPosition(panel.id, clamped.x, clamped.y)

      // Auto-focus to show both feedback and essay
      focusOnFeedbackAndEssay(panel.id, panel.essayId)
    }
  })
}, [feedbackPanels, blockPositions])

// Auto-focus helper
const focusOnFeedbackAndEssay = (feedbackId: string, essayId: string) => {
  const feedbackPos = getBlockPosition(feedbackId)
  const essayPos = getBlockPosition(essayId)

  // Calculate bounding box
  const minX = feedbackPos.x
  const maxX = essayPos.x + 500 // essay width
  const minY = Math.min(feedbackPos.y, essayPos.y)
  const maxY = Math.max(feedbackPos.y + 600, essayPos.y + 400)

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const width = maxX - minX
  const height = maxY - minY

  // Calculate zoom to fit both with padding
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const zoomX = viewportWidth / (width * 1.2)
  const zoomY = viewportHeight / (height * 1.2)
  const newZoom = Math.min(Math.max(zoomX, zoomY), 1.0)

  // Center viewport
  const viewportCenterX = viewportWidth / 2
  const viewportCenterY = viewportHeight / 2
  setPosition({
    x: viewportCenterX - centerX * newZoom,
    y: viewportCenterY - centerY * newZoom
  })
  setZoom(newZoom)
}

// Render feedback panels
{feedbackPanels.map((feedbackData) => {
  const pos = getBlockPosition(feedbackData.id)
  return (
    <DraggableBlock
      key={feedbackData.id}
      id={feedbackData.id}
      x={pos.x}
      y={pos.y}
      isDragging={draggingCellId === feedbackData.id}
      isSelected={selectedIds.has(feedbackData.id)}
      zoom={zoom}
      onMouseDown={handleBlockMouseDown}
      onContextMenu={(e, blockId) => handleContextMenu(e, blockId)}
    >
      <FeedbackPanel
        data={feedbackData}
        onClose={() => deleteFeedbackPanel(feedbackData.id)}
        onSectionAnswerChange={(sectionId, questionId, answer) => {
          // Update section answer
          const updatedSections = feedbackData.sections.map(section =>
            section.id === sectionId
              ? {
                  ...section,
                  questions: section.questions.map(q =>
                    q.id === questionId ? { ...q, answer } : q
                  )
                }
              : section
          )
          updateFeedbackPanel(feedbackData.id, { sections: updatedSections })
        }}
        onSectionComplete={(sectionId) => {
          // Mark section as complete
          const updatedSections = feedbackData.sections.map(section =>
            section.id === sectionId ? { ...section, isComplete: true } : section
          )
          updateFeedbackPanel(feedbackData.id, { sections: updatedSections })
        }}
        onSubmitToAI={async () => {
          await submitFeedbackAnswers(feedbackData)
          deleteFeedbackPanel(feedbackData.id) // Remove after submission
        }}
      />
    </DraggableBlock>
  )
})}
```

---

## 💾 Persistence Implementation

### **localStorage Schema:**
```
Key: `feedback-draft-${essayId}`
Value: JSON stringified FeedbackData object
```

### **Auto-save Triggers:**
- When user types an answer (debounced)
- When section is marked complete
- When panel is closed without submission

### **Load on Mount:**
- Check localStorage for drafts matching each essay
- Restore feedback panels with all progress
- Position panels at saved locations

### **Clear on Completion:**
- Only clear localStorage when "Send to AI" is successfully submitted
- If submission fails, keep the draft

---

## 🔮 Future Additions - AI Analysis Pipeline

### **Phase 1: Essay Analysis**
When user clicks "Get Feedback" button:
1. Extract essay content and scholarship requirements
2. Send to Claude API with structured prompt
3. AI analyzes:
   - Explicit requirements vs essay content
   - Hidden requirements (resiliency, leadership, etc.)
   - Weighted trait gaps based on `adaptiveWeights`
4. Return structured feedback:
   - Problem title (e.g., "Missing Resiliency (40%)")
   - Multiple sections with targeted questions
   - Contextual descriptions

### **Phase 2: Dynamic Question Generation**
AI generates personalized questions based on:
- Specific gaps identified in the essay
- Scholarship's explicit requirements
- Hidden requirements
- Adaptive weight deficiencies

**Example AI Prompt:**
```
Analyze this essay against the scholarship requirements and generate targeted questions.

Scholarship: {title}
Description: {description}
Essay Prompt: {prompt}
Hidden Requirements: {hiddenRequirements}
Adaptive Weights: {adaptiveWeights}

Essay Content:
{essayContent}

Generate feedback in this JSON format:
{
  "problemTitle": "Missing [trait] ([weight]%)",
  "sections": [
    {
      "id": "unique-id",
      "title": "Section Title",
      "description": "What needs addressing",
      "questions": [
        {
          "id": "unique-id",
          "text": "Specific question",
          "placeholder": "Example answer",
          "answer": ""
        }
      ],
      "isComplete": false
    }
  ]
}
```

### **Phase 3: Answer Processing**
When user clicks "Send to AI":
1. Collect all section answers
2. Send to Claude API with full context:
   - Original essay content
   - Scholarship requirements
   - User's answers to all questions
3. AI generates:
   - Suggested essay improvements
   - Specific paragraph rewrites
   - New content based on answers
   - Tone/style recommendations
4. Display suggestions:
   - New panel with recommendations
   - Inline diff view
   - "Apply suggestion" buttons

### **Phase 4: Iterative Improvement Loop**
- Allow multiple feedback rounds
- Track improvement history
- Show before/after comparisons
- Visualize which requirements are satisfied
- Progress indicator for scholarship match percentage

---

## ✅ Completion Criteria

**Definition of Done:**
- [ ] All TypeScript types defined in `types.ts`
- [ ] Question component renders and handles input
- [ ] FeedbackSection component manages questions and completion
- [ ] FeedbackPanel component renders all sections
- [ ] API utility functions created (stub implementations)
- [ ] Feedback panels render on whiteboard canvas
- [ ] Feedback panels positioned to LEFT of essays
- [ ] Auto-focus centers both feedback panel and essay
- [ ] Section completion tracking works correctly
- [ ] "Send to AI" button enabled only when all sections complete
- [ ] localStorage persistence implemented:
  - [ ] Auto-save on answer change
  - [ ] Auto-save on section completion
  - [ ] Load drafts on page reload
  - [ ] Clear after successful submission
- [ ] Close button removes panel (with draft saved)
- [ ] TypeScript compiles with no errors
- [ ] Styling matches existing design system
- [ ] No console errors or warnings

---

## 🎨 Styling Reference

**Color Palette:**
- Primary: `bg-blue-600`, `border-blue-500`
- Success: `bg-green-600`, `border-green-500`
- Incomplete: `border-gray-300`, `bg-white`
- Complete: `border-green-500`, `bg-green-50`
- Text: `text-gray-900`, `text-gray-700`, `text-gray-600`

**Component Dimensions:**
- Feedback Panel: `w-[600px]` (or 500-700px range)
- Panel height: Auto with max-height and scroll
- Question textarea: `min-h-[80px]`
- Spacing between sections: `mb-6`
- Spacing between questions: `mb-4`

---

## 📝 Implementation Notes

- Use `'use client'` directive for all components (Next.js client components)
- Import Lucide React icons for checkmarks and close button
- Use Tailwind's `resize-none` for textareas
- Debounce auto-save by 500ms to avoid excessive writes
- Generate unique IDs using `crypto.randomUUID()` or timestamp + random
- Handle edge cases: empty essays, missing scholarship data
- Test with multiple feedback panels open simultaneously
- Ensure panels are draggable and selectable like other blocks

---

## 🚀 Next Steps After Completion

1. **Testing:**
   - Test with various screen sizes
   - Test persistence across page reloads
   - Test multiple feedback panels simultaneously
   - Test edge cases (empty answers, network failures)

2. **UI/UX Enhancements:**
   - Add animations for section completion
   - Add progress indicators
   - Add confirmation dialog before closing unsaved panel
   - Add keyboard shortcuts (Enter to complete section, etc.)

3. **AI Integration:**
   - Implement `analyzeFeedback` API call
   - Implement `submitFeedbackAnswers` API call
   - Add loading states during API calls
   - Add error handling and retry logic

4. **Backend Integration:**
   - Replace localStorage with database persistence
   - Implement server-side essay analysis
   - Store feedback history
   - Track improvement metrics

---

**Last Updated:** 2025-11-22
**Status:** Ready for Implementation
