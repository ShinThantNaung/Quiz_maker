"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuizEditor } from "@/hooks/useQuizEditor";
import { usePublished } from "@/hooks/usePublished";
import { AppHeader } from "@/components/ui/AppHeader";
import { QuizNav } from "@/components/quiz/QuizNav";
import { QuizLoading, QuizNotFound } from "@/components/quiz/QuizNotFound";
import { PublishedLinkRow } from "@/components/quiz/PublishedLinkRow";
import { pathForQuiz, type PublishedLink } from "@/lib/publish";
import { validateQuiz } from "@/utils/validation";
import { QUIZ_TYPE_LABELS, deriveQuizType } from "@/utils/quiz";

export default function CreateLinkPage() {
  const { id } = useParams<{ id: string }>();
  const { quiz, loaded, notFound } = useQuizEditor(id);
  const { links, ready, error, publish, update, remove } = usePublished(id);
  const [origin, setOrigin] = useState("");
  const [busy, setBusy] = useState(false);

  // Absolute origin is only known in the browser; set it after mount.
  useEffect(() => setOrigin(window.location.origin), []);

  const issues = useMemo(() => (quiz ? validateQuiz(quiz) : []), [quiz]);

  if (!loaded) return <QuizLoading />;
  if (notFound || !quiz) return <QuizNotFound />;

  const canonicalPath = pathForQuiz(quiz);
  const quizTypeLabel = QUIZ_TYPE_LABELS[deriveQuizType(quiz)] ?? deriveQuizType(quiz);
  const hasLinks = links.length > 0;

  const generate = async () => {
    setBusy(true);
    try {
      await publish(quiz);
    } finally {
      setBusy(false);
    }
  };

  const updateLink = async (link: PublishedLink) => {
    setBusy(true);
    try {
      await update(link.id, quiz);
    } finally {
      setBusy(false);
    }
  };

  const isStale = (link: PublishedLink) => quiz.updatedAt > link.sourceUpdatedAt;

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
          <h1 className="text-xl font-bold text-slate-900">Create Shareable Link</h1>
          <p className="mt-1 text-sm text-slate-500">
            Publish this quiz to a link students can open directly — no file to download.
            The quiz is stored on the server, so the link works on any device you share it with.
          </p>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Link preview</p>
            <code className="mt-1 block truncate text-sm text-slate-700">{canonicalPath}</code>
            <p className="mt-1 text-xs text-slate-500">
              Type <strong>{quizTypeLabel}</strong> · derived from the quiz&apos;s subject, question
              types, and title.
            </p>
          </div>

          {issues.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                {issues.length} thing{issues.length === 1 ? "" : "s"} to review before sharing:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-700">
                {issues.slice(0, 12).map((issue, i) => (
                  <li key={i}>{issue.message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              className="btn-primary"
              onClick={() => generate()}
              disabled={quiz.questions.length === 0 || busy}
            >
              {busy ? "Publishing…" : hasLinks ? "Generate New Link" : "Generate Link"}
            </button>
            <Link href={`/quiz/${quiz.id}/generate`} className="btn-secondary">
              Generate HTML instead
            </Link>
          </div>
          {quiz.questions.length === 0 && (
            <p className="mt-2 text-sm text-slate-400">Add at least one question to publish a link.</p>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-800">Published Links</h2>
          {error ? (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          ) : !ready ? (
            <p className="mt-2 text-sm text-slate-400">Loading…</p>
          ) : !hasLinks ? (
            <p className="mt-2 text-sm text-slate-500">
              No links yet. Generate one above, then copy it to your students.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {links.map((link) => (
                <PublishedLinkRow
                  key={link.path}
                  link={link}
                  origin={origin}
                  onDelete={remove}
                  onUpdate={updateLink}
                  stale={isStale(link)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-slate-800">How it works</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
            <li>Generate a link — the quiz is stored on the server under a clean URL.</li>
            <li>Copy the link and send it to your students.</li>
            <li>Students open the link on any device and take the quiz in the browser.</li>
            <li>They submit and get instant marks — grading stays entirely client-side.</li>
          </ol>
          <p className="mt-3 text-xs text-slate-400">
            Edited the quiz after sharing? Use <strong>Update Published Quiz</strong> to refresh the
            link in place, or <strong>Generate New Link</strong> for a fresh URL. Student answers are
            never sent to or stored on the server.
          </p>
        </div>
      </main>
    </div>
  );
}
