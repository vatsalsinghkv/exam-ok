import type { OptionPosition } from "./parser";

export type ReviewTestPayload = {
  testId?: string;
  name: string;
  description: string;
  duration: number | null;
  marksPerQuestion: number;
  negativeMark: number;
  questions: Array<{
    sourceNumber: number;
    text: string;
    image?: string;
    options: Array<{
      position: OptionPosition;
      text: string;
      image?: string;
    }>;
    correctOptionPosition: OptionPosition | null;
  }>;
};

export type SaveTestResult =
  | {
      success: true;
      testId: string;
    }
  | {
      success: false;
      error: string;
    };
