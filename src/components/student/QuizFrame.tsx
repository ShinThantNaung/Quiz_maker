import type { Quiz } from "@/types/quiz";
import { generateHtml } from "@/lib/generator";

/**
 * Renders a published quiz for a student using the exact same self-contained
 * HTML + runtime the "Generate HTML" export produces — so rendering, quiz
 * modes (practice vs. examination), and grading all stay identical and fully
 * client-side. The document runs inside a sandboxed iframe: students only ever
 * see the quiz, never the builder, settings, or export tools.
 */
export function QuizFrame({ quiz }: { quiz: Quiz }) {
  const html = generateHtml(quiz);
  return (
    <iframe
      title={quiz.meta.title || "Quiz"}
      srcDoc={html}
      sandbox="allow-scripts"
      className="h-screen w-screen border-0 bg-white"
    />
  );
}
