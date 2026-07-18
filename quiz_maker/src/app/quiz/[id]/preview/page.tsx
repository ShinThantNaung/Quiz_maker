"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuizEditor } from "@/hooks/useQuizEditor";
import { AppHeader } from "@/components/ui/AppHeader";
import { QuizNav } from "@/components/quiz/QuizNav";
import { QuizLoading, QuizNotFound } from "@/components/quiz/QuizNotFound";
import { QuizPreview } from "@/components/preview/QuizPreview";

export default function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const { quiz, loaded, notFound } = useQuizEditor(id);

  if (!loaded) return <QuizLoading />;
  if (notFound || !quiz) return <QuizNotFound />;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        subtitle={<span className="truncate">{quiz.meta.title || "Untitled Quiz"}</span>}
        actions={
          <Link href="/" className="btn-ghost">
            ← Dashboard
          </Link>
        }
      />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6">
        <QuizNav quizId={quiz.id} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Preview</h1>
            <p className="text-sm text-slate-500">
              Exactly what students see in the exported file. Fully interactive — try submitting.
            </p>
          </div>
        </div>
        {quiz.questions.length === 0 ? (
          <div className="card grid place-items-center p-10 text-center text-sm text-slate-500">
            Add some questions first to see the preview.
          </div>
        ) : (
          <div className="min-h-[70vh] flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <QuizPreview quiz={quiz} />
          </div>
        )}
      </main>
    </div>
  );
}
