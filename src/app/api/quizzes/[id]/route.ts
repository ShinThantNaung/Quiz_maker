// Route handlers for a single published quiz, keyed by its database id.
//
//   GET    /api/quizzes/[id]  → the link's metadata (payload-free)
//   PATCH  /api/quizzes/[id]  → replace its content with a fresh quiz, same URL
//   DELETE /api/quizzes/[id]  → unpublish (remove) the link
//
// PATCH powers "Update Published Quiz": the teacher edits in the builder, then
// refreshes the already-shared link in place so its URL keeps working.

import { NextResponse } from "next/server";
import { getLinkById, isQuizShape, remove, update } from "@/database/publishedQuizzes";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const link = await getLinkById(id);
  if (!link) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json(link);
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;

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

  const link = await update(id, quiz);
  if (!link) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json(link);
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  const ok = await remove(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
