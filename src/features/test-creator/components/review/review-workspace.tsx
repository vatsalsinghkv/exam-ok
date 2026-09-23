"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { ParsedQuestion } from "../../lib/types/parser";
import { QuestionEditor } from "./question-editor";
import { QuestionSidebar } from "./question-sidebar";

type Props = {
  questions: ParsedQuestion[];
  activeQuestion: number;
  currentQuestion: ParsedQuestion | undefined;
  currentQuestionIndex: number;
  answerKeyStatus: "not-provided" | "mapped" | "partial" | "unmapped";
  resolvedQuestions: Set<number>;
  questionSheetOpen: boolean;
  unresolvedCount: number;
  onQuestionSheetOpenChange: (open: boolean) => void;
  onSelectQuestion: (sourceNumber: number) => void;
  onChangeQuestion: (question: ParsedQuestion) => void;
  onDeleteQuestion: (question: ParsedQuestion) => void;
  onResolveQuestion: (sourceNumber: number) => void;
};

export function ReviewWorkspace({
  questions,
  activeQuestion,
  currentQuestion,
  currentQuestionIndex,
  answerKeyStatus,
  resolvedQuestions,
  questionSheetOpen,
  unresolvedCount,
  onQuestionSheetOpenChange,
  onSelectQuestion,
  onChangeQuestion,
  onDeleteQuestion,
  onResolveQuestion,
}: Props) {
  const questionNumber =
    currentQuestionIndex >= 0 ? currentQuestionIndex + 1 : 1;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden border-t">
      {/* Desktop question navigator */}
      <aside className="hidden w-72 shrink-0 border-r md:block">
        <QuestionSidebar
          questions={questions}
          activeQuestion={activeQuestion}
          answerKeyStatus={answerKeyStatus}
          resolvedQuestions={resolvedQuestions}
          onSelect={onSelectQuestion}
          unresolvedCount={unresolvedCount}
        />
      </aside>

      {/* Main editor */}
      <main className="min-w-0 flex-1">
        {/* Mobile question selector */}
        <div className="border-b p-3 md:hidden">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            onClick={() => onQuestionSheetOpenChange(true)}
          >
            Question {questionNumber}
          </Button>
        </div>

        <ScrollArea className="h-full">
          <div className="p-5 sm:p-7">
            {currentQuestion ? (
              <QuestionEditor
                question={currentQuestion}
                questionNumber={questionNumber}
                answerKeyProvided={answerKeyStatus !== "not-provided"}
                isResolved={resolvedQuestions.has(currentQuestion.sourceNumber)}
                onChange={onChangeQuestion}
                onDelete={() => onDeleteQuestion(currentQuestion)}
                onResolve={() =>
                  onResolveQuestion(currentQuestion.sourceNumber)
                }
              />
            ) : (
              <div className="flex min-h-100 items-center justify-center">
                <div className="text-center">
                  <p className="font-medium">No question selected</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Add or import questions to continue.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* Mobile question navigator */}
      <Sheet open={questionSheetOpen} onOpenChange={onQuestionSheetOpenChange}>
        <SheetContent side="left" className="w-[85%] p-0 sm:max-w-sm">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>Questions</SheetTitle>
          </SheetHeader>

          <QuestionSidebar
            unresolvedCount={unresolvedCount}
            questions={questions}
            activeQuestion={activeQuestion}
            answerKeyStatus={answerKeyStatus}
            resolvedQuestions={resolvedQuestions}
            onSelect={onSelectQuestion}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
