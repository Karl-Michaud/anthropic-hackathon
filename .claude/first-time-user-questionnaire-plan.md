# First-Time User Questionnaire Implementation Plan

## Overview
Build a questionnaire modal for first-time users to collect profile information, process it with AI, and store it for essay generation context.

## User Profile JSON Structure
```typescript
interface IUserProfile {
  firstName: string
  lastName: string
  cvResumeSummary: string  // AI-generated summary of CV
  userSummary: string      // AI-generated comprehensive summary
  rawData?: {
    cvText: string
    aboutYourself: string
  }
}
```

## Requirements
- **Modal**: Displays as overlay on whiteboard (no separate page)
- **No skip option**: User must complete questionnaire
- **Required fields**: First name, Last name, CV/Resume
- **Optional field**: "Tell me about yourself" (extracurricular involvement)
- **Profile editing**: Accessible via sidebar link to `/profile` page

---

## Implementation Phases

### Phase 1: Core Infrastructure

#### 1. Create Types (`app/types/user-profile.ts`)
- [ ] `IUserProfile` interface for stored data
- [ ] `IUserProfileInput` for form data
- [ ] `IUserProfileAIResponse` for AI response

#### 2. Add AI Processing (`app/lib/request.ts`)
- [ ] Add `processUserProfile` to `ClaudeRequestType`
- [ ] Create `generateUserProfilePrompt()` function
- [ ] Prompt takes: CV text, first/last name, "about yourself" text
- [ ] Returns JSON with: `cvResumeSummary`, `firstName`, `lastName`, `userSummary`
- [ ] Export `processUserProfileWithAI()` async function

---

### Phase 2: Database & State

#### 3. Update Supabase Queries (`app/lib/supabase/queries.ts`)
- [ ] Add `saveUserProfile(userId, profile)` function
- [ ] Add `getUserProfile(userId)` function
- [ ] Uses existing `json_outputs` column in `whiteboard_data` table

#### 4. Update WhiteboardContext (`app/context/WhiteboardContext.tsx`)
- [ ] Add `userProfile: IUserProfile | null` state
- [ ] Add `isFirstTimeUser: boolean` state
- [ ] Add `setUserProfile(profile)` action
- [ ] Add `completeOnboarding()` action (sets isFirstTimeUser to false)
- [ ] Load user profile and first-time status from database on init
- [ ] Sync profile to localStorage and database

---

### Phase 3: UI Components

#### 5. Create Reusable Profile Form (`app/components/UserProfileForm.tsx`)
- [ ] Shared form component used by modal and profile page
- [ ] Props: `onSubmit`, `initialData?`, `isLoading`
- [ ] Disclaimer at top explaining data usage for AI tailoring
- [ ] Form fields:
  - First Name (required, text input)
  - Last Name (required, text input)
  - CV/Resume (required, file upload - PDF/TXT/JSON)
  - "Tell me about yourself" (optional, textarea)
- [ ] File upload uses existing `parseFileContent` from `fileParser.ts`
- [ ] Submit button with loading state
- [ ] Dark/light mode support using `useDarkMode()`
- [ ] Follow existing styling patterns from `AuthForm.tsx`

#### 6. Create First-Time Modal (`app/components/FirstTimeUserModal.tsx`)
- [ ] Modal overlay wrapper around `UserProfileForm`
- [ ] No close button (must complete)
- [ ] Centered on screen with backdrop
- [ ] Title: "Welcome! Let's set up your profile"

#### 7. Create Profile Page (`app/profile/page.tsx`)
- [ ] Protected route (redirect if not logged in)
- [ ] Full page layout with `UserProfileForm`
- [ ] Pre-fills existing profile data
- [ ] Success message on save
- [ ] Back button to whiteboard

---

### Phase 4: Integration

#### 8. Update Whiteboard (`app/components/Whiteboard.tsx`)
- [ ] Import `FirstTimeUserModal`
- [ ] Check `isFirstTimeUser` from WhiteboardContext
- [ ] Render `FirstTimeUserModal` when `isFirstTimeUser` is true
- [ ] Pass `onComplete` handler that calls `completeOnboarding()`

#### 9. Update Navigation/Sidebar (`app/components/Navigation.tsx`)
- [ ] Add "Profile" link pointing to `/profile`
- [ ] Use appropriate icon (User icon from lucide-react)

#### 10. Update Draft Generation (`app/lib/request.ts`)
- [ ] Modify `generateDraftPrompt()` to accept user profile data
- [ ] Add user context section to prompt:
  ```
  ## APPLICANT PROFILE
  **Name**: {firstName} {lastName}
  **Background Summary**: {userSummary}
  **CV/Resume Summary**: {cvResumeSummary}
  ```
- [ ] Update `generateDraftWithAnalysis()` to fetch and include user profile

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `app/types/user-profile.ts` | Create | Type definitions |
| `app/lib/request.ts` | Modify | Add AI processing for profile |
| `app/lib/supabase/queries.ts` | Modify | Add profile save/get functions |
| `app/context/WhiteboardContext.tsx` | Modify | Add profile state and actions |
| `app/components/UserProfileForm.tsx` | Create | Reusable form component |
| `app/components/FirstTimeUserModal.tsx` | Create | Modal wrapper |
| `app/profile/page.tsx` | Create | Profile editing page |
| `app/components/Whiteboard.tsx` | Modify | Show modal for first-time users |
| `app/components/Navigation.tsx` | Modify | Add Profile link to sidebar |

---

## Key Dependencies
- `app/lib/fileParser.ts` - For PDF/TXT/JSON parsing
- `app/styles/design-system.ts` - For styling tokens
- `useDarkMode()` - For theming
- `useAuth()` - For user context
- Existing Supabase client utilities

---

## AI Prompt Design

The user profile processing prompt should:
1. Summarize the CV/resume in 2-3 paragraphs (human-readable)
2. Extract key achievements, skills, and experiences
3. Combine with "about yourself" to create a comprehensive user summary
4. Output structured JSON for storage

Example output:
```json
{
  "cvResumeSummary": "The applicant is a junior computer science student with strong experience in...",
  "userSummary": "A driven student leader with passion for technology and community service..."
}
```

---

## Testing Checklist
- [ ] Modal appears for new users
- [ ] Modal doesn't appear for returning users
- [ ] File upload works for PDF, TXT, JSON
- [ ] Required field validation works
- [ ] AI processing completes successfully
- [ ] Profile saves to database
- [ ] Profile loads on subsequent visits
- [ ] Profile editing works from /profile page
- [ ] Draft generation includes user context
- [ ] Dark/light mode styling correct
