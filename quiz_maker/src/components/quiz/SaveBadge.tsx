import type { SaveState } from "@/hooks/useQuizEditor";

const MAP: Record<SaveState, { text: string; cls: string }> = {
  idle: { text: "All changes saved", cls: "text-slate-400" },
  saving: { text: "Saving…", cls: "text-amber-500" },
  saved: { text: "Saved ✓", cls: "text-green-600" },
};

export function SaveBadge({ state }: { state: SaveState }) {
  const { text, cls } = MAP[state];
  return <span className={"text-xs font-medium " + cls}>{text}</span>;
}
