"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { OptionPosition, ParsedQuestion } from "../../lib/types/parser";

type Props = {
  question: ParsedQuestion;
  questionNumber: number;
  answerKeyProvided: boolean;
  isResolved: boolean;

  onChange: (question: ParsedQuestion) => void;
  onDelete: () => void;
  onResolve: () => void;
};

export function QuestionEditor({
  question,
  questionNumber,
  answerKeyProvided,
  isResolved,
  onChange,
  onDelete,
  onResolve,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [originalQuestion, setOriginalQuestion] =
    useState<ParsedQuestion>(question);

  /*
   * When the selected question changes, update the edit snapshot.
   * This prevents cancel from restoring the previously selected question.
   */
  useEffect(() => {
    if (!isEditing) {
      setOriginalQuestion(question);
    }
  }, [question, isEditing]);

  const hasIssues =
    question.dropped ||
    question.needsVisualReview ||
    question.warnings.length > 0 ||
    (answerKeyProvided &&
      (question.answerSource === "none" ||
        question.answerSource === "conflict"));

  const startEditing = () => {
    setOriginalQuestion(question);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    onChange(originalQuestion);
    setIsEditing(false);
  };

  const finishEditing = () => {
    setIsEditing(false);
  };

  const updateText = (text: string) => {
    onChange({
      ...question,
      text,
    });
  };

  const updateOption = (position: OptionPosition, text: string) => {
    onChange({
      ...question,
      options: question.options.map((option) =>
        option.position === position
          ? {
              ...option,
              text,
            }
          : option,
      ),
    });
  };

  const updateCorrectOption = (value: string) => {
    const correctOptionPosition =
      value === "none" ? null : (Number(value) as OptionPosition);

    onChange({
      ...question,
      correctOptionPosition,
      answerSource: "manual",
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      {/* Question header */}
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Question {questionNumber}</h2>

            {question.dropped && <Badge variant="destructive">Dropped</Badge>}

            {question.needsVisualReview && (
              <Badge variant="secondary">
                <Eye className="mr-1 size-3.5" />
                Visual review
              </Badge>
            )}

            {question.answerSource === "conflict" && (
              <Badge variant="secondary">
                <AlertCircle className="mr-1 size-3.5" />
                Answer conflict
              </Badge>
            )}

            {isResolved && !question.dropped && (
              <Badge
                variant="outline"
                className="border-emerald-500/40 text-emerald-600"
              >
                <Check className="mr-1 size-3" />
                Manually reviewed
              </Badge>
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Source page {question.sourcePage}
            {" · "}
            Question {question.sourceNumber}
          </p>
        </div>

        {/* Single-question actions */}
        <div className="flex shrink-0 items-center gap-1">
          {!isEditing && hasIssues && !question.dropped && !isResolved && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResolve}
            >
              <CheckCircle2 className="mr-2 size-4" />
              <span className="hidden sm:inline">Mark reviewed</span>
            </Button>
          )}

          {!isEditing && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={startEditing}
                  >
                    <Pencil className="size-4" />
                    <span className="sr-only">Edit question</span>
                  </Button>
                }
              />

              <TooltipContent>Edit question</TooltipContent>
            </Tooltip>
          )}

          {!isEditing && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Delete question</span>
                  </Button>
                }
              />

              <TooltipContent>Delete question</TooltipContent>
            </Tooltip>
          )}
        </div>
      </header>

      {/* Parser feedback */}
      {hasIssues && !isResolved && (
        <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />

            <div className="min-w-0 space-y-1.5">
              <p className="text-sm font-medium">
                This question needs your review
              </p>

              <div className="space-y-1 text-sm text-muted-foreground">
                {question.dropped && (
                  <p>
                    This question was marked as dropped by the supplied answer
                    key. Delete it before publishing.
                  </p>
                )}

                {/* {question.needsVisualReview && question.visualReason && (
                  <p>{question.visualReason}</p>
                )} */}

                {question.warnings.length > 0 &&
                  question.warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}

                {answerKeyProvided && question.answerSource === "conflict" && (
                  <p>
                    The question paper and answer key disagree about the correct
                    answer.
                  </p>
                )}

                {answerKeyProvided &&
                  question.answerSource === "none" &&
                  !question.dropped && (
                    <p>No correct answer could be mapped automatically.</p>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Card */}
      <section className="overflow-hidden rounded-xl border bg-background">
        {/* Question text */}
        <div className="border-b p-5 sm:p-6">
          {isEditing ? (
            <Textarea
              value={question.text}
              onChange={(event) => updateText(event.target.value)}
              placeholder="Enter question text..."
              className="min-h-32 resize-y"
            />
          ) : (
            <p className="whitespace-pre-wrap text-[15px] leading-7">
              {question.text || "No question text extracted."}
            </p>
          )}

          {/* Question image */}
          {question.image && (
            <div className="mt-5 overflow-hidden rounded-lg border bg-muted/20 p-2">
              <Image
                width={800}
                height={600}
                src={question.image}
                alt={`Question ${questionNumber} visual`}
                className="mx-auto max-h-105 max-w-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Options */}
        <div className="p-5 sm:p-6">
          <div className="mb-4">
            {/* <h3 className="font-medium">Answer options</h3> */}

            <p className="mt-1 text-xs text-muted-foreground">
              {isEditing
                ? "Select the correct answer or choose no correct answer."
                : "Detected options from the source document."}
            </p>
          </div>

          {isEditing ? (
            <RadioGroup
              value={question.correctOptionPosition?.toString() ?? "none"}
              onValueChange={updateCorrectOption}
              className="space-y-3"
            >
              {question.options.map((option) => (
                <OptionEditor
                  key={option.position}
                  option={option}
                  onChange={(text) => updateOption(option.position, text)}
                />
              ))}

              {/* No correct answer */}
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <RadioGroupItem
                  value="none"
                  id={`correct-none-${question.sourceNumber}`}
                />

                <Label
                  htmlFor={`correct-none-${question.sourceNumber}`}
                  className="cursor-pointer font-normal"
                >
                  No correct answer
                </Label>
              </div>
            </RadioGroup>
          ) : (
            <div className="space-y-3">
              {question.options.map((option) => {
                const isCorrect =
                  question.correctOptionPosition === option.position;

                return (
                  <OptionDisplay
                    key={option.position}
                    option={option}
                    isCorrect={isCorrect}
                    questionNumber={questionNumber}
                  />
                );
              })}

              {question.correctOptionPosition === null && (
                <p className="pt-1 text-sm text-muted-foreground">
                  No correct answer selected.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Edit Actions */}
      {isEditing && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={cancelEditing}>
            <X className="mr-2 size-4" />
            Cancel
          </Button>

          <Button type="button" onClick={finishEditing}>
            <Check className="mr-2 size-4" />
            Done
          </Button>
        </div>
      )}

      {/* Footer metadata */}
      <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
        <span>Source page {question.sourcePage}</span>

        <span>
          {question.options.length}{" "}
          {question.options.length === 1 ? "option" : "options"}
        </span>
      </div>
    </div>
  );
}

/* Option - Edit mode */

function OptionEditor({
  option,
  onChange,
}: {
  option: ParsedQuestion["options"][number];
  onChange: (text: string) => void;
}) {
  const id = `option-${option.position}`;

  return (
    <div className="flex gap-3 rounded-lg border p-3">
      <RadioGroupItem
        value={option.position.toString()}
        id={id}
        className="mt-1"
      />

      <div className="min-w-0 flex-1">
        <Label htmlFor={id} className="text-xs text-muted-foreground">
          Option {String.fromCharCode(64 + option.position)}
        </Label>

        <Textarea
          value={option.text}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`Option ${String.fromCharCode(64 + option.position)}`}
          className="mt-2 min-h-20 resize-y"
        />

        {option.image && (
          <div className="mt-3 overflow-hidden rounded-md border bg-muted/20 p-2">
            <Image
              width={500}
              height={300}
              src={option.image}
              alt={`Option ${String.fromCharCode(64 + option.position)}`}
              className="max-h-48 max-w-full object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/*  Option - View mode */

function OptionDisplay({
  option,
  isCorrect,
}: {
  option: ParsedQuestion["options"][number];
  isCorrect: boolean;
  questionNumber: number;
}) {
  const letter = String.fromCharCode(64 + option.position);

  return (
    <div
      className={[
        "rounded-lg border p-4 transition-colors",
        isCorrect ? "border-emerald-500/40 bg-emerald-500/5" : "bg-muted/20",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {/* Option letter */}
        <div
          className={[
            "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            isCorrect
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-muted text-muted-foreground",
          ].join(" ")}
        >
          {letter}
        </div>

        {/* Option content */}
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap text-sm leading-6">
            {option.text || "No option text extracted."}
          </p>

          {option.image && (
            <div className="mt-3 overflow-hidden rounded-md border bg-muted/20 p-2">
              <Image
                width={500}
                height={300}
                src={option.image}
                alt={`Option ${letter}`}
                className="max-h-48 max-w-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Correct badge */}
        {isCorrect && (
          <Badge
            variant="outline"
            className="shrink-0 border-emerald-500/40 text-emerald-600"
          >
            <Check className="mr-1 size-3" />
            Correct
          </Badge>
        )}
      </div>
    </div>
  );
}
