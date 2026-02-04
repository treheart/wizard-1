# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm install      # Install dependencies
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 quiz funnel application with three user paths (A, B, C) that leads users through a quiz to personalized results and a sales page.

### User Flow
1. **Name Input** (`/`) - User enters their name
2. **Segment Splitter** - User selects path A, B, or C based on their situation
3. **Questions** - 7 path-specific questions
4. **Results** (`/results`) - Personalized results with radar chart, insights, and email capture
5. **Learning Path** (`/learning-path`) - Sales page with offer details

### Key Patterns

**Content is JSON-driven**: All quiz text, questions, results, and sales copy lives in `content/*.json`. Components import these files directly. The `{name}` placeholder is replaced with the user's name at runtime.

**Quiz state encoding**: User data (name, path, answers, email) is encoded into a single base64url string passed via `?id=` parameter. See `lib/answer-encoding.ts` for `encodeQuizData`/`decodeQuizData`.

**Path-based questions**: Each path (A/B/C) has its own set of 7 questions defined in `content/quiz.json`. The `lib/quiz-data.ts` file maps these to typed `QuizQuestion` objects.

**Beehiiv integration**: The `/api/subscribe` route handles email subscriptions with custom fields for segmentation. Requires `BEEHIIV_API_KEY` and `BEEHIIV_PUBLICATION_ID` environment variables.

### Directory Structure
- `app/` - Next.js App Router pages and API routes
- `components/quiz/` - Quiz flow components (QuizContainer orchestrates the flow)
- `components/ui/` - Radix-based UI primitives (shadcn/ui style)
- `content/` - JSON content files for all text
- `lib/` - Types, utilities, and quiz data helpers
- `public/` - Static assets including wizard images and videos
