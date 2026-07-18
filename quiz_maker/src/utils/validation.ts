import { countBlankMarkers } from "@/utils/quiz";
import type { Question, Quiz } from "@/types/quiz";

export interface ValidationIssue {
  questionId?: string;
  message: string;
}

/** Normalize a fill-blank answer: trim, collapse inner whitespace, lowercase. */
export function normalizeAnswer(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function validateQuestion(q: Question, index: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const label = `Question ${index + 1}`;
  if (!q.prompt.trim()) {
    issues.push({ questionId: q.id, message: `${label}: prompt is empty.` });
  }
  if (!q.marks || q.marks <= 0) {
    issues.push({ questionId: q.id, message: `${label}: marks must be greater than 0.` });
  }
  if (q.type === "mcq") {
    if (q.options.length < 2) {
      issues.push({ questionId: q.id, message: `${label}: needs at least 2 options.` });
    }
    if (q.options.some((o) => !o.text.trim())) {
      issues.push({ questionId: q.id, message: `${label}: some options are empty.` });
    }
    if (!q.correctOptionId) {
      issues.push({ questionId: q.id, message: `${label}: no correct option selected.` });
    }
  }
  if (q.type === "fill-blank") {
    const markers = countBlankMarkers(q.prompt);
    if (markers === 0) {
      issues.push({ questionId: q.id, message: `${label}: prompt has no blank (use "___").` });
    }
    if (markers !== q.blanks.length) {
      issues.push({
        questionId: q.id,
        message: `${label}: ${markers} blank marker(s) but ${q.blanks.length} answer set(s).`,
      });
    }
    q.blanks.forEach((b, i) => {
      const valid = b.acceptedAnswers.filter((a) => a.trim());
      if (valid.length === 0) {
        issues.push({ questionId: q.id, message: `${label}: blank ${i + 1} has no accepted answer.` });
      }
    });
  }
  return issues;
}

export function validateQuiz(quiz: Quiz): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!quiz.meta.title.trim()) {
    issues.push({ message: "Quiz title is required." });
  }
  if (quiz.questions.length === 0) {
    issues.push({ message: "Add at least one question." });
  }
  quiz.questions.forEach((q, i) => issues.push(...validateQuestion(q, i)));
  return issues;
}
