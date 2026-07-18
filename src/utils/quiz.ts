import {
  BLANK_MARKER,
  type FillBlankQuestion,
  type McqQuestion,
  type Question,
  type QuestionType,
  type Quiz,
  type QuizSettings,
  type TrueFalseQuestion,
} from "@/types/quiz";
import { uid } from "@/utils/id";

export function defaultSettings(): QuizSettings {
  return {
    shuffleQuestions: false,
    shuffleOptions: false,
    enableTimer: false,
    timerMinutes: 30,
    autoSubmitOnTimeout: true,
    showCorrectAnswers: true,
    showScore: true,
    showPercentage: true,
    allowRetry: true,
  };
}

export function createMcqQuestion(): McqQuestion {
  return {
    id: uid("q_"),
    type: "mcq",
    prompt: "",
    marks: 1,
    options: [
      { id: uid("o_"), text: "" },
      { id: uid("o_"), text: "" },
    ],
    correctOptionId: null,
  };
}

export function createTrueFalseQuestion(): TrueFalseQuestion {
  return {
    id: uid("q_"),
    type: "true-false",
    prompt: "",
    marks: 1,
    correctAnswer: true,
  };
}

export function createFillBlankQuestion(): FillBlankQuestion {
  return {
    id: uid("q_"),
    type: "fill-blank",
    prompt: "The capital of France is ___.",
    marks: 1,
    blanks: [{ id: uid("b_"), acceptedAnswers: ["Paris"] }],
  };
}

export function createQuestion(type: QuestionType): Question {
  switch (type) {
    case "mcq":
      return createMcqQuestion();
    case "true-false":
      return createTrueFalseQuestion();
    case "fill-blank":
      return createFillBlankQuestion();
  }
}

export function createQuiz(): Quiz {
  const now = Date.now();
  return {
    id: uid("quiz_"),
    meta: {
      title: "Untitled Quiz",
      subject: "",
      teacher: "",
      duration: "30 Minutes",
      instructions: "",
    },
    questions: [],
    settings: defaultSettings(),
    createdAt: now,
    updatedAt: now,
  };
}

/** Deep-clone a question and assign fresh ids (for duplicate). */
export function duplicateQuestion(q: Question): Question {
  const base = { ...q, id: uid("q_") };
  if (base.type === "mcq") {
    const idMap = new Map<string, string>();
    const options = base.options.map((o) => {
      const nid = uid("o_");
      idMap.set(o.id, nid);
      return { ...o, id: nid };
    });
    return {
      ...base,
      options,
      correctOptionId: base.correctOptionId
        ? idMap.get(base.correctOptionId) ?? null
        : null,
    };
  }
  if (base.type === "fill-blank") {
    return {
      ...base,
      blanks: base.blanks.map((b) => ({
        id: uid("b_"),
        acceptedAnswers: [...b.acceptedAnswers],
      })),
    };
  }
  return { ...base };
}

/** Total marks = sum of every question's marks. */
export function totalMarks(quiz: Quiz): number {
  return quiz.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
}

/** Count of `___` markers in a fill-blank prompt. */
export function countBlankMarkers(prompt: string): number {
  const matches = prompt.match(BLANK_MARKER);
  return matches ? matches.length : 0;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: "Multiple Choice",
  "true-false": "True / False",
  "fill-blank": "Fill in the Blank",
};

/** Slug used in a published link's {quizType} segment when questions differ. */
export const MIXED_QUIZ_TYPE = "mixed";

/**
 * Derive the {quizType} URL segment for a quiz. When every question shares a
 * type we use that type's slug (e.g. "mcq"); a mix of types becomes "mixed".
 */
export function deriveQuizType(quiz: Quiz): string {
  const types = new Set(quiz.questions.map((q) => q.type));
  if (types.size === 1) return quiz.questions[0].type;
  return MIXED_QUIZ_TYPE;
}

export const QUIZ_TYPE_LABELS: Record<string, string> = {
  ...QUESTION_TYPE_LABELS,
  [MIXED_QUIZ_TYPE]: "Mixed",
};
