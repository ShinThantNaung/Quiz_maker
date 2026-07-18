"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import type { QuestionType } from "@/types/quiz";
import { useQuizEditor } from "@/hooks/useQuizEditor";
import { createQuestion, totalMarks } from "@/utils/quiz";
import { generateHtml, suggestedFileName } from "@/lib/generator";
import { downloadTextFile } from "@/utils/download";
import { AppHeader } from "@/components/ui/AppHeader";
import { QuizNav } from "@/components/quiz/QuizNav";
import { SaveBadge } from "@/components/quiz/SaveBadge";
import { QuizLoading, QuizNotFound } from "@/components/quiz/QuizNotFound";
import { QuizMetaForm } from "@/components/quiz/QuizMetaForm";
import { QuestionList } from "@/components/questions/QuestionList";

const ADD_BUTTONS: { type: QuestionType; label: string }[] = [
  { type: "mcq", label: "+ MCQ" },
  { type: "true-false", label: "+ True / False" },
  { type: "fill-blank", label: "+ Fill Blank" },
];

export default function EditQuizPage() {
  const { id } = useParams<{ id: string }>();
  const editor = useQuizEditor(id);
  const {
    quiz,
    loaded,
    notFound,
    saveState,
    setMeta,
    addQuestion,
    updateQuestion,
    removeQuestion,
    duplicate,
    move,
  } = editor;

  if (!loaded) return <QuizLoading />;
  if (notFound || !quiz) return <QuizNotFound />;

  const exportJson = () => {
    downloadTextFile(
      suggestedFileName(quiz).replace(/\.html$/, ".json"),
      JSON.stringify(quiz, null, 2),
      "application/json",
    );
  };

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
          <>
            <Link href="/" className="btn-ghost">
              ← Dashboard
            </Link>
            <button className="btn-secondary" onClick={exportJson}>
              Export JSON
            </button>
          </>
        }
      />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <QuizNav quizId={quiz.id} />

        <QuizMetaForm meta={quiz.meta} totalMarks={totalMarks(quiz)} onChange={setMeta} />

        <div className="card flex flex-wrap items-center gap-2 p-4">
          <span className="mr-1 text-sm font-medium text-slate-600">Add question:</span>
          {ADD_BUTTONS.map((b) => (
            <button
              key={b.type}
              className="btn-secondary"
              onClick={() => addQuestion(createQuestion(b.type))}
            >
              {b.label}
            </button>
          ))}
        </div>

        {quiz.questions.length === 0 ? (
          <div className="card grid place-items-center gap-2 p-10 text-center text-sm text-slate-500">
            <span className="text-2xl">➕</span>
            No questions yet. Use the buttons above to add your first question.
          </div>
        ) : (
          <QuestionList
            questions={quiz.questions}
            onChange={updateQuestion}
            onMove={move}
            onDuplicate={duplicate}
            onDelete={removeQuestion}
          />
        )}

        {quiz.questions.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className="text-sm text-slate-600">
              {quiz.questions.length} questions · {totalMarks(quiz)} total marks
            </span>
            <div className="flex gap-2">
              <Link href={`/quiz/${quiz.id}/preview`} className="btn-secondary">
                Preview
              </Link>
              <button
                className="btn-primary"
                onClick={() =>
                  downloadTextFile(suggestedFileName(quiz), generateHtml(quiz), "text/html")
                }
              >
                Download HTML
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
