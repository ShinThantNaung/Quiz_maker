// Route handlers for the published-quiz collection.
//
//   POST /api/quizzes            → publish a quiz to a new shareable link
//   GET  /api/quizzes            → list every published link
//   GET  /api/quizzes?sourceId=… → list links generated from one editor quiz
//
// The teacher UI holds quizzes in localStorage, so publishing sends the full
// quiz in the request body. Student answers are never received or stored here.

import { NextResponse } from "next/server";
import { isQuizShape, list, publish } from "@/database/publishedQuizzes";
import { apiError } from "@/lib/apiError";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const quiz = (body as { quiz?: unknown })?.quiz;
  if (!isQuizShape(quiz)) {
    return NextResponse.json({ error: "A valid quiz is required." }, { status: 400 });
  }
  if (quiz.questions.length === 0) {
    return NextResponse.json({ error: "Cannot publish a quiz with no questions." }, { status: 400 });
  }

  try {
    const link = await publish(quiz);
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    return apiError("POST /api/quizzes", error);
  }
}

export async function GET(request: Request) {
  const sourceId = new URL(request.url).searchParams.get("sourceId") ?? undefined;
  try {
    const links = await list(sourceId);
    return NextResponse.json(links);
  } catch (error) {
    return apiError("GET /api/quizzes", error);
  }
}
