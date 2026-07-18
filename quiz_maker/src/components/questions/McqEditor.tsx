"use client";

import type { McqQuestion } from "@/types/quiz";
import { uid } from "@/utils/id";

interface Props {
  question: McqQuestion;
  onChange: (q: McqQuestion) => void;
}

export function McqEditor({ question, onChange }: Props) {
  const setOptionText = (id: string, text: string) => {
    onChange({
      ...question,
      options: question.options.map((o) => (o.id === id ? { ...o, text } : o)),
    });
  };

  const addOption = () => {
    onChange({ ...question, options: [...question.options, { id: uid("o_"), text: "" }] });
  };

  const removeOption = (id: string) => {
    if (question.options.length <= 2) return;
    onChange({
      ...question,
      options: question.options.filter((o) => o.id !== id),
      correctOptionId: question.correctOptionId === id ? null : question.correctOptionId,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Question</label>
        <textarea
          className="input min-h-[64px] resize-y"
          placeholder="Enter the question text"
          value={question.prompt}
          onChange={(e) => onChange({ ...question, prompt: e.target.value })}
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="label mb-0">Options</span>
          <span className="text-xs text-slate-500">Select the correct answer</span>
        </div>
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            const isCorrect = question.correctOptionId === opt.id;
            return (
              <div
                key={opt.id}
                className={
                  "flex items-center gap-2 rounded-lg border p-2 " +
                  (isCorrect ? "border-green-400 bg-green-50" : "border-slate-200")
                }
              >
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  className="h-4 w-4 accent-green-600"
                  checked={isCorrect}
                  onChange={() => onChange({ ...question, correctOptionId: opt.id })}
                  aria-label={`Mark option ${i + 1} correct`}
                />
                <input
                  className="input"
                  placeholder={`Option ${i + 1}`}
                  value={opt.text}
                  onChange={(e) => setOptionText(opt.id, e.target.value)}
                />
                <button
                  type="button"
                  className="btn-ghost px-2 text-red-500"
                  onClick={() => removeOption(opt.id)}
                  disabled={question.options.length <= 2}
                  title={question.options.length <= 2 ? "At least 2 options required" : "Remove option"}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
        <button type="button" className="btn-secondary mt-2" onClick={addOption}>
          + Add Option
        </button>
      </div>
    </div>
  );
}
