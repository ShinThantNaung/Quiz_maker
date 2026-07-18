import Link from "next/link";

/** Shown when a student opens a link with no matching published quiz. */
export default function QuizNotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="card max-w-md p-8 text-center">
        <h1 className="text-lg font-semibold text-slate-800">Quiz not available</h1>
        <p className="mt-2 text-sm text-slate-500">
          This quiz link couldn&apos;t be found. It may have been unpublished by the teacher, or the
          link may be mistyped.
        </p>
        <Link href="/" className="btn-secondary mt-4 inline-flex">
          Go to Quiz Maker
        </Link>
      </div>
    </div>
  );
}
