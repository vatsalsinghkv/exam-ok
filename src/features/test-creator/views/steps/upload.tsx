import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { logger } from "@/lib/utils";

import { parsePdfAction } from "../../actions/parse-pdf";
import { FileUpload } from "../../components/file-upload";
import type { ParsedTest } from "../../lib/types";

type UploadProps = {
  onParsed: (data: ParsedTest) => void;
};

export function Upload({ onParsed }: UploadProps) {
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [hasAnswerKey, setHasAnswerKey] = useState(false);

  const [isPending, startTransition] = useTransition();

  const handleAnswerKeyChange = (checked: boolean) => {
    setHasAnswerKey(checked);
    if (!checked) setAnswerKeyFile(null);
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

      if (!result.success) {
        alert(result.error || "Failed to process the PDF.");
        return;
      }

      if (!result.data) {
        alert("No parsed data was returned.");
        return;
      }

      onParsed(result.data);
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
          title="Question"
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

        {/* Answer key */}
        {hasAnswerKey && (
          <FileUpload
            title="Answer Key"
            onFileChange={setAnswerKeyFile}
            value={answerKeyFile}
            disabled={isPending}
          />
        )}
      </div>

      <footer className="flex justify-center">
        <Button
          type="button"
          onClick={handleParse}
          size="lg"
          disabled={
            !questionFile || (hasAnswerKey && !answerKeyFile) || isPending
          }
        >
          {isPending ? "Processing..." : "Create Test"}
        </Button>
      </footer>
    </main>
  );
}
