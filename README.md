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

## Publishing shareable links

Besides the offline HTML export, a teacher can **publish** a quiz to a clean,
shareable URL (`/{subject}/{quizType}/{title}`) that opens on any device. The
quiz definition is stored in a database (libSQL/Turso via Prisma); rendering and
grading still happen entirely client-side, and **student answers are never
stored**. See `/quiz/[id]/link`. The database only ever holds published quiz
definitions — publish, retrieve, update, delete. Nothing else.

## Database & deploying to Vercel (Turso)

The app stores published quizzes in **Turso** (hosted libSQL) through Prisma's
libSQL driver adapter. SQLite files can't persist on Vercel's serverless
filesystem, so a network database is required in production.

**One-time setup**

1. Install the Turso CLI and sign up: <https://docs.turso.tech/quickstart>
2. Create a database and read its credentials:
   ```bash
   turso db create quiz-maker
   turso db show quiz-maker --url        # -> TURSO_DATABASE_URL (libsql://…)
   turso db tokens create quiz-maker     # -> TURSO_AUTH_TOKEN
   ```
3. Create the table by applying the committed migration SQL:
   ```bash
   # macOS / Linux / Git Bash:
   turso db shell quiz-maker < prisma/migrations/20260718053623_init_published_quiz/migration.sql
   ```
   ```powershell
   # Windows PowerShell (it has no `<` stdin redirection):
   Get-Content prisma/migrations/20260718053623_init_published_quiz/migration.sql -Raw | turso db shell quiz-maker
   ```
4. In **Vercel → Project → Settings → Environment Variables**, set
   `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` (all environments), then redeploy.

**Local development**

```bash
cp .env.example .env       # then fill in / adjust values
turso dev                  # starts a local libSQL server (prints a URL)
# set TURSO_DATABASE_URL in .env to that URL (e.g. http://127.0.0.1:8080)
npm run db:migrate         # create the table in the local dev database
npm run dev
```

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

Building, grading, and the exported HTML file are 100% client-side. The only
server-side piece is quiz **publishing** (Prisma + libSQL/Turso via Next.js
Route Handlers): it stores published quiz definitions so links resolve on any
device. No authentication, user accounts, or student-answer storage.
