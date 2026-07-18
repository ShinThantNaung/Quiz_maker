"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { slug: "edit", label: "Build" },
  { slug: "settings", label: "Settings" },
  { slug: "preview", label: "Preview" },
  { slug: "generate", label: "Generate HTML" },
  { slug: "link", label: "Create Link" },
];

export function QuizNav({ quizId }: { quizId: string }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {TABS.map((tab) => {
        const href = `/quiz/${quizId}/${tab.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={tab.slug}
            href={href}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-medium transition " +
              (active ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100")
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
