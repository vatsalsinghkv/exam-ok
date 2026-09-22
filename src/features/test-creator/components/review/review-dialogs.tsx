"use client";

import { AlertCircle } from "lucide-react";

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

import type { ParsedQuestion } from "../../lib/types/parser";

type Props = {
  deleteQuestion: ParsedQuestion | null;
  showLeaveDialog: boolean;
  showPublishDialog: boolean;
  unresolvedCount: number;
  isSaving: boolean;

  onDeleteDialogChange: (open: boolean) => void;
  onLeaveDialogChange: (open: boolean) => void;
  onPublishDialogChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  onConfirmLeave: () => void;
  onConfirmPublish: () => void;
};

export function ReviewDialogs({
  deleteQuestion,
  showLeaveDialog,
  showPublishDialog,
  unresolvedCount,
  isSaving,
  onDeleteDialogChange,
  onLeaveDialogChange,
  onPublishDialogChange,
  onConfirmDelete,
  onConfirmLeave,
  onConfirmPublish,
}: Props) {
  return (
    <>
      {/* Delete */}
      <AlertDialog
        open={deleteQuestion !== null}
        onOpenChange={onDeleteDialogChange}
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
              onClick={onConfirmDelete}
            >
              Delete question
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave */}
      <AlertDialog open={showLeaveDialog} onOpenChange={onLeaveDialogChange}>
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
              onClick={onConfirmLeave}
            >
              Leave and discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish */}
      <AlertDialog
        open={showPublishDialog}
        onOpenChange={onPublishDialogChange}
      >
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
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />

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

            <AlertDialogAction onClick={onConfirmPublish} disabled={isSaving}>
              Publish test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
