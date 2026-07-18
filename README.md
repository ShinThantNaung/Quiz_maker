# Quiz Maker

A frontend-only quiz builder for teachers. Create quizzes in the browser and
export a **single, self-contained interactive HTML file** that students open
locally — no internet, server, database, or accounts required.

Built with **Next.js (App Router)**, **TypeScript**, and **TailwindCSS**.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## What it does

- **Dashboard** — list, create, delete, and import/export quizzes. Everything is
  saved to `localStorage`, so quizzes survive a page refresh.
- **Builder** (`/quiz/[id]/edit`) — quiz metadata plus three question types:
  - **Multiple choice** — dynamic options, single correct answer, marks.
  - **True / False** — marks.
  - **Fill in the blank** — one or more `___` blanks, multiple accepted answers,
    case- and whitespace-insensitive checking.
  - Each question can be moved up/down, duplicated, deleted, collapsed, and
    reordered by drag and drop.
- **Settings** (`/quiz/[id]/settings`) — shuffle questions/options, optional
  timer (15/30/60 min or custom) with auto-submit, and result visibility
  (score, percentage, correct answers, retry).
- **Preview** (`/quiz/[id]/preview`) — renders the actual generated HTML inside a
  sandboxed iframe, so the preview is exactly what students will see.
- **Generate** (`/quiz/[id]/generate`) — validates the quiz and downloads one
  `.html` file containing all HTML, CSS, JS, and grading logic inline.

## The generated file

The exported HTML works entirely offline. When a student submits, it computes
obtained marks, total, percentage, per-question correct/wrong/unanswered status,
and (optionally) reveals correct answers — all client-side.

## Project structure (feature-based)

```
src/
  app/                     App Router pages
    page.tsx               Dashboard
    quiz/[id]/edit|settings|preview|generate
  components/
    questions/             Question editors + drag-drop list
    quiz/                  Metadata form, nav, save badge
    settings/              Settings form
    preview/               Iframe preview
    ui/                    Header, toggle, primitives
  hooks/                   useQuizzes, useQuizEditor (autosave)
  lib/
    storage.ts             localStorage CRUD
    generator/             Self-contained HTML generator (styles + runtime)
  types/                   Domain types
  utils/                   Factories, validation, download helpers
```

## Constraints

Frontend only. No backend, authentication, APIs, databases, cloud storage, or
PDF generation. Grading and the exported file are 100% client-side.
