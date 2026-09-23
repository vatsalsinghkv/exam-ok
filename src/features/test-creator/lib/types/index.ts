import type { ParsedQuestion } from "./parser";

export type VisualExtractor = {
  extractQuestionImage(input: {
    pdf: Uint8Array;
    page: number;
    questionNumber: number;
  }): Promise<string>;

  extractOptionImages?(input: {
    pdf: Uint8Array;
    page: number;
    questionNumber: number;
  }): Promise<string[]>;
};

export type ParsedTest = {
  name: string;
  questionCount: number;
  answerKey: {
    status: "not-provided" | "mapped" | "partial" | "unmapped";
    matched: number;
    total: number;
  };
  visualReviewCount: number;
  questions: ParsedQuestion[];
};
