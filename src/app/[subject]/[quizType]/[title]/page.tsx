import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuizByPath } from "@/database/publishedQuizzes";
import { QuizFrame } from "@/components/student/QuizFrame";

/**
 * Student-facing quiz route: /{subject}/{quizType}/{title}.
 *
 * A server component: it validates the URL segments, looks up the published
 * quiz in the database, and renders it full-screen. Because the quiz lives on
 * the server, the link opens on any device — not just the one that created it.
 * Missing/unpublished quizzes fall through to the segment's not-found page.
 */

type RouteParams = { subject: string; quizType: string; title: string };

// Always resolve against live data so freshly published/updated links work.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { subject, quizType, title } = await params;
  const quiz = await getQuizByPath(subject, quizType, title);
  return { title: quiz?.meta.title ? `${quiz.meta.title} · Quiz` : "Quiz not found" };
}

export default async function StudentQuizPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { subject, quizType, title } = await params;
  const quiz = await getQuizByPath(subject, quizType, title);
  if (!quiz) notFound();
  return <QuizFrame quiz={quiz} />;
}
