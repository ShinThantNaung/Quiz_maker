"use client";

import { useMemo } from "react";
import type { Quiz } from "@/types/quiz";
import { generateHtml } from "@/lib/generator";

interface Props {
  quiz: Quiz;
  /** Extra classes for the iframe wrapper. */
  className?: string;
}

/**
 * Renders the quiz using the exact same HTML the generator produces, inside a
 * sandboxed iframe. This guarantees the preview is byte-for-byte what students
 * will see when they open the exported file.
 */
export function QuizPreview({ quiz, className }: Props) {
  const html = useMemo(() => generateHtml(quiz), [quiz]);

  return (
    <iframe
      title="Quiz preview"
      srcDoc={html}
      sandbox="allow-scripts"
      className={"h-full w-full rounded-xl border border-slate-200 bg-white " + (className ?? "")}
    />
  );
}
