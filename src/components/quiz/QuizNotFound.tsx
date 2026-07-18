import Link from "next/link";
import { AppHeader } from "@/components/ui/AppHeader";

export function QuizLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-16 text-center text-sm text-slate-400">
        Loading quiz…
      </main>
    </div>
  );
}

export function QuizNotFound() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-lg font-semibold text-slate-800">Quiz not found</h1>
        <p className="mt-1 text-sm text-slate-500">
          It may have been deleted, or this link is from a different browser.
        </p>
        <Link href="/" className="btn-primary mt-4 inline-flex">
          Back to dashboard
        </Link>
      </main>
    </div>
  );
}
