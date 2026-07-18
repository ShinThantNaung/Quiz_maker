"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuizEditor } from "@/hooks/useQuizEditor";
import { AppHeader } from "@/components/ui/AppHeader";
import { QuizNav } from "@/components/quiz/QuizNav";
import { SaveBadge } from "@/components/quiz/SaveBadge";
import { QuizLoading, QuizNotFound } from "@/components/quiz/QuizNotFound";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default function SettingsPage() {
  const { id } = useParams<{ id: string }>();
  const { quiz, loaded, notFound, saveState, setSettings } = useQuizEditor(id);

  if (!loaded) return <QuizLoading />;
  if (notFound || !quiz) return <QuizNotFound />;

  return (
    <div className="min-h-screen">
      <AppHeader
        subtitle={
          <span className="flex items-center gap-3">
            <span className="truncate">{quiz.meta.title || "Untitled Quiz"}</span>
            <SaveBadge state={saveState} />
          </span>
        }
        actions={
          <Link href="/" className="btn-ghost">
            ← Dashboard
          </Link>
        }
      />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <QuizNav quizId={quiz.id} />
        <div>
          <h1 className="mb-1 text-xl font-bold text-slate-900">Quiz Settings</h1>
          <p className="mb-4 text-sm text-slate-500">
            These options are baked into the generated HTML file.
          </p>
        </div>
        <SettingsForm settings={quiz.settings} onChange={setSettings} />
      </main>
    </div>
  );
}
