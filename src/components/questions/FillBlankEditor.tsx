"use client";

import type { Blank, FillBlankQuestion } from "@/types/quiz";
import { countBlankMarkers } from "@/utils/quiz";
import { uid } from "@/utils/id";

interface Props {
  question: FillBlankQuestion;
  onChange: (q: FillBlankQuestion) => void;
}

export function FillBlankEditor({ question, onChange }: Props) {
  const markerCount = countBlankMarkers(question.prompt);

  // Keep the blanks array length in sync with the number of ___ markers,
  // preserving existing accepted answers by position.
  const syncBlanks = (prompt: string): Blank[] => {
    const count = countBlankMarkers(prompt);
    const next: Blank[] = [];
    for (let i = 0; i < count; i++) {
      next.push(question.blanks[i] ?? { id: uid("b_"), acceptedAnswers: [""] });
    }
    return next;
  };

  const onPromptChange = (prompt: string) => {
    onChange({ ...question, prompt, blanks: syncBlanks(prompt) });
  };

  const setAccepted = (blankId: string, raw: string) => {
    const acceptedAnswers = raw.split("\n").map((s) => s.replace(/\r$/, ""));
    onChange({
      ...question,
      blanks: question.blanks.map((b) => (b.id === blankId ? { ...b, acceptedAnswers } : b)),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Question</label>
        <textarea
          className="input min-h-[64px] resize-y"
          placeholder="Use ___ (three underscores) for each blank. e.g. HTML stands for ___."
          value={question.prompt}
          onChange={(e) => onPromptChange(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-500">
          Insert <code className="rounded bg-slate-100 px-1">___</code> for each blank.{" "}
          {markerCount === 0 ? (
            <span className="font-medium text-amber-600">No blank detected.</span>
          ) : (
            <span>
              {markerCount} blank{markerCount === 1 ? "" : "s"} detected.
            </span>
          )}
        </p>
      </div>

      {question.blanks.map((b, i) => (
        <div key={b.id} className="rounded-lg border border-slate-200 p-3">
          <label className="label">
            {question.blanks.length > 1 ? `Blank ${i + 1} — ` : ""}Accepted answers
          </label>
          <textarea
            className="input min-h-[64px] resize-y font-mono text-sm"
            placeholder={"One accepted answer per line, e.g.\nHyperText Markup Language\nHyper Text Markup Language"}
            value={b.acceptedAnswers.join("\n")}
            onChange={(e) => setAccepted(b.id, e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500">
            One per line. Checking ignores capitalization and extra spaces.
          </p>
        </div>
      ))}
    </div>
  );
}
