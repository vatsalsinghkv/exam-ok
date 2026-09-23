import type { ParsedTest } from ".";

type AnswerKeyStatus = "not-provided" | "mapped" | "partial" | "unmapped";

export type AnswerKeyResult = {
  status: AnswerKeyStatus;
  matched: number;
  total: number;
};

type ParsePdfSuccess = {
  success: true;
  data: ParsedTest;
};

type ParsePdfFailure = {
  success: false;
  error: string;
};

export type ParsePdfResult = ParsePdfSuccess | ParsePdfFailure;
