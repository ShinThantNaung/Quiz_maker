// Published-link storage.
//
// "Create Link" publishes a quiz to browser storage under a canonical path
// (/{subject}/{quizType}/{title}) so a link resolves back to the quiz with no
// backend. Records are keyed by that path; each carries its own quiz identifier
// and a compressed, serialized copy of the quiz. The answer key lives only
// inside the stored (and never URL-embedded) payload.

import type { Quiz } from "@/types/quiz";
import { totalMarks, deriveQuizType } from "@/utils/quiz";
import { buildQuizPath, slugify } from "@/utils/slug";
import { uid } from "@/utils/id";
import { encode, decode, type Encoded } from "@/lib/compress";

const STORAGE_KEY = "quizmaker.published.v1";

/** Public, payload-free description of a published link (safe for lists/UI). */
export interface PublishedLink {
  /** Unique identifier for this published quiz. */
  id: string;
  /** Editor quiz id this link was generated from. */
  sourceId: string;
  /** Canonical resolvable path, e.g. "/chemistry/mcq/periodic-table-day-1". */
  path: string;
  subject: string;
  quizType: string;
  title: string;
  /** Original (un-slugified) title/subject for display. */
  displayTitle: string;
  displaySubject: string;
  questionCount: number;
  totalMarks: number;
  publishedAt: number;
  /** quiz.updatedAt captured at publish time — used to detect later edits. */
  sourceUpdatedAt: number;
}

/** Stored record = public metadata plus the encoded quiz payload. */
interface StoredRecord extends PublishedLink {
  encoded: Encoded;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function readAll(): Record<string, StoredRecord> {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, StoredRecord>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, StoredRecord>): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function toPublic(record: StoredRecord): PublishedLink {
  // Strip the encoded payload so lists never carry the full quiz around.
  const { encoded: _encoded, ...rest } = record;
  void _encoded;
  return rest;
}

/** All published links, most recently published first. */
export function listPublished(): PublishedLink[] {
  return Object.values(readAll())
    .map(toPublic)
    .sort((a, b) => b.publishedAt - a.publishedAt);
}

/** Published links generated from a particular editor quiz. */
export function findLinksForQuiz(sourceId: string): PublishedLink[] {
  return listPublished().filter((l) => l.sourceId === sourceId);
}

/** The canonical path a quiz would publish to, given its current meta. */
export function pathForQuiz(quiz: Quiz): string {
  return buildQuizPath(quiz.meta.subject, deriveQuizType(quiz), quiz.meta.title);
}

/** Normalize decoded route params back into a stored-record key. */
export function normalizePath(subject: string, quizType: string, title: string): string {
  return buildQuizPath(subject, quizType, title);
}

/**
 * Find a free path by appending -2, -3, … when `basePath` is already taken.
 * Used by "Generate New Link" so a second link never clobbers the first.
 */
function uniquePath(basePath: string, map: Record<string, StoredRecord>): string {
  if (!map[basePath]) return basePath;
  for (let n = 2; ; n++) {
    const candidate = `${basePath}-${n}`;
    if (!map[candidate]) return candidate;
  }
}

interface PublishOptions {
  /**
   * Reuse this exact path (an "Update Published Link"). When omitted a new,
   * collision-free path is derived from the quiz meta ("Generate New Link").
   */
  path?: string;
}

/** Serialize → compress → store a quiz, returning the resulting link. */
export async function publishQuiz(quiz: Quiz, options: PublishOptions = {}): Promise<PublishedLink> {
  const map = readAll();
  const basePath = pathForQuiz(quiz);
  const path = options.path ?? uniquePath(basePath, map);

  const encoded = await encode(JSON.stringify(quiz));
  const existing = map[path];

  const record: StoredRecord = {
    id: existing?.id ?? uid("pub_"),
    sourceId: quiz.id,
    path,
    subject: slugify(quiz.meta.subject) || "general",
    quizType: deriveQuizType(quiz),
    title: slugify(quiz.meta.title) || "untitled",
    displayTitle: quiz.meta.title || "Untitled Quiz",
    displaySubject: quiz.meta.subject || "",
    questionCount: quiz.questions.length,
    totalMarks: totalMarks(quiz),
    publishedAt: Date.now(),
    sourceUpdatedAt: quiz.updatedAt,
    encoded,
  };

  map[path] = record;
  writeAll(map);
  return toPublic(record);
}

/** Resolve a link path to its decoded quiz, or null if no such link exists. */
export async function resolvePublishedQuiz(path: string): Promise<Quiz | null> {
  const record = readAll()[path];
  if (!record) return null;
  try {
    const json = await decode(record.encoded);
    return JSON.parse(json) as Quiz;
  } catch {
    return null;
  }
}

/** Remove a published link. Does not touch the source quiz in the editor. */
export function deletePublished(path: string): void {
  const map = readAll();
  if (map[path]) {
    delete map[path];
    writeAll(map);
  }
}
