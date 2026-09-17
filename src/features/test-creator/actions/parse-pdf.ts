"use server";

import { extractText } from "unpdf";
import { MAX_FILE_SIZE } from "../lib/constants";
import {
  mergeAnswerKey,
  parseAnswerKey,
  parseQuestionPaper,
} from "../lib/parser";

import type { AnswerKeyResult, ParsePdfResult } from "../lib/types/actions";

async function extractPdfPages(file: File) {
  const buffer = new Uint8Array(await file.arrayBuffer());

  const parsed = await extractText(buffer);

  return Array.isArray(parsed.text) ? parsed.text : [parsed.text];
}

function validatePdf(file: File | null, name: string) {
  if (!file) {
    throw new Error(`${name} is required.`);
  }

  if (file.type !== "application/pdf") {
    throw new Error(`${name} must be a PDF.`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`${name} must be smaller than 50 MB.`);
  }
}

function getDefaultTestName(filename: string) {
  return filename
    .replace(/\.pdf$/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

export async function parsePdfAction(
  formData: FormData,
): Promise<ParsePdfResult> {
  try {
    const questionFile = formData.get("questionFile") as File | null;
    const answerKeyFile = formData.get("answerKeyFile") as File | null;

    validatePdf(questionFile, "Question file");

    if (answerKeyFile && answerKeyFile.size > 0) {
      validatePdf(answerKeyFile, "Answer key");
    }

    if (!questionFile) throw Error("Couldn't parse questionFile");

    const questionPages = await extractPdfPages(questionFile);
    const questions = parseQuestionPaper(questionPages);

    if (questions.length === 0) {
      return {
        success: false,
        error:
          "No multiple-choice questions could be detected. The PDF may be scanned or use an unsupported format.",
      };
    }

    let finalQuestions = questions;

    let answerKeyResult: AnswerKeyResult = {
      status: "not-provided",
      matched: 0,
      total: questions.length,
    };

    if (answerKeyFile && answerKeyFile.size > 0) {
      const answerPages = await extractPdfPages(answerKeyFile);
      const answerKeyText = answerPages.join("\n");

      const answerKey = parseAnswerKey(answerKeyText);

      const mapping = mergeAnswerKey(questions, answerKey);

      finalQuestions = mapping.questions;

      answerKeyResult = {
        status: mapping.status,
        matched: mapping.matched,
        total: mapping.total,
      };
    }

    return {
      success: true,

      data: {
        name: getDefaultTestName(questionFile.name),
        questionCount: finalQuestions.length,
        answerKey: answerKeyResult,
        visualReviewCount: finalQuestions.filter(
          (question) => question.needsVisualReview,
        ).length,
        questions: finalQuestions,
      },
    };
  } catch (error) {
    console.error("PDF parsing failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process PDF.",
    };
  }
}
