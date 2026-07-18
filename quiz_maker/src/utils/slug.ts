// URL-segment slugification for published quiz links.
// Every segment of a link (/{subject}/{quizType}/{title}) is run through
// `slugify`: lowercased, diacritics stripped, non-alphanumerics collapsed to "-".

/**
 * Turn arbitrary text into a lowercase, dash-separated URL slug.
 *
 *   "Chemistry"            -> "chemistry"
 *   "MCQ"                  -> "mcq"
 *   "Periodic Table Day 1" -> "periodic-table-day-1"
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    // Drop combining diacritical marks (U+0300–U+036F) left by the decomposition.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slug used when a segment would otherwise be empty after slugifying. */
export const SLUG_FALLBACK = {
  subject: "general",
  quizType: "quiz",
  title: "untitled",
} as const;

/** Build the canonical link path from three not-yet-slugified parts. */
export function buildQuizPath(subject: string, quizType: string, title: string): string {
  const s = slugify(subject) || SLUG_FALLBACK.subject;
  const t = slugify(quizType) || SLUG_FALLBACK.quizType;
  const ti = slugify(title) || SLUG_FALLBACK.title;
  return `/${s}/${t}/${ti}`;
}
