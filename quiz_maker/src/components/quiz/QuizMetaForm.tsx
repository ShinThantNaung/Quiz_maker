"use client";

import type { QuizMeta } from "@/types/quiz";

interface Props {
  meta: QuizMeta;
  totalMarks: number;
  onChange: (patch: Partial<QuizMeta>) => void;
}

export function QuizMetaForm({ meta, totalMarks, onChange }: Props) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">Quiz Information</h2>
        <span className="chip">Total Marks: {totalMarks}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Quiz title</label>
          <input
            className="input"
            placeholder="e.g. Programming Fundamentals Quiz"
            value={meta.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Subject</label>
          <input
            className="input"
            placeholder="e.g. Computer Science"
            value={meta.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Teacher name</label>
          <input
            className="input"
            placeholder="e.g. John Doe"
            value={meta.teacher}
            onChange={(e) => onChange({ teacher: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Duration</label>
          <input
            className="input"
            placeholder="e.g. 30 Minutes"
            value={meta.duration}
            onChange={(e) => onChange({ duration: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Instructions</label>
          <textarea
            className="input min-h-[80px] resize-y"
            placeholder="Instructions shown to students before they begin."
            value={meta.instructions}
            onChange={(e) => onChange({ instructions: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
