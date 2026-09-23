import type {
  AnswerKeyEntry,
  OptionPosition,
  ParsedQuestion,
} from "../types/parser";

const QUESTION_ID = /^\d{8,20}$/;

function parseAnswer(value: string) {
  const normalized = value.trim().toUpperCase();

  if (normalized === "D") {
    return {
      positions: [] as OptionPosition[],
      dropped: true,
    };
  }

  const positions = [...normalized.matchAll(/[1-4ABCD]/g)]
    .map((match) => match[0])
    .map((value) => {
      if (/^[1-4]$/.test(value)) {
        return Number(value) as OptionPosition;
      }

      return (
        {
          A: 1,
          B: 2,
          C: 3,
          D: 4,
        } as const
      )[value as "A" | "B" | "C" | "D"];
    });

  return {
    positions: [...new Set(positions)],
    dropped: false,
  };
}

export function parseAnswerKey(text: string): AnswerKeyEntry[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const entries: AnswerKeyEntry[] = [];

  for (let i = 0; i < lines.length; i++) {
    const id = lines[i];

    if (!QUESTION_ID.test(id)) {
      continue;
    }

    let answerValue: string | undefined;

    // Format:
    // 55125118946
    // 3
    if (i + 1 < lines.length) {
      answerValue = lines[i + 1];
    }

    // Also support:
    // 55125118946 3
    const inline = id.match(/^(\d{8,20})\s+(.+)$/);

    if (inline) {
      answerValue = inline[2];
    }

    if (!answerValue) {
      continue;
    }

    const answer = parseAnswer(answerValue);

    entries.push({
      questionId: id,
      positions: answer.positions,
      dropped: answer.dropped,
    });
  }

  return entries;
}

export function mergeAnswerKey(
  questions: ParsedQuestion[],
  answerKey: AnswerKeyEntry[],
) {
  const byId = new Map(answerKey.map((entry) => [entry.questionId, entry]));

  let matched = 0;

  const merged = questions.map((question) => {
    if (!question.sourceQuestionId) {
      return question;
    }

    const entry = byId.get(question.sourceQuestionId);

    if (!entry) {
      return question;
    }

    matched += 1;

    if (entry.dropped) {
      return {
        ...question,
        correctOptionPosition: null,
        answerSource: "answer-key" as const,
        dropped: true,
        warnings: [
          ...question.warnings,
          "Question is marked as dropped in the answer key.",
        ],
      };
    }

    if (entry.positions.length > 1) {
      return {
        ...question,
        correctOptionPosition: null,
        answerSource: "conflict" as const,
        warnings: [
          ...question.warnings,
          "Answer key contains multiple correct options.",
        ],
      };
    }

    const keyAnswer = entry.positions[0];

    if (
      question.correctOptionPosition !== null &&
      question.correctOptionPosition !== keyAnswer
    ) {
      return {
        ...question,
        correctOptionPosition: null,
        answerSource: "conflict" as const,
        warnings: [
          ...question.warnings,
          `Question paper says option ${question.correctOptionPosition}, answer key says option ${keyAnswer}. Manual review required.`,
        ],
      };
    }

    return {
      ...question,
      correctOptionPosition: keyAnswer,
      answerSource:
        question.correctOptionPosition !== null
          ? ("question-paper-and-key" as const)
          : ("answer-key" as const),
    };
  });

  return {
    questions: merged,
    matched,
    total: questions.length,
    status:
      matched === questions.length
        ? ("mapped" as const)
        : matched > 0
          ? ("partial" as const)
          : ("unmapped" as const),
  };
}
