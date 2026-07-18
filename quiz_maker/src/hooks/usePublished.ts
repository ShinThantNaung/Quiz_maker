"use client";

import { useCallback, useEffect, useState } from "react";
import type { Quiz } from "@/types/quiz";
import {
  deletePublished,
  findLinksForQuiz,
  listPublished,
  publishQuiz,
  type PublishedLink,
} from "@/lib/publish";

/**
 * Published-links hook for the teacher UI. Pass a `sourceId` to scope the list
 * to one quiz (the Create Link page), or omit it to list every link (dashboard).
 */
export function usePublished(sourceId?: string) {
  const [links, setLinks] = useState<PublishedLink[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setLinks(sourceId ? findLinksForQuiz(sourceId) : listPublished());
  }, [sourceId]);

  useEffect(() => {
    refresh();
    setReady(true);
    // Keep in sync if another tab publishes or deletes a link.
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const publish = useCallback(
    async (quiz: Quiz, options?: { path?: string }) => {
      const link = await publishQuiz(quiz, options);
      refresh();
      return link;
    },
    [refresh],
  );

  const remove = useCallback(
    (path: string) => {
      deletePublished(path);
      refresh();
    },
    [refresh],
  );

  return { links, ready, refresh, publish, remove };
}
