import type { Quiz } from "@/types/quiz";
import { totalMarks } from "@/utils/quiz";
import { GENERATED_CSS } from "./styles";
import { GENERATED_RUNTIME } from "./runtime";

/**
 * Shape of the data blob embedded into the generated HTML and read by the
 * student-side runtime. Only what the runtime needs is included.
 */
interface EmbeddedQuiz {
  meta: Quiz["meta"];
  totalMarks: number;
  settings: Quiz["settings"];
  questions: Array<Record<string, unknown>>;
}

function toEmbedded(quiz: Quiz): EmbeddedQuiz {
  return {
    meta: quiz.meta,
    totalMarks: totalMarks(quiz),
    settings: quiz.settings,
    questions: quiz.questions.map((q) => {
      if (q.type === "mcq") {
        return {
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          marks: Number(q.marks) || 0,
          options: q.options.map((o) => ({ id: o.id, text: o.text })),
          correctOptionId: q.correctOptionId,
        };
      }
      if (q.type === "true-false") {
        return {
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          marks: Number(q.marks) || 0,
          correctAnswer: q.correctAnswer,
        };
      }
      return {
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        marks: Number(q.marks) || 0,
        blanks: q.blanks.map((b) => ({
          acceptedAnswers: b.acceptedAnswers.filter((a) => a.trim()),
        })),
      };
    }),
  };
}

/** Escape a JSON string for safe embedding inside a <script> tag. */
function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Build a filesystem-friendly filename from the quiz title. */
export function suggestedFileName(quiz: Quiz): string {
  const base = (quiz.meta.title || "quiz")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return (base || "quiz") + ".html";
}

/**
 * Produce a single, fully self-contained HTML document for the quiz.
 * No external assets, CDNs, or network access are required to open it.
 */
export function generateHtml(quiz: Quiz): string {
  const data = safeJson(toEmbedded(quiz));
  const title = quiz.meta.title || "Quiz";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${GENERATED_CSS}</style>
</head>
<body>
<div class="wrap">
  <div id="timer" class="timer hidden"></div>
  <div id="info" class="card"></div>
  <form id="quiz-form">
    <div id="questions"></div>
    <div class="submit-bar">
      <button type="submit" class="btn" id="submit-btn">Submit Quiz</button>
    </div>
  </form>
  <div id="results"></div>
  <p class="footer-note">Generated with Quiz Maker &middot; Works offline</p>
</div>
<script>window.__QUIZ__ = ${data};</script>
<script>${GENERATED_RUNTIME}</script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
