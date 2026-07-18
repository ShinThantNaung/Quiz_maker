"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuizzes } from "@/hooks/useQuizzes";
import { usePublished } from "@/hooks/usePublished";
import { PublishedLinkRow } from "@/components/quiz/PublishedLinkRow";
import { AppHeader } from "@/components/ui/AppHeader";
import { createQuiz, totalMarks } from "@/utils/quiz";
import { saveQuiz, isQuizShape } from "@/lib/storage";
import { readFileAsText } from "@/utils/download";
import { uid } from "@/utils/id";
import type { Quiz } from "@/types/quiz";

export default function DashboardPage() {
  const router = useRouter();
  const { quizzes, ready, remove, importQuiz } = useQuizzes();
  const { links, ready: linksReady, remove: removeLink } = usePublished();
  const [origin, setOrigin] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Absolute origin is only known in the browser; set it after mount.
  useEffect(() => setOrigin(window.location.origin), []);

  const handleCreate = () => {
    const quiz = createQuiz();
    saveQuiz(quiz);
    router.push(`/quiz/${quiz.id}/edit`);
  };

  const handleImport = async (file: File) => {
    try {
      const text = await readFileAsText(file);
      const parsed = JSON.parse(text);
      if (!isQuizShape(parsed)) {
        alert("That file doesn't look like a valid quiz JSON.");
        return;
      }
      // Assign a fresh id + timestamps so imports never clobber an existing quiz.
      const imported: Quiz = {
        ...parsed,
        id: uid("quiz_"),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      importQuiz(imported);
    } catch {
      alert("Could not read that file as JSON.");
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader
        actions={
          <>
            <button
              className="btn-secondary"
              onClick={() => fileRef.current?.click()}
            >
              Import JSON
            </button>
            <button className="btn-primary" onClick={handleCreate}>
              + Create Quiz
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
                e.target.value = "";
              }}
            />
          </>
        }
      />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Your Quizzes</h1>
        <p className="mb-6 text-sm text-slate-500">
          Create a quiz, then export a single interactive HTML file for your
          students.
        </p>

        {!ready ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : quizzes.length === 0 ? (
          <EmptyState onCreate={handleCreate} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((q) => (
              <QuizCard key={q.id} quiz={q} onDelete={() => remove(q.id)} />
            ))}
          </div>
        )}

        {linksReady && links.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-1 text-lg font-bold text-slate-900">Published Links</h2>
            <p className="mb-4 text-sm text-slate-500">
              Links you&apos;ve created. Copy one to share, or delete it to take the quiz offline.
            </p>
            <div className="space-y-3">
              {links.map((link) => (
                <PublishedLinkRow
                  key={link.path}
                  link={link}
                  origin={origin}
                  onDelete={removeLink}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="card grid place-items-center gap-3 p-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-2xl">
        📝
      </div>
      <h2 className="text-lg font-semibold text-slate-800">No quizzes yet</h2>
      <p className="max-w-sm text-sm text-slate-500">
        Get started by creating your first quiz. Everything is saved locally in
        your browser.
      </p>
      <button className="btn-primary mt-2" onClick={onCreate}>
        + Create your first quiz
      </button>
    </div>
  );
}

function QuizCard({ quiz, onDelete }: { quiz: Quiz; onDelete: () => void }) {
  const marks = totalMarks(quiz);
  return (
    <div className="card flex flex-col p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 font-semibold text-slate-900">
          {quiz.meta.title || "Untitled Quiz"}
        </h3>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5 text-xs text-slate-500">
        {quiz.meta.subject ? (
          <span className="chip">{quiz.meta.subject}</span>
        ) : null}
        <span className="chip">{quiz.questions.length} questions</span>
        <span className="chip">{marks} marks</span>
      </div>
      <p className="mb-4 text-xs text-slate-400">
        Updated {new Date(quiz.updatedAt).toLocaleString()}
      </p>
      <div className="mt-auto flex flex-wrap gap-2">
        <Link href={`/quiz/${quiz.id}/edit`} className="btn-primary flex-1">
          Edit
        </Link>
        <Link href={`/quiz/${quiz.id}/generate`} className="btn-secondary">
          Generate
        </Link>
        <Link href={`/quiz/${quiz.id}/link`} className="btn-secondary">
          Link
        </Link>
        <button
          className="btn-danger"
          onClick={() => {
            if (
              confirm(
                `Delete "${quiz.meta.title || "this quiz"}"? This cannot be undone.`,
              )
            ) {
              onDelete();
            }
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
