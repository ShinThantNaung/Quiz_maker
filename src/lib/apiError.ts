// Centralized error handling for the /api/quizzes route handlers.
//
// An uncaught throw in a route handler becomes an opaque 500 in the browser —
// the real cause (a Prisma/SQLite error, a missing migration, a locked db file)
// is only printed to the SERVER terminal. This helper logs the full error there
// AND returns its message in the JSON body, so the failure is visible in the
// browser's Network tab too. Safe here: the API holds no secrets or auth — only
// public quiz definitions.

import { NextResponse } from "next/server";

export function apiError(context: string, error: unknown): NextResponse {
  // Full detail to the server console for the developer running the app.
  console.error(`[api] ${context}:`, error);
  const message = error instanceof Error ? error.message : "Internal server error.";
  return NextResponse.json({ error: message }, { status: 500 });
}
