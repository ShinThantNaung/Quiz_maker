// Shared types for the publishing feature.
//
// `PublishedLink` is the payload-free description of a published quiz — safe to
// send to the teacher dashboard. It never carries the answer key or the full
// question payload; that lives only in the database and is streamed straight
// into the rendered quiz. These types are used on both the client (fetch
// wrappers) and the server (route handlers / DB layer).

/** Public, render-payload-free description of a published link. */
export interface PublishedLink {
  /** Database id of the published quiz (targets PATCH / DELETE). */
  id: string;
  /** Editor quiz id this link was generated from. */
  sourceId: string;
  /** Canonical resolvable path, e.g. "/chemistry/mcq/periodic-table-day-1". */
  path: string;
  /** Slugified URL segments. */
  subject: string;
  quizType: string;
  title: string;
  /** Original (un-slugified) title/subject for display. */
  displayTitle: string;
  displaySubject: string;
  questionCount: number;
  totalMarks: number;
  /** ms epoch — when the link was first created. */
  publishedAt: number;
  /** Editor quiz.updatedAt (ms) captured at publish; used to detect edits. */
  sourceUpdatedAt: number;
}
