"use client";

import { useState } from "react";
import type { Question } from "@/types/quiz";
import { QuestionCard } from "./QuestionCard";

interface Props {
  questions: Question[];
  onChange: (q: Question) => void;
  onMove: (from: number, to: number) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function QuestionList({ questions, onChange, onMove, onDuplicate, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDrop = (target: number) => {
    if (dragIndex !== null && dragIndex !== target) {
      onMove(dragIndex, target);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <div
          key={q.id}
          onDragOver={(e) => {
            if (dragIndex === null) return;
            e.preventDefault();
            if (overIndex !== i) setOverIndex(i);
          }}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(i);
          }}
          className={
            overIndex === i && dragIndex !== null && dragIndex !== i
              ? "rounded-xl ring-2 ring-brand-300 ring-offset-2"
              : ""
          }
        >
          <QuestionCard
            question={q}
            index={i}
            total={questions.length}
            collapsed={collapsed.has(q.id)}
            onToggleCollapse={() => toggleCollapse(q.id)}
            onChange={onChange}
            onMoveUp={() => onMove(i, i - 1)}
            onMoveDown={() => onMove(i, i + 1)}
            onDuplicate={() => onDuplicate(q.id)}
            onDelete={() => onDelete(q.id)}
            isDragging={dragIndex === i}
            dragHandleProps={{
              draggable: true,
              onDragStart: (e) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = "move";
                // Some browsers require data to be set for dragging to start.
                e.dataTransfer.setData("text/plain", String(i));
              },
              onDragEnd: () => {
                setDragIndex(null);
                setOverIndex(null);
              },
            }}
          />
        </div>
      ))}
    </div>
  );
}
