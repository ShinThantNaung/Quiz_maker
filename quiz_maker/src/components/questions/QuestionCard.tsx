"use client";

import type { Question } from "@/types/quiz";
import { QUESTION_TYPE_LABELS } from "@/utils/quiz";
import { McqEditor } from "./McqEditor";
import { TrueFalseEditor } from "./TrueFalseEditor";
import { FillBlankEditor } from "./FillBlankEditor";

interface Props {
  question: Question;
  index: number;
  total: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onChange: (q: Question) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  // Native drag-and-drop wiring provided by the list.
  dragHandleProps: React.HTMLAttributes<HTMLButtonElement>;
  isDragging: boolean;
}

function summarize(q: Question): string {
  const text = q.prompt.replace(/\s+/g, " ").trim();
  if (!text) return "Untitled question";
  return text.length > 80 ? text.slice(0, 80) + "…" : text;
}

export function QuestionCard({
  question,
  index,
  total,
  collapsed,
  onToggleCollapse,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  dragHandleProps,
  isDragging,
}: Props) {
  return (
    <div
      className={
        "card overflow-hidden transition " +
        (isDragging ? "opacity-60 ring-2 ring-brand-400" : "")
      }
    >
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <button
          type="button"
          {...dragHandleProps}
          className="cursor-grab select-none px-1 text-slate-400 hover:text-slate-600 active:cursor-grabbing"
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          ⠿
        </button>
        <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {index + 1}
        </span>
        <span className="chip">{QUESTION_TYPE_LABELS[question.type]}</span>

        <div className="ml-auto flex items-center gap-1">
          <label className="flex items-center gap-1 pr-1 text-xs text-slate-500">
            Marks
            <input
              type="number"
              min={0}
              step={1}
              className="input w-16 px-2 py-1"
              value={question.marks}
              onChange={(e) => onChange({ ...question, marks: Number(e.target.value) })}
            />
          </label>
          <IconBtn title="Move up" disabled={index === 0} onClick={onMoveUp}>↑</IconBtn>
          <IconBtn title="Move down" disabled={index === total - 1} onClick={onMoveDown}>↓</IconBtn>
          <IconBtn title="Duplicate" onClick={onDuplicate}>⧉</IconBtn>
          <IconBtn title="Delete" onClick={onDelete} danger>🗑</IconBtn>
          <IconBtn title={collapsed ? "Expand" : "Collapse"} onClick={onToggleCollapse}>
            {collapsed ? "▸" : "▾"}
          </IconBtn>
        </div>
      </div>

      {collapsed ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="block w-full truncate px-4 py-3 text-left text-sm text-slate-500 hover:bg-slate-50"
        >
          {summarize(question)}
        </button>
      ) : (
        <div className="p-4">
          {question.type === "mcq" && <McqEditor question={question} onChange={onChange} />}
          {question.type === "true-false" && (
            <TrueFalseEditor question={question} onChange={onChange} />
          )}
          {question.type === "fill-blank" && (
            <FillBlankEditor question={question} onChange={onChange} />
          )}
        </div>
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={
        "grid h-7 w-7 place-items-center rounded-md text-sm transition disabled:opacity-30 " +
        (danger ? "text-red-500 hover:bg-red-50" : "text-slate-500 hover:bg-slate-200")
      }
    >
      {children}
    </button>
  );
}
