"use client";

import { useCallback, useEffect, useState } from "react";
import type { Quiz } from "@/types/quiz";
import type { PublishedLink } from "@/types/published";
import {
  deletePublished,
  findLinksForQuiz,
  listPublished,
  publishQuiz,
  updatePublishedQuiz,
} from "@/lib/publish";

/**
 * Published-links hook for the teacher UI. Pass a `sourceId` to scope the list
 * to one quiz (the Create Link page), or omit it to list every link (dashboard).
 * Backed by the server API, so lists reflect what students can actually open.
 */
export function usePublished(sourceId?: string) {
  const [links, setLinks] = useState<PublishedLink[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = sourceId ? await findLinksForQuiz(sourceId) : await listPublished();
      setLinks(next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load links.");
    } finally {
      setReady(true);
    }
  }, [sourceId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const publish = useCallback(
    async (quiz: Quiz) => {
      const link = await publishQuiz(quiz);
      await refresh();
      return link;
    },
    [refresh],
  );

  const update = useCallback(
    async (id: string, quiz: Quiz) => {
      const link = await updatePublishedQuiz(id, quiz);
      await refresh();
      return link;
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await deletePublished(id);
      await refresh();
    },
    [refresh],
  );

  return { links, ready, error, refresh, publish, update, remove };
}
