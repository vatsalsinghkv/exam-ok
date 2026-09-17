import type { OptionPosition, ParsedQuestion } from "../types/parser";

type PageLine = {
  page: number;
  text: string;
};

type QuestionState = {
  number: number;
  page: number;
  lines: string[];
};

const QUESTION_START = /^\s*(\d{1,3})\.(?:\s+|$)(.*)$/;
const OPTION_MARKER = /\((1|2|3|4)\)\s*/g;

const VISUAL_PATTERNS = [
  /\bfigure\b/i,
  /\bdiagram\b/i,
  /\bflowchart\b/i,
  /\bgantt\s+chart\b/i,
  /\blogic\s+diagram\b/i,
  /\bcircuit\b/i,
  /\bgraph\b/i,
  /\bmatrix\b/i,
  /\bshown\s+(?:below|above)\b/i,
];

const HEADER_PATTERNS = [
  /^J-\d+.*$/i,
  /^paper-?ii$/i,
  /^computer science and applications$/i,
  /^paper\s*-\s*ii$/i,
  /^P\.?T\.?O\.?$/i,
];

function normalizeLine(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function preparePages(pages: string[]): PageLine[] {
  const result: PageLine[] = [];

  pages.forEach((pageText, pageIndex) => {
    const page = pageIndex + 1;

    const lines = pageText.split("\n");

    lines.forEach((rawLine, lineIndex) => {
      const text = normalizeLine(rawLine);

      if (!text) return;

      // Remove page/header material.
      if (
        lineIndex < 7 &&
        HEADER_PATTERNS.some((pattern) => pattern.test(text))
      ) {
        return;
      }

      // Page number at top of page.
      if (lineIndex < 3 && /^\d{1,3}$/.test(text)) {
        return;
      }

      result.push({ page, text });
    });
  });

  return result;
}

function findOptionSequence(text: string) {
  const matches = [...text.matchAll(OPTION_MARKER)];

  let expected = 1;
  let sequence: RegExpMatchArray[] = [];

  for (const match of matches) {
    const number = Number(match[1]);

    if (number === expected) {
      sequence.push(match);
      expected += 1;

      if (expected === 5) {
        return sequence;
      }

      continue;
    }

    if (number === 1) {
      sequence = [match];
      expected = 2;
    }
  }

  return null;
}

function parseAnswerValue(value: string): {
  positions: OptionPosition[];
  dropped: boolean;
} {
  const normalized = value.toUpperCase().trim();

  if (normalized === "D") {
    return {
      positions: [],
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

function extractInlineAnswer(text: string) {
  const pattern =
    /(?:correct\s+(?:answer|option)|answer|ans\.?)\s*(?:is\s*)?[:=-]\s*(?:option\s*)?\(?([1-4ABCD](?:\s*[&,/]\s*[1-4ABCD])*)\)?/i;

  const match = text.match(pattern);

  if (!match) {
    return {
      text,
      positions: [] as OptionPosition[],
      dropped: false,
    };
  }

  const answer = parseAnswerValue(match[1]);

  return {
    text: text.replace(match[0], "").trim(),
    positions: answer.positions,
    dropped: answer.dropped,
  };
}

function detectVisualRequirement(
  questionText: string,
  options: ParsedQuestion["options"],
) {
  const pattern = VISUAL_PATTERNS.find((pattern) => pattern.test(questionText));

  if (pattern) {
    return {
      required: true,
      reason: "Question references a figure, diagram, chart, matrix, or graph.",
    };
  }

  if (questionText.includes("\uFFFD")) {
    return {
      required: true,
      reason: "PDF text extraction contains corrupted characters.",
    };
  }

  if (options.length !== 4) {
    return {
      required: true,
      reason: "Could not reliably extract four answer options.",
    };
  }

  if (options.some((option) => !option.text.trim())) {
    return {
      required: true,
      reason: "One or more options contain visual content not present in text.",
    };
  }

  return {
    required: false,
  };
}

function parseQuestionBlock(state: QuestionState): ParsedQuestion {
  const rawText = state.lines.join("\n");
  const answer = extractInlineAnswer(rawText);
  const textWithoutAnswer = answer.text;
  const sequence = findOptionSequence(textWithoutAnswer);
  const warnings: string[] = [];

  if (!sequence) {
    return {
      sourceNumber: state.number,
      sourcePage: state.page,
      text: textWithoutAnswer.trim(),
      options: [],
      correctOptionPosition:
        answer.positions.length === 1 ? answer.positions[0] : null,
      answerSource: answer.positions.length === 1 ? "question-paper" : "none",
      dropped: answer.dropped,
      needsVisualReview: true,
      visualReason: "Could not reliably identify four answer options.",
      warnings: ["Four MCQ options were not detected."],
    };
  }

  const firstOption = sequence[0];
  const questionText = textWithoutAnswer.slice(0, firstOption.index).trim();

  const options = sequence.map((marker, index) => {
    const start = (marker.index ?? 0) + marker[0].length;
    const end =
      index < sequence.length - 1
        ? (sequence[index + 1].index ?? textWithoutAnswer.length)
        : textWithoutAnswer.length;

    const text = textWithoutAnswer.slice(start, end).trim();

    return {
      position: Number(marker[1]) as OptionPosition,
      text,
      needsVisualReview: !text,
    };
  });

  const visual = detectVisualRequirement(questionText, options);

  if (visual.required) {
    warnings.push(visual.reason ?? "Visual review required.");
  }

  const correctOptionPosition =
    answer.positions.length === 1 ? answer.positions[0] : null;

  if (answer.positions.length > 1) {
    warnings.push(
      "Multiple correct options detected, but current Prisma model supports one correct option.",
    );
  }

  return {
    sourceNumber: state.number,
    sourcePage: state.page,
    text: questionText,
    options,
    correctOptionPosition,
    answerSource: correctOptionPosition !== null ? "question-paper" : "none",
    dropped: answer.dropped,
    needsVisualReview: visual.required,
    visualReason: visual.reason,
    warnings,
  };
}

export function parseQuestionPaper(pages: string[]): ParsedQuestion[] {
  const lines = preparePages(pages);

  let current: QuestionState | null = null;
  let expectedQuestionNumber = 1;

  const questions: ParsedQuestion[] = [];

  for (const line of lines) {
    const match = line.text.match(QUESTION_START);

    /*
     * Before the real question paper starts, ignore instructions/cover-page
     * numbered items. We start only when Q1 looks like an actual MCQ.
     */
    if (!current) {
      if (!match || Number(match[1]) !== 1) {
        continue;
      }

      current = {
        number: 1,
        page: line.page,
        lines: [match[2]],
      };

      expectedQuestionNumber = 2;
      continue;
    }

    /*
     * The PDF can contain numbered instructions or numbered content.
     * Only treat "2.", "3.", ... as a new question after the current
     * block already contains a complete MCQ option sequence.
     */
    if (
      match &&
      Number(match[1]) === expectedQuestionNumber &&
      findOptionSequence(current.lines.join("\n"))
    ) {
      questions.push(parseQuestionBlock(current));

      current = {
        number: expectedQuestionNumber,
        page: line.page,
        lines: [match[2]],
      };

      expectedQuestionNumber += 1;
      continue;
    }

    /*
     * A second "1." means we probably just crossed from the cover/instructions
     * page into the actual question paper.
     */
    if (
      match &&
      Number(match[1]) === 1 &&
      !findOptionSequence(current.lines.join("\n"))
    ) {
      current = {
        number: 1,
        page: line.page,
        lines: [match[2]],
      };

      expectedQuestionNumber = 2;
      continue;
    }

    current.lines.push(line.text);
  }

  if (current && findOptionSequence(current.lines.join("\n"))) {
    questions.push(parseQuestionBlock(current));
  }

  return questions;
}
