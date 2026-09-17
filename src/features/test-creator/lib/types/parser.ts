export type OptionPosition = 1 | 2 | 3 | 4;

export type ParsedOption = {
  position: OptionPosition;
  text: string;
  needsVisualReview: boolean;
  image?: string;
};

export type AnswerSource =
  | "question-paper"
  | "answer-key"
  | "question-paper-and-key"
  | "conflict"
  | "none";

export type ParsedQuestion = {
  sourceNumber: number;
  sourceQuestionId?: string;
  sourcePage: number;

  text: string;
  image?: string;

  options: ParsedOption[];
  correctOptionPosition: OptionPosition | null;
  answerSource: AnswerSource;

  dropped: boolean;
  needsVisualReview: boolean;
  visualReason?: string;
  warnings: string[];
};

export type AnswerKeyEntry = {
  questionId: string;
  positions: OptionPosition[];
  dropped: boolean;
};

export type AnswerKeyMapping = {
  status: "mapped" | "partial" | "unmapped";
  matched: number;
  total: number;
  warning?: string;
};
