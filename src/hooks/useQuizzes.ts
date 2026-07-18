"use client";

import { useCallback, useEffect, useState } from "react";
import type { Quiz } from "@/types/quiz";
import { deleteQuiz, listQuizzes, saveQuiz } from "@/lib/storage";

/** Dashboard-level hook: the list of saved quizzes plus mutators. */
export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setQuizzes(listQuizzes());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
    // Keep in sync if another tab edits storage.
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const remove = useCallback(
    (id: string) => {
      deleteQuiz(id);
      refresh();
    },
    [refresh],
  );

  const importQuiz = useCallback(
    (quiz: Quiz) => {
      saveQuiz(quiz);
      refresh();
    },
    [refresh],
  );

  return { quizzes, ready, refresh, remove, importQuiz };
}
