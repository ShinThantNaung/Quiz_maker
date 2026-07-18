// Client-side publishing API.
//
// Thin fetch wrappers over the /api/quizzes route handlers. Publishing now
// stores quizzes in a server database (Prisma + SQLite), so a generated link
// resolves on ANY device — not just the browser that created it. The teacher's
// editor quizzes still live in localStorage, so publishing sends the full quiz
// in the request body; the server keeps only the quiz definition, never answers.

import type { Quiz } from "@/types/quiz";
import type { PublishedLink } from "@/types/published";
import { deriveQuizType } from "@/utils/quiz";
import { buildQuizPath } from "@/utils/slug";

// Re-export so existing imports of the type from this module keep working.
export type { PublishedLink } from "@/types/published";

/** The canonical link path a quiz would publish to, given its current meta. */
export function pathForQuiz(quiz: Quiz): string {
  return buildQuizPath(quiz.meta.subject, deriveQuizType(quiz), quiz.meta.title);
}

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data?.error ?? fallback;
  } catch {
    return fallback;
  }
}

/** All published links, most recently published first. */
export async function listPublished(): Promise<PublishedLink[]> {
  const response = await fetch("/api/quizzes", { cache: "no-store" });
  if (!response.ok) throw new Error(await readError(response, "Failed to load links."));
  return response.json();
}

/** Published links generated from a particular editor quiz. */
export async function findLinksForQuiz(sourceId: string): Promise<PublishedLink[]> {
  const response = await fetch(`/api/quizzes?sourceId=${encodeURIComponent(sourceId)}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await readError(response, "Failed to load links."));
  return response.json();
}

/** Publish a quiz to a new shareable link. */
export async function publishQuiz(quiz: Quiz): Promise<PublishedLink> {
  const response = await fetch("/api/quizzes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quiz }),
  });
  if (!response.ok) throw new Error(await readError(response, "Failed to publish quiz."));
  return response.json();
}

/** Refresh an existing published link in place with fresh quiz content. */
export async function updatePublishedQuiz(id: string, quiz: Quiz): Promise<PublishedLink> {
  const response = await fetch(`/api/quizzes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quiz }),
  });
  if (!response.ok) throw new Error(await readError(response, "Failed to update link."));
  return response.json();
}

/** Remove a published link. Does not touch the source quiz in the editor. */
export async function deletePublished(id: string): Promise<void> {
  const response = await fetch(`/api/quizzes/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok && response.status !== 404) {
    throw new Error(await readError(response, "Failed to delete link."));
  }
}
