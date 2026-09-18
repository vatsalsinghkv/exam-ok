"use client";

import { AlertCircle, CheckCircle2, FileQuestion } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { ParsedQuestion } from "../../lib/types/parser";

type Props = {
  questions: ParsedQuestion[];
  activeQuestion: number;
  answerKeyStatus: string;
  resolvedQuestions: Set<number>;

  onSelect: (sourceNumber: number) => void;
};

function needsAnswerReview(question: ParsedQuestion, answerKeyStatus: string) {
  return (
    answerKeyStatus !== "not-provided" &&
    (question.answerSource === "none" || question.answerSource === "conflict")
  );
}

export function QuestionSidebar({
  questions,
  activeQuestion,
  answerKeyStatus,
  resolvedQuestions,
  onSelect,
}: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div>
          <p className="font-semibold">Questions</p>
          <p className="text-xs text-muted-foreground">
            {questions.length} questions
          </p>
        </div>

        <Badge variant="secondary">{questions.length}</Badge>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-2">
          {questions.map((question, index) => {
            const parserIssue =
              question.needsVisualReview || question.warnings.length > 0;
            const answerIssue = needsAnswerReview(question, answerKeyStatus);
            const isResolved = resolvedQuestions.has(question.sourceNumber);
            const needsAttention =
              question.dropped || ((parserIssue || answerIssue) && !isResolved);

            return (
              <button
                key={question.sourceNumber}
                type="button"
                onClick={() => onSelect(question.sourceNumber)}
                className={cn(
                  "group mb-1 flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors",
                  "hover:bg-muted/60",
                  activeQuestion === question.sourceNumber && "bg-primary/10",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                    activeQuestion === question.sourceNumber
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">Q{index + 1}</span>

                    {question.dropped ? (
                      <Badge
                        variant="destructive"
                        className="h-5 px-1.5 text-[10px]"
                      >
                        Dropped
                      </Badge>
                    ) : needsAttention ? (
                      <AlertCircle className="size-3.5 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                    )}
                  </span>

                  <span className="mt-1 block line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {`${question.text.slice(0, 100)}...` || "No question text"}
                  </span>
                </span>
              </button>
            );
          })}

          {questions.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <FileQuestion className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">No questions</p>
              <p className="text-xs text-muted-foreground">
                Add questions or upload another paper.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
