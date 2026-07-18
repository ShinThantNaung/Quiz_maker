// Server-side data access for published quizzes.
//
// This is the only module that talks to Prisma. It maps between the editor's
// `Quiz` shape and the `PublishedQuiz` table, and exposes the small set of
// operations the feature needs: publish, list, fetch, update, delete. Student
// answers are never accepted or stored — only the quiz definition is persisted.
//
// Server-only: imported exclusively by route handlers and server components.
// Do not import from a "use client" module.

import { Prisma, type PublishedQuiz } from "@prisma/client";
import { prisma } from "./client";
import type { Question, Quiz, QuizSettings } from "@/types/quiz";
import type { PublishedLink } from "@/types/published";
import { deriveQuizType, totalMarks } from "@/utils/quiz";
import { slugify, SLUG_FALLBACK } from "@/utils/slug";

/** Structural guard for a quiz submitted from the client for publishing. */
export function isQuizShape(value: unknown): value is Quiz {
  if (!value || typeof value !== "object") return false;
  const q = value as Partial<Quiz>;
  return (
    typeof q.id === "string" &&
    !!q.meta &&
    typeof q.meta === "object" &&
    Array.isArray(q.questions) &&
    !!q.settings &&
    typeof q.settings === "object"
  );
}

/** The canonical /{subject}/{quizType}/{title} path for a stored record. */
function pathOf(record: Pick<PublishedQuiz, "subject" | "quizType" | "slug">): string {
  return `/${record.subject}/${record.quizType}/${record.slug}`;
}

/** Map a stored record to the payload-free link description for the dashboard. */
function toLink(record: PublishedQuiz): PublishedLink {
  return {
    id: record.id,
    sourceId: record.sourceId,
    path: pathOf(record),
    subject: record.subject,
    quizType: record.quizType,
    title: record.slug,
    displayTitle: record.title,
    displaySubject: record.subjectLabel,
    questionCount: record.questionCount,
    totalMarks: record.totalMarks,
    publishedAt: record.createdAt.getTime(),
    sourceUpdatedAt: record.sourceUpdatedAt.getTime(),
  };
}

/**
 * Reconstruct the editor `Quiz` from a stored record, so the exact same
 * client renderer/grader (`generateHtml`) drives the student page.
 */
export function toQuiz(record: PublishedQuiz): Quiz {
  return {
    id: record.sourceId,
    meta: {
      title: record.title,
      subject: record.subjectLabel,
      teacher: record.teacher,
      duration: record.duration,
      instructions: record.instructions,
    },
    questions: record.questions as unknown as Question[],
    settings: record.settings as unknown as QuizSettings,
    createdAt: record.createdAt.getTime(),
    updatedAt: record.updatedAt.getTime(),
  };
}

/** The content fields written on both publish and update. */
function contentData(quiz: Quiz) {
  return {
    title: quiz.meta.title || "Untitled Quiz",
    subjectLabel: quiz.meta.subject || "",
    teacher: quiz.meta.teacher || "",
    instructions: quiz.meta.instructions || "",
    duration: quiz.meta.duration || "",
    totalMarks: totalMarks(quiz),
    questionCount: quiz.questions.length,
    settings: quiz.settings as unknown as Prisma.InputJsonValue,
    questions: quiz.questions as unknown as Prisma.InputJsonValue,
    sourceUpdatedAt: new Date(quiz.updatedAt),
  };
}

/**
 * Find a free {title} slug within a (subject, quizType) namespace, appending
 * -2, -3, … so "Generate New Link" never clobbers an existing link.
 */
async function freeSlug(subject: string, quizType: string, base: string): Promise<string> {
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const existing = await prisma.publishedQuiz.findUnique({
      where: { subject_quizType_slug: { subject, quizType, slug } },
    });
    if (!existing) return slug;
  }
}

/** Publish a quiz to a new, collision-free link. */
export async function publish(quiz: Quiz): Promise<PublishedLink> {
  const subject = slugify(quiz.meta.subject) || SLUG_FALLBACK.subject;
  const quizType = deriveQuizType(quiz);
  const base = slugify(quiz.meta.title) || SLUG_FALLBACK.title;
  const slug = await freeSlug(subject, quizType, base);

  const record = await prisma.publishedQuiz.create({
    data: {
      sourceId: quiz.id,
      slug,
      subject,
      quizType,
      published: true,
      ...contentData(quiz),
    },
  });
  return toLink(record);
}

/** All published links, most recently published first. */
export async function list(sourceId?: string): Promise<PublishedLink[]> {
  const records = await prisma.publishedQuiz.findMany({
    where: sourceId ? { sourceId } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return records.map(toLink);
}

/** Fetch a single link's metadata by database id. */
export async function getLinkById(id: string): Promise<PublishedLink | null> {
  const record = await prisma.publishedQuiz.findUnique({ where: { id } });
  return record ? toLink(record) : null;
}

/** True only for Prisma's "record to update/delete not found" (P2025). */
function isRecordNotFound(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

/**
 * Update a published quiz in place, keeping its existing path so the shared URL
 * keeps working. Returns null when no such record exists; other errors (e.g. a
 * database failure) propagate so the caller can surface them, not hide them.
 */
export async function update(id: string, quiz: Quiz): Promise<PublishedLink | null> {
  try {
    const record = await prisma.publishedQuiz.update({
      where: { id },
      data: contentData(quiz),
    });
    return toLink(record);
  } catch (error) {
    if (isRecordNotFound(error)) return null;
    throw error;
  }
}

/** Delete a published link. Does not touch the editor's source quiz. */
export async function remove(id: string): Promise<boolean> {
  try {
    await prisma.publishedQuiz.delete({ where: { id } });
    return true;
  } catch (error) {
    if (isRecordNotFound(error)) return false;
    throw error;
  }
}

/**
 * Resolve URL segments to a renderable quiz, or null if no published quiz
 * lives at that path. Segments are re-slugified so odd casing still resolves.
 */
export async function getQuizByPath(
  subjectSeg: string,
  quizTypeSeg: string,
  titleSeg: string,
): Promise<Quiz | null> {
  const subject = slugify(subjectSeg);
  const quizType = slugify(quizTypeSeg);
  const slug = slugify(titleSeg);
  if (!subject || !quizType || !slug) return null;

  const record = await prisma.publishedQuiz.findUnique({
    where: { subject_quizType_slug: { subject, quizType, slug } },
  });
  if (!record || !record.published) return null;
  return toQuiz(record);
}
