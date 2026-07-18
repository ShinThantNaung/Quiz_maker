"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Quiz } from "@/types/quiz";
import { normalizePath, resolvePublishedQuiz } from "@/lib/publish";
import { generateHtml } from "@/lib/generator";

type Status = "loading" | "ready" | "not-found";

/**
 * Student-facing quiz route: /{subject}/{quizType}/{title}.
 *
 * Validates the URL, resolves the published quiz from browser storage, and
 * renders it full-screen. Students only ever see the quiz itself — the exact
 * runtime the HTML export uses drives rendering, quiz modes, and grading — with
 * no access to the editor, settings, or export tools.
 */
export default function StudentQuizPage() {
  const params = useParams<{ subject: string; quizType: string; title: string }>();
  const [status, setStatus] = useState<Status>("loading");
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    let cancelled = false;
    const { subject, quizType, title } = params;

    // Validate the URL: all three segments must be present.
    if (!subject || !quizType || !title) {
      setStatus("not-found");
      return;
    }

    const path = normalizePath(subject, quizType, title);
    resolvePublishedQuiz(path).then((found) => {
      if (cancelled) return;
      if (found) {
        setQuiz(found);
        setStatus("ready");
      } else {
        setStatus("not-found");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [params]);

  if (status === "loading") return <StudentMessage title="Loading quiz…" />;
  if (status === "not-found" || !quiz) return <QuizNotAvailable />;

  return <StudentQuiz quiz={quiz} />;
}

/** Renders the quiz using the same self-contained HTML the export produces. */
function StudentQuiz({ quiz }: { quiz: Quiz }) {
  const html = useMemo(() => generateHtml(quiz), [quiz]);
  return (
    <iframe
      title={quiz.meta.title || "Quiz"}
      srcDoc={html}
      sandbox="allow-scripts"
      className="h-screen w-screen border-0 bg-white"
    />
  );
}

function StudentMessage({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="card max-w-md p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function QuizNotAvailable() {
  return (
    <StudentMessage title="Quiz not available">
      <p className="mt-2 text-sm text-slate-500">
        This quiz link couldn&apos;t be found. It may have been removed, or the link was created in a
        different browser than the one you&apos;re using.
      </p>
      <Link href="/" className="btn-secondary mt-4 inline-flex">
        Go to Quiz Maker
      </Link>
    </StudentMessage>
  );
}
