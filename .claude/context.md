# Project Context: Anthropic Hackathon - Collaboration Board

## Project Overview
This is a collaboration/board tool built for the Anthropic Hackathon. Think of it as a team workspace or kanban-style board with AI capabilities powered by Claude.

## Tech Stack

### Frontend
- **Framework**: Next.js 16.0.3 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **UI Components**: Shadcn/ui or Radix UI

### Backend & Data
- **API**: Next.js API Routes (app/api/*)
- **AI Integration**: Anthropic Claude API
- **Database**: Supabase (PostgreSQL with built-in auth and realtime features)
- **Data Fetching**: React Query / TanStack Query

### State Management
- React useState and Context API (built-in React state management)

## Project Structure
```
app/
├── app/              # Next.js App Router pages
│   ├── page.tsx      # Home page
│   ├── board/        # Board/collaboration workspace
│   ├── layout.tsx    # Root layout
│   └── globals.css   # Global styles with Tailwind
├── public/           # Static assets
└── package.json      # Dependencies
```

## Key Configuration

### TypeScript
- Target: ES2017
- Strict mode enabled
- Path alias: `@/*` maps to project root

### Build & Dev
- Dev server: `npm run dev`
- Build: `npm run build`
- Linting: `npm run lint` (ESLint configured)

## Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow ESLint rules (Next.js recommended config)
- Use functional components with hooks
- Prefer server components where possible (Next.js 16 default)

### State Management
- Use useState for local component state
- Use Context for shared state across components
- Consider React Query for server state/data fetching

### Styling
- Use Tailwind CSS utility classes
- CSS variables defined in globals.css for theming
- Dark mode support via `prefers-color-scheme`
- Custom theme colors: `--background`, `--foreground`

### API Integration
- Anthropic Claude API calls go through Next.js API routes for security
- Supabase client for database operations
- Use React Query for data fetching and caching

## Important Notes
- This is a hackathon project - focus on MVP features first
- Real-time collaboration features can leverage Supabase realtime subscriptions
- AI features should integrate Claude API for intelligent board assistance
- Follow Next.js 16 best practices (App Router, Server Components, etc.)
