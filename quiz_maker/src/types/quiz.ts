// Core domain types for the Quiz Maker.
// These types are shared by the builder UI, the preview, and the HTML generator,
// and are also the shape that gets serialized to localStorage / exported JSON.

export type QuestionType = "mcq" | "true-false" | "fill-blank";

export interface McqOption {
  id: string;
  text: string;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  /** The question text shown to the student. */
  prompt: string;
  /** Marks awarded for a fully correct answer. */
  marks: number;
}

export interface McqQuestion extends BaseQuestion {
  type: "mcq";
  options: McqOption[];
  /** id of the single correct option. */
  correctOptionId: string | null;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "true-false";
  correctAnswer: boolean;
}

/**
 * A single blank within a fill-in-the-blank question.
 * Blanks map, in order, to the `___` markers found in the prompt.
 */
export interface Blank {
  id: string;
  /** Any of these (case-insensitive, trimmed) count as correct. */
  acceptedAnswers: string[];
}

export interface FillBlankQuestion extends BaseQuestion {
  type: "fill-blank";
  /** Prompt text; each run of 3+ underscores (`___`) is a blank. */
  blanks: Blank[];
}

export type Question = McqQuestion | TrueFalseQuestion | FillBlankQuestion;

export interface QuizSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  enableTimer: boolean;
  /** Timer length in minutes; used only when enableTimer is true. */
  timerMinutes: number;
  autoSubmitOnTimeout: boolean;
  showCorrectAnswers: boolean;
  showScore: boolean;
  showPercentage: boolean;
  allowRetry: boolean;
}

export interface QuizMeta {
  title: string;
  subject: string;
  teacher: string;
  /** Human-readable duration label, e.g. "30 Minutes". */
  duration: string;
  instructions: string;
}

export interface Quiz {
  id: string;
  meta: QuizMeta;
  questions: Question[];
  settings: QuizSettings;
  createdAt: number;
  updatedAt: number;
}

/** Marker used inside fill-blank prompts to denote a blank. */
export const BLANK_MARKER = /_{3,}/g;
