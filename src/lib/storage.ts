import type { Quiz } from "@/types/quiz";

const STORAGE_KEY = "quizmaker.quizzes.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/** Read the full map of saved quizzes, keyed by id. */
export function readAll(): Record<string, Quiz> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Quiz>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, Quiz>): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** All quizzes sorted by most-recently-updated first. */
export function listQuizzes(): Quiz[] {
  return Object.values(readAll()).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getQuiz(id: string): Quiz | null {
  return readAll()[id] ?? null;
}

export function saveQuiz(quiz: Quiz): Quiz {
  const map = readAll();
  const next: Quiz = { ...quiz, updatedAt: Date.now() };
  map[quiz.id] = next;
  writeAll(map);
  return next;
}

export function deleteQuiz(id: string): void {
  const map = readAll();
  delete map[id];
  writeAll(map);
}

/** Basic structural check that a parsed object is a usable Quiz. */
export function isQuizShape(value: unknown): value is Quiz {
  if (!value || typeof value !== "object") return false;
  const q = value as Partial<Quiz>;
  return (
    typeof q.id === "string" &&
    !!q.meta &&
    Array.isArray(q.questions) &&
    !!q.settings
  );
}
