"use client";

import { AlertCircle, CheckCircle2, Save, Settings2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  QuestionEditor,
  QuestionSidebar,
  TestSettingsSheet,
} from "../../components/review";
import type { TestSettings } from "../../components/review/test-settings";
import type { ParsedTest } from "../../lib/types";
import type { ParsedQuestion } from "../../lib/types/parser";
import type { ReviewTestPayload, SaveTestResult } from "../../lib/types/review";

type Props = {
  data: ParsedTest;
  onBack: () => void;
  onSaveDraft: (payload: ReviewTestPayload) => Promise<SaveTestResult>;
  onPublish: (payload: ReviewTestPayload) => Promise<SaveTestResult>;
};

export function Review({ data, onBack, onSaveDraft, onPublish }: Props) {
  const [questions, setQuestions] = useState<ParsedQuestion[]>(data.questions);
  const [settings, setSettings] = useState<TestSettings>({
    name: data.name,
    description: "",
    duration: null,
    marksPerQuestion: 2,
    negativeMark: 0,
  });
  const [activeQuestion, setActiveQuestion] = useState<number>(
    data.questions[0]?.sourceNumber ?? 0,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [questionSheetOpen, setQuestionSheetOpen] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedTestId, setSavedTestId] = useState<string | undefined>(undefined);
  const [resolvedQuestions, setResolvedQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [deleteQuestion, setDeleteQuestion] = useState<ParsedQuestion | null>(
    null,
  );
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const currentQuestion = useMemo(
    () =>
      questions.find((question) => question.sourceNumber === activeQuestion),
    [activeQuestion, questions],
  );

  const unresolvedCount = useMemo(
    () =>
      questions.filter((question) => {
        if (question.dropped) return true;

        const parserIssue =
          question.needsVisualReview || question.warnings.length > 0;

        const answerIssue =
          data.answerKey.status !== "not-provided" &&
          (question.answerSource === "none" ||
            question.answerSource === "conflict");

        return (
          (parserIssue || answerIssue) &&
          !resolvedQuestions.has(question.sourceNumber)
        );
      }).length,
    [data.answerKey.status, questions, resolvedQuestions],
  );

  const blockingIssues = useMemo(
    () =>
      questions.filter(
        (question) =>
          !question.text.trim() ||
          question.options.length !== 4 ||
          question.options.some(
            (option) => !option.text.trim() && !option.image,
          ) ||
          question.dropped,
      ),
    [questions],
  );

  const updateQuestion = (next: ParsedQuestion) => {
    setQuestions((current) =>
      current.map((question) =>
        question.sourceNumber === next.sourceNumber ? next : question,
      ),
    );

    setIsDirty(true);
  };

  const handleSelectQuestion = (sourceNumber: number) => {
    setActiveQuestion(sourceNumber);
    setQuestionSheetOpen(false);
  };

  const handleDeleteConfirmed = () => {
    if (!deleteQuestion) return;
    const index = questions.findIndex(
      (question) => question.sourceNumber === deleteQuestion.sourceNumber,
    );
    const nextQuestions = questions.filter(
      (question) => question.sourceNumber !== deleteQuestion.sourceNumber,
    );

    setQuestions(nextQuestions);
    setDeleteQuestion(null);
    setIsDirty(true);

    const nextQuestion =
      nextQuestions[index] ?? nextQuestions[index - 1] ?? nextQuestions[0];
    setActiveQuestion(nextQuestion?.sourceNumber ?? 0);
    toast.success("Question deleted.");
  };

  const resolveQuestion = (sourceNumber: number) => {
    setResolvedQuestions((current) => {
      const next = new Set(current);
      next.add(sourceNumber);
      return next;
    });

    setIsDirty(true);
  };

  const buildPayload = (): ReviewTestPayload => ({
    testId: savedTestId,
    name: settings.name.trim(),
    description: settings.description.trim(),
    duration: settings.duration,
    marksPerQuestion: settings.marksPerQuestion,
    negativeMark: settings.negativeMark,
    questions: questions.map((question) => ({
      sourceNumber: question.sourceNumber,
      text: question.text,
      image: question.image,
      options: question.options.map((option) => ({
        position: option.position,
        text: option.text,
        image: option.image,
      })),
      correctOptionPosition: question.correctOptionPosition,
    })),
  });

  const handleSaveDraft = async () => {
    if (!settings.name.trim()) {
      setSettingsOpen(true);
      toast.error("Please enter a test name.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await onSaveDraft(buildPayload());

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setSavedTestId(result.testId);
      setIsDirty(false);
      toast.success("Test draft saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (blockingIssues.length > 0) {
      toast.error(
        `${blockingIssues.length} question${
          blockingIssues.length === 1 ? "" : "s"
        } still need structural fixes.`,
      );

      const firstProblem = blockingIssues[0];

      if (firstProblem) {
        setActiveQuestion(firstProblem.sourceNumber);
      }

      return;
    }

    if (!settings.name.trim()) {
      setSettingsOpen(true);
      toast.error("Please enter a test name.");
      return;
    }

    setShowPublishDialog(true);
  };

  const confirmPublish = async () => {
    setShowPublishDialog(false);
    setIsSaving(true);

    try {
      const result = await onPublish(buildPayload());

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setSavedTestId(result.testId);
      setIsDirty(false);

      toast.success("Test published.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      setShowLeaveDialog(true);
      return;
    }

    onBack();
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <>
      {/* Toolbar */}
      <header
        className={cn(
          "p-2 pb-3 flex justify-between items-center",
          "shrink-0 gap-4 border-b",
        )}
      >
        <div className={cn("flex min-w-0 items-center gap-2")}>
          {/*             <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleBack}
            >
              <ArrowLeft />
              <span className="sr-only">Back to upload</span>
            </Button> */}

          <SidebarTrigger />

          <div className="min-w-0">
            <h1 className="truncate font-semibold">
              {settings.name || "Untitled Test"}
            </h1>

            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline">Draft</Badge>

              <span className="text-xs text-muted-foreground">
                {questions.length} questions
              </span>

              {unresolvedCount > 0 && (
                <>
                  <span className="text-muted-foreground">·</span>

                  <span className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertCircle className="size-3.5" />
                    {unresolvedCount} need review
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="destructive" onClick={handleBack}>
            <X className="size-4" />
            <span className="hidden sm:inline">Discard</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 className="size-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={handleSaveDraft}
          >
            <Save className="size-4" />
            <span className="hidden sm:inline">Save Draft</span>
          </Button>

          <Button
            type="button"
            disabled={isSaving || questions.length === 0}
            onClick={handlePublish}
          >
            <CheckCircle2 className="size-4" />
            Publish
          </Button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">
        {/* Answer key notice */}
        {data.answerKey.status === "not-provided" && (
          <div className="my-4 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
            <span className="font-medium">No answer key provided.</span> You can
            still save or publish this test. Correct answers can be added later.
          </div>
        )}

        {data.answerKey.status === "partial" ||
        data.answerKey.status === "unmapped" ? (
          <div className="my-4 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
            <span className="font-medium">
              Answer key mapping needs review.
            </span>{" "}
            Some answers could not be automatically matched.
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border bg-background">
          {/* Desktop question navigator */}
          <aside className="hidden w-72 shrink-0 border-r md:block">
            <QuestionSidebar
              questions={questions}
              activeQuestion={activeQuestion}
              answerKeyStatus={data.answerKey.status}
              resolvedQuestions={resolvedQuestions}
              onSelect={handleSelectQuestion}
            />
          </aside>

          {/* Main editor */}
          <main className="min-w-0 flex-1">
            {/* Mobile question selector */}
            <div className="flex items-center border-b p-3 md:hidden">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setQuestionSheetOpen(true)}
              >
                Question{" "}
                {Math.max(
                  1,
                  questions.findIndex(
                    (question) => question.sourceNumber === activeQuestion,
                  ) + 1,
                )}
              </Button>
            </div>

            <ScrollArea className="h-full">
              <div className="p-5 sm:p-7">
                {currentQuestion ? (
                  <QuestionEditor
                    question={currentQuestion}
                    questionNumber={
                      questions.findIndex(
                        (question) => question.sourceNumber === activeQuestion,
                      ) + 1
                    }
                    answerKeyProvided={data.answerKey.status !== "not-provided"}
                    isResolved={resolvedQuestions.has(
                      currentQuestion.sourceNumber,
                    )}
                    onChange={updateQuestion}
                    onDelete={() => setDeleteQuestion(currentQuestion)}
                    onResolve={() =>
                      resolveQuestion(currentQuestion.sourceNumber)
                    }
                  />
                ) : (
                  <div className="flex h-full min-h-[400px] items-center justify-center">
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
        </div>
      </main>

      {/* Mobile question navigator */}
      <Sheet open={questionSheetOpen} onOpenChange={setQuestionSheetOpen}>
        <SheetContent side="left" className="w-[85%] p-0 sm:max-w-sm">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>Questions</SheetTitle>
          </SheetHeader>

          <QuestionSidebar
            questions={questions}
            activeQuestion={activeQuestion}
            answerKeyStatus={data.answerKey.status}
            resolvedQuestions={resolvedQuestions}
            onSelect={handleSelectQuestion}
          />
        </SheetContent>
      </Sheet>

      {/* Settings */}
      <TestSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        questionCount={questions.length}
        onChange={(next) => {
          setSettings(next);
          setIsDirty(true);
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteQuestion !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteQuestion(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>

            <AlertDialogDescription>
              This question will be removed from the test. You will not be able
              to recover it after leaving this review.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirmed}
            >
              Delete question
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave confirmation */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave test review?</AlertDialogTitle>

            <AlertDialogDescription>
              Your parsed questions and edits have not been saved. Leaving now
              will discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Continue editing</AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onBack}
            >
              Leave and discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish confirmation */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this test?</AlertDialogTitle>

            <AlertDialogDescription>
              This will create the test in ExamOK and make it available for
              attempts.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {unresolvedCount > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 size-4 text-amber-500" />

                <span>
                  {unresolvedCount} question
                  {unresolvedCount === 1 ? "" : "s"} still need manual review.
                  Publishing will keep your current edits.
                </span>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Continue reviewing</AlertDialogCancel>

            <AlertDialogAction onClick={confirmPublish} disabled={isSaving}>
              Publish test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
