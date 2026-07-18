"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuizEditor } from "@/hooks/useQuizEditor";
import { AppHeader } from "@/components/ui/AppHeader";
import { QuizNav } from "@/components/quiz/QuizNav";
import { QuizLoading, QuizNotFound } from "@/components/quiz/QuizNotFound";
import { generateHtml, suggestedFileName } from "@/lib/generator";
import { downloadTextFile } from "@/utils/download";
import { validateQuiz } from "@/utils/validation";
import { totalMarks } from "@/utils/quiz";

export default function GeneratePage() {
  const { id } = useParams<{ id: string }>();
  const { quiz, loaded, notFound } = useQuizEditor(id);
  const [done, setDone] = useState(false);

  const html = useMemo(() => (quiz ? generateHtml(quiz) : ""), [quiz]);
  const issues = useMemo(() => (quiz ? validateQuiz(quiz) : []), [quiz]);

  if (!loaded) return <QuizLoading />;
  if (notFound || !quiz) return <QuizNotFound />;

  const fileName = suggestedFileName(quiz);
  const sizeKb = (new Blob([html]).size / 1024).toFixed(1);

  const download = () => {
    downloadTextFile(fileName, html, "text/html");
    setDone(true);
  };

  return (
    <div className="min-h-screen">
      <AppHeader
        subtitle={<span className="truncate">{quiz.meta.title || "Untitled Quiz"}</span>}
        actions={
          <Link href="/" className="btn-ghost">
            ← Dashboard
          </Link>
        }
      />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <QuizNav quizId={quiz.id} />

        <div className="card p-6">
          <h1 className="text-xl font-bold text-slate-900">Generate Interactive HTML</h1>
          <p className="mt-1 text-sm text-slate-500">
            Produces one self-contained <code className="rounded bg-slate-100 px-1">.html</code> file.
            No internet, server, or installation needed — students just open it in a browser.
          </p>

          <dl className="mt-5 grid gap-3 sm:grid-cols-3">
            <Stat label="Questions" value={String(quiz.questions.length)} />
            <Stat label="Total marks" value={String(totalMarks(quiz))} />
            <Stat label="File size" value={`${sizeKb} KB`} />
          </dl>

          {issues.length > 0 && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                {issues.length} thing{issues.length === 1 ? "" : "s"} to review before sharing:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-700">
                {issues.slice(0, 12).map((issue, i) => (
                  <li key={i}>{issue.message}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-amber-600">
                You can still download — but unfinished questions may not grade correctly.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              className="btn-primary"
              onClick={download}
              disabled={quiz.questions.length === 0}
            >
              ⬇ Download {fileName}
            </button>
            <Link href={`/quiz/${quiz.id}/preview`} className="btn-secondary">
              Preview first
            </Link>
            {done && <span className="text-sm font-medium text-green-600">Downloaded ✓</span>}
          </div>
          {quiz.questions.length === 0 && (
            <p className="mt-2 text-sm text-slate-400">Add at least one question to generate.</p>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-800">How to distribute</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
            <li>Download the HTML file above.</li>
            <li>Send it to students (email, USB, shared drive, LMS upload).</li>
            <li>Students open it in any modern browser — online or offline.</li>
            <li>They answer, submit, and get instant marks and feedback.</li>
          </ol>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-lg font-bold text-slate-800">{value}</dd>
    </div>
  );
}
