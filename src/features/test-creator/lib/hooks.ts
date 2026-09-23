"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  ReviewTestPayload,
  SaveTestResult,
  TestSettings,
} from "../lib/types/review";

import type { ParsedTest } from "./types";
import type { ParsedQuestion } from "./types/parser";

type UseReviewStateProps = {
  data: ParsedTest;
  onSaveDraft: (payload: ReviewTestPayload) => Promise<SaveTestResult>;
  onPublish: (payload: ReviewTestPayload) => Promise<SaveTestResult>;
  onBack: () => void;
};

export function useReviewState({
  data,
  onSaveDraft,
  onPublish,
  onBack,
}: UseReviewStateProps) {
  // * Data
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
  const [savedTestId, setSavedTestId] = useState<string | undefined>();
  const [resolvedQuestions, setResolvedQuestions] = useState<Set<number>>(
    new Set(),
  );

  const [deleteQuestion, setDeleteQuestion] = useState<ParsedQuestion | null>(
    null,
  );

  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // * Methods

  const currentQuestion = useMemo(
    () =>
      questions.find((question) => question.sourceNumber === activeQuestion),
    [activeQuestion, questions],
  );

  const currentQuestionIndex = useMemo(
    () =>
      questions.findIndex(
        (question) => question.sourceNumber === activeQuestion,
      ),
    [activeQuestion, questions],
  );

  const unresolvedCount = useMemo(() => {
    return questions.filter((question) => {
      if (resolvedQuestions.has(question.sourceNumber)) {
        return false;
      }
      if (question.dropped) {
        return true;
      }
      const parserIssue =
        question.needsVisualReview || question.warnings.length > 0;
      const answerIssue =
        data.answerKey.status !== "not-provided" &&
        (question.answerSource === "none" ||
          question.answerSource === "conflict");
      return parserIssue || answerIssue;
    }).length;
  }, [data.answerKey.status, questions, resolvedQuestions]);

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

  const hasAnswerKey = data.answerKey.status !== "not-provided";

  const selectQuestion = useCallback((sourceNumber: number) => {
    setActiveQuestion(sourceNumber);
    setQuestionSheetOpen(false);
  }, []);

  const updateQuestion = useCallback((next: ParsedQuestion) => {
    setQuestions((current) =>
      current.map((question) =>
        question.sourceNumber === next.sourceNumber ? next : question,
      ),
    ); /*
     * Editing a previously-reviewed question means it
     * needs to be reviewed again.
     */
    setResolvedQuestions((current) => {
      const nextResolved = new Set(current);
      nextResolved.delete(next.sourceNumber);
      return nextResolved;
    });
    setIsDirty(true);
  }, []);

  const updateSettings = useCallback((next: TestSettings) => {
    setSettings(next);
    setIsDirty(true);
  }, []);

  const resolveQuestion = useCallback((sourceNumber: number) => {
    setResolvedQuestions((current) => {
      const next = new Set(current);
      next.add(sourceNumber);
      return next;
    });
    setIsDirty(true);
  }, []);

  const confirmDeleteQuestion = useCallback(() => {
    if (!deleteQuestion) return;

    const deletedIndex = questions.findIndex(
      (question) => question.sourceNumber === deleteQuestion.sourceNumber,
    );

    const nextQuestions = questions.filter(
      (question) => question.sourceNumber !== deleteQuestion.sourceNumber,
    );

    setQuestions(nextQuestions);
    setDeleteQuestion(null);
    setIsDirty(true);
    const nextQuestion =
      nextQuestions[deletedIndex] ??
      nextQuestions[deletedIndex - 1] ??
      nextQuestions[0];
    setActiveQuestion(nextQuestion?.sourceNumber ?? 0);
    toast.success("Question deleted.");
  }, [deleteQuestion, questions]);

  const buildPayload = useCallback(
    (): ReviewTestPayload => ({
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
    }),
    [questions, savedTestId, settings],
  );

  const saveDraft = useCallback(async () => {
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
  }, [buildPayload, onSaveDraft, settings.name]);

  const requestPublish = useCallback(() => {
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
  }, [blockingIssues, settings.name]);

  const confirmPublish = useCallback(async () => {
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
  }, [buildPayload, onPublish]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      setShowLeaveDialog(true);
      return;
    }
    onBack();
  }, [isDirty, onBack]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return {
    // data
    questions,
    settings,
    currentQuestion,
    currentQuestionIndex,
    activeQuestion,

    // status
    hasAnswerKey,
    unresolvedCount,
    blockingIssues,
    isDirty,
    isSaving,

    // panels
    settingsOpen,
    questionSheetOpen,

    // dialogs
    deleteQuestion,
    showLeaveDialog,
    showPublishDialog,

    // setters
    setSettingsOpen,
    setQuestionSheetOpen,
    setDeleteQuestion,
    setShowLeaveDialog,
    setShowPublishDialog,

    // actions
    selectQuestion,
    updateQuestion,
    updateSettings,
    resolvedQuestions,
    resolveQuestion,
    confirmDeleteQuestion,
    saveDraft,
    requestPublish,
    confirmPublish,
    handleBack,
  };
}
