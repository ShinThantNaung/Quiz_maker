"use client";

import { useState } from "react";
import type { PublishedLink } from "@/lib/publish";

interface Props {
  link: PublishedLink;
  /** Absolute origin (e.g. "https://host"); links resolve to origin + path. */
  origin: string;
  onDelete: (id: string) => void;
  /** When provided, an "Update link" action re-publishes fresh quiz data. */
  onUpdate?: (link: PublishedLink) => void;
  /** True when the source quiz changed after this link was published. */
  stale?: boolean;
}

/** One published link with Copy / Open / Update / Delete controls. */
export function PublishedLinkRow({ link, origin, onDelete, onUpdate, stale }: Props) {
  const [copied, setCopied] = useState(false);
  const fullUrl = origin + link.path;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch {
      // Clipboard blocked (insecure context, denied permission): fall back.
      window.prompt("Copy this link:", fullUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded bg-white px-2 py-1 text-sm text-slate-700">
          {link.path}
        </code>
        <button className="btn-secondary" onClick={copy}>
          {copied ? "Copied ✓" : "Copy Link"}
        </button>
        <a href={link.path} target="_blank" rel="noopener noreferrer" className="btn-ghost">
          Open ↗
        </a>
        <button
          className="btn-danger"
          onClick={() => {
            if (confirm(`Delete link ${link.path}? Students with it will no longer be able to open the quiz.`)) {
              onDelete(link.id);
            }
          }}
        >
          Delete
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span>{link.questionCount} questions</span>
        <span>{link.totalMarks} marks</span>
        <span>Published {new Date(link.publishedAt).toLocaleString()}</span>
      </div>

      {onUpdate && stale && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-2">
          <span className="text-xs text-amber-700">
            The quiz changed since this link was published.
          </span>
          <button className="btn-primary" onClick={() => onUpdate(link)}>
            Update Published Link
          </button>
        </div>
      )}
    </div>
  );
}
