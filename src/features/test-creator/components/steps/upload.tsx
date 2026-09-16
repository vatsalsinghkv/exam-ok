"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { logger } from "@/lib/utils";
import { parsePdfAction } from "../../actions/parse-pdf";
import { FileUpload } from "../file-upload";

export default function Upload() {
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [hasAnswerKey, setHasAnswerKey] = useState(false);
  const [extractedQuestionText, setExtractedQuestionText] =
    useState<string>("");
  const [extractedAnswerKeyText, setExtractedAnswerKeyText] =
    useState<string>("");

  const [isPending, startTransition] = useTransition();

  const handleAnswerKeyChange = (checked: boolean) => {
    setHasAnswerKey(checked);
    if (!checked) {
      setAnswerKeyFile(null);
    }
  };

  const handleParse = () => {
    if (!questionFile) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("questionFile", questionFile);

      if (hasAnswerKey && answerKeyFile) {
        formData.append("answerKeyFile", answerKeyFile);
      }

      const result = await parsePdfAction(formData);

      logger({ result });

      if (result.success) {
        if (result.questionText) setExtractedQuestionText(result.questionText);
        if (result.answerKeyText)
          setExtractedAnswerKeyText(result.answerKeyText);
        if (result.text && !hasAnswerKey) setExtractedQuestionText(result.text);
      } else {
        alert(result.error || "An error occurred during text extraction.");
      }
    });
  };

  return (
    <main className="flex flex-col gap-y-5">
      <header className="text-muted-foreground">
        Upload a question PDF to create questions
      </header>

      <div className="flex flex-col gap-y-4">
        {/* Question paper */}
        <FileUpload
          onFileChange={setQuestionFile}
          value={questionFile}
          disabled={isPending}
        />

        <div className="my-2 flex items-center gap-4">
          <Separator className="flex-1" />

          <div className="flex shrink-0 items-center gap-3">
            <Checkbox
              id="has-answer-key"
              checked={hasAnswerKey}
              onCheckedChange={handleAnswerKeyChange}
              disabled={isPending}
            />

            <Label
              htmlFor="has-answer-key"
              className="cursor-pointer whitespace-nowrap"
            >
              I have an answer key
            </Label>
          </div>

          <Separator className="flex-1" />
        </div>

        {/* Answer key upload */}
        {hasAnswerKey && (
          <FileUpload
            onFileChange={setAnswerKeyFile}
            value={answerKeyFile}
            disabled={isPending}
          />
        )}
      </div>

      <footer>
        <Button
          type="button"
          onClick={handleParse}
          disabled={
            !questionFile || (hasAnswerKey && !answerKeyFile) || isPending
          }
        >
          {isPending ? "Processing..." : "Create Test"}
        </Button>
      </footer>
      {extractedQuestionText && (
        <p className="text-muted-foreground">{extractedQuestionText}</p>
      )}
    </main>
  );
}
