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
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
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
      answerSource:
        question.answerSource === "conflict"
          ? question.answerSource
          : question.answerSource,
    });
  };

  const updateOption = (position: OptionPosition, text: string) => {
    onChange({
      ...question,
      options: question.options.map((option) =>
        option.position === position ? { ...option, text } : option,
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
    <div className="mx-auto w-full max-w-4xl pb-10">
      {/* Question header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">Question {questionNumber}</h2>

            {question.dropped && (
              <Badge variant="destructive">Dropped by answer key</Badge>
            )}

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

            {question.answerSource === "manual" && (
              <Badge variant="outline">
                <Check className="mr-1 size-3.5" />
                Manually reviewed
              </Badge>
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Source question {question.sourceNumber}
            {" · "}
            page {question.sourcePage}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {!isEditing && hasIssues && !question.dropped && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResolve}
            >
              <CheckCircle2 className="mr-2 size-4" />
              Mark reviewed
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
                    <Pencil />
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
                    className="text-destructive hover:text-destructive"
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
      </div>

      {/* Parser feedback */}
      {hasIssues && !isResolved && (
        <div className="mb-6 rounded-lg border bg-muted/30 p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />

            <div className="space-y-1">
              <p className="text-sm font-medium">
                This question needs your review
              </p>

              <div className="text-sm text-muted-foreground">
                {question.dropped && (
                  <p>
                    This question was marked as dropped by the supplied answer
                    key. Delete it before publishing.
                  </p>
                )}

                {question.needsVisualReview && question.visualReason && (
                  <p>{question.visualReason}</p>
                )}

                {question.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}

                {answerKeyProvided && question.answerSource === "conflict" && (
                  <p>
                    The question paper and answer key disagree about the correct
                    answer.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question */}
      <section className="rounded-xl border bg-background">
        <div className="border-b p-5">
          <Label className="text-sm font-medium">Question</Label>

          {isEditing ? (
            <Textarea
              value={question.text}
              onChange={(event) => updateText(event.target.value)}
              className="mt-3 min-h-32 resize-y"
            />
          ) : (
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7">
              {question.text || "No question text extracted."}
            </p>
          )}

          {question.image && (
            <div className="mt-5 overflow-hidden rounded-lg border bg-muted/20 p-2">
              <Image
                width={400}
                height={300}
                src={question.image}
                alt={`Question ${questionNumber} visual`}
                className="mx-auto max-h-105 max-w-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Options */}
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">Answer options</h3>

              <p className="text-xs text-muted-foreground">
                {isEditing
                  ? "Select the correct answer or choose no correct answer."
                  : "Detected options from the source document."}
              </p>
            </div>
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

              <div className="flex items-center gap-3 rounded-lg border p-3">
                <RadioGroupItem value="none" id="correct-none" />

                <Label
                  htmlFor="correct-none"
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
                  <div
                    key={option.position}
                    className={`rounded-lg border p-4 ${
                      isCorrect
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "bg-muted/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {String.fromCharCode(64 + option.position)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="whitespace-pre-wrap leading-6">
                          {option.text || "No option text extracted."}
                        </p>

                        {option.image && (
                          <Image
                            width={400}
                            height={300}
                            src={option.image}
                            alt={`Option ${option.position}`}
                            className="mt-3 max-h-48 max-w-full rounded-md border object-contain"
                          />
                        )}
                      </div>

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
              })}

              {question.correctOptionPosition === null && (
                <p className="text-sm text-muted-foreground">
                  No correct answer selected.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Edit actions */}
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

      <Separator className="my-8" />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Question source: page {question.sourcePage}</span>

        <span>
          {question.options.length} option
          {question.options.length === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}

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
          className="mt-2 min-h-20 resize-y"
        />

        {option.image && (
          <Image
            width={300}
            height={200}
            src={option.image}
            alt={`Option ${option.position}`}
            className="mt-3 max-h-48 max-w-full rounded-md border object-contain"
          />
        )}
      </div>
    </div>
  );
}
