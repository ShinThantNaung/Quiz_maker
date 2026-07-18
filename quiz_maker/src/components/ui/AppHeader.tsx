import Link from "next/link";

interface AppHeaderProps {
  /** Optional right-aligned actions (buttons, status, etc.). */
  actions?: React.ReactNode;
  /** Optional secondary line under the title (e.g. quiz title + save state). */
  subtitle?: React.ReactNode;
}

export function AppHeader({ actions, subtitle }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm text-white">
              QM
            </span>
            Quiz Maker
          </Link>
          {subtitle ? <div className="mt-0.5 truncate text-sm text-slate-500">{subtitle}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
