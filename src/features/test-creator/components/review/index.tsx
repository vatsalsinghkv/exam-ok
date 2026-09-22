"use client";

import { useReviewState } from "../../lib/hooks";
import type { ParsedTest } from "../../lib/types";
import type { ReviewTestPayload, SaveTestResult } from "../../lib/types/review";
import { ReviewDialogs } from "../review/review-dialogs";
import { ReviewHeader } from "../review/review-header";
import { ReviewNotices } from "../review/review-notices";
import { ReviewWorkspace } from "../review/review-workspace";
import { TestSettingsSheet } from "../review/test-settings";

type Props = {
  data: ParsedTest;
  onBack: () => void;
  onSaveDraft: (payload: ReviewTestPayload) => Promise<SaveTestResult>;
  onPublish: (payload: ReviewTestPayload) => Promise<SaveTestResult>;
};

export function Review({ data, onBack, onSaveDraft, onPublish }: Props) {
  const review = useReviewState({
    data,
    onBack,
    onSaveDraft,
    onPublish,
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ReviewHeader
        name={review.settings.name}
        questionCount={review.questions.length}
        unresolvedCount={review.unresolvedCount}
        isSaving={review.isSaving}
        onDiscard={review.handleBack}
        onSettings={() => review.setSettingsOpen(true)}
        onSaveDraft={review.saveDraft}
        onPublish={review.requestPublish}
      />

      <ReviewNotices answerKeyStatus={data.answerKey.status} />

      <ReviewWorkspace
        questions={review.questions}
        activeQuestion={review.activeQuestion}
        currentQuestion={review.currentQuestion}
        currentQuestionIndex={review.currentQuestionIndex}
        answerKeyStatus={data.answerKey.status}
        resolvedQuestions={review.resolvedQuestions}
        questionSheetOpen={review.questionSheetOpen}
        onQuestionSheetOpenChange={review.setQuestionSheetOpen}
        onSelectQuestion={review.selectQuestion}
        onChangeQuestion={review.updateQuestion}
        onDeleteQuestion={review.setDeleteQuestion}
        onResolveQuestion={review.resolveQuestion}
      />

      <TestSettingsSheet
        open={review.settingsOpen}
        onOpenChange={review.setSettingsOpen}
        settings={review.settings}
        questionCount={review.questions.length}
        onChange={review.updateSettings}
      />

      <ReviewDialogs
        deleteQuestion={review.deleteQuestion}
        showLeaveDialog={review.showLeaveDialog}
        showPublishDialog={review.showPublishDialog}
        unresolvedCount={review.unresolvedCount}
        isSaving={review.isSaving}
        onDeleteDialogChange={(open) => {
          if (!open) {
            review.setDeleteQuestion(null);
          }
        }}
        onLeaveDialogChange={review.setShowLeaveDialog}
        onPublishDialogChange={review.setShowPublishDialog}
        onConfirmDelete={review.confirmDeleteQuestion}
        onConfirmLeave={onBack}
        onConfirmPublish={review.confirmPublish}
      />
    </div>
  );
}
