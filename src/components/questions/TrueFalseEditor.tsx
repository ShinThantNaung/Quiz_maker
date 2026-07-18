"use client";

import type { TrueFalseQuestion } from "@/types/quiz";

interface Props {
  question: TrueFalseQuestion;
  onChange: (q: TrueFalseQuestion) => void;
}

export function TrueFalseEditor({ question, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="label">Statement</label>
        <textarea
          className="input min-h-[64px] resize-y"
          placeholder="Enter a statement that is either true or false"
          value={question.prompt}
          onChange={(e) => onChange({ ...question, prompt: e.target.value })}
        />
      </div>
      <div>
        <span className="label">Correct answer</span>
        <div className="flex gap-2">
          {[true, false].map((val) => (
            <button
              key={String(val)}
              type="button"
              onClick={() => onChange({ ...question, correctAnswer: val })}
              className={
                "flex-1 rounded-lg border px-4 py-2 text-sm font-semibold transition " +
                (question.correctAnswer === val
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50")
              }
            >
              {val ? "True" : "False"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
