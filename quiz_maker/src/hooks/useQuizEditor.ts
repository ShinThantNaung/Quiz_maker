"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Question, Quiz, QuizMeta, QuizSettings } from "@/types/quiz";
import { getQuiz, saveQuiz } from "@/lib/storage";
import { duplicateQuestion } from "@/utils/quiz";

export type SaveState = "idle" | "saving" | "saved";

/**
 * Editor hook for a single quiz. Loads it from storage by id, holds it in
 * React state, and debounce-autosaves every change back to localStorage.
 */
export function useQuizEditor(id: string) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstLoad = useRef(true);

  // Load once on mount.
  useEffect(() => {
    const found = getQuiz(id);
    if (found) {
      setQuiz(found);
    } else {
      setNotFound(true);
    }
    setLoaded(true);
  }, [id]);

  // Debounced autosave whenever the quiz changes (skip the initial load).
  useEffect(() => {
    if (!quiz) return;
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    setSaveState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveQuiz(quiz);
      setSaveState("saved");
    }, 500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [quiz]);

  const update = useCallback((updater: (prev: Quiz) => Quiz) => {
    setQuiz((prev) => (prev ? updater(prev) : prev));
  }, []);

  const setMeta = useCallback(
    (patch: Partial<QuizMeta>) => {
      update((q) => ({ ...q, meta: { ...q.meta, ...patch } }));
    },
    [update],
  );

  const setSettings = useCallback(
    (patch: Partial<QuizSettings>) => {
      update((q) => ({ ...q, settings: { ...q.settings, ...patch } }));
    },
    [update],
  );

  const setQuestions = useCallback(
    (questions: Question[]) => {
      update((q) => ({ ...q, questions }));
    },
    [update],
  );

  const addQuestion = useCallback(
    (question: Question) => {
      update((q) => ({ ...q, questions: [...q.questions, question] }));
    },
    [update],
  );

  const updateQuestion = useCallback(
    (question: Question) => {
      update((q) => ({
        ...q,
        questions: q.questions.map((item) => (item.id === question.id ? question : item)),
      }));
    },
    [update],
  );

  const removeQuestion = useCallback(
    (questionId: string) => {
      update((q) => ({ ...q, questions: q.questions.filter((item) => item.id !== questionId) }));
    },
    [update],
  );

  const duplicate = useCallback(
    (questionId: string) => {
      update((q) => {
        const idx = q.questions.findIndex((item) => item.id === questionId);
        if (idx === -1) return q;
        const copy = duplicateQuestion(q.questions[idx]);
        const next = [...q.questions];
        next.splice(idx + 1, 0, copy);
        return { ...q, questions: next };
      });
    },
    [update],
  );

  const move = useCallback(
    (from: number, to: number) => {
      update((q) => {
        if (to < 0 || to >= q.questions.length) return q;
        const next = [...q.questions];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return { ...q, questions: next };
      });
    },
    [update],
  );

  return {
    quiz,
    loaded,
    notFound,
    saveState,
    setMeta,
    setSettings,
    setQuestions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    duplicate,
    move,
  };
}
