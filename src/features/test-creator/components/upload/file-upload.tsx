"use client";

import { FileText, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { MAX_FILE_SIZE } from "../../lib/constants";

type FileUploadProps = {
  value?: File | null;
  onFileChange?: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
  title?: string;
};

export function FileUpload({
  value = null,
  onFileChange,
  disabled = false,
  title = "",
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(value);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File) => {
    if (file.type !== "application/pdf") {
      return "Only PDF files are supported.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 50 MB.";
    }

    return null;
  }, []);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;

      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setFile(file);
      onFileChange?.(file);
    },
    [onFileChange, validateFile],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const droppedFile = event.dataTransfer.files[0];
      handleFile(droppedFile);
    },
    [disabled, handleFile],
  );

  const handleBrowse = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onFileChange?.(null);
  };

  if (file) {
    return (
      <div
        className={cn(
          "flex min-h-44 items-center justify-between rounded-xl border-2 border-dashed p-6 bg-background transition-colors",
          "border-primary/20",
          error && "border-destructive focus-within:ring-destructive",
          className,
        )}
      >
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
            <FileText className="size-5 text-muted-foreground" />
          </div>

          <div className="min-w-0">
            <p className="truncate font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          disabled={disabled}
          aria-label="Remove file"
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
        }}
        disabled={disabled}
      />

      {/** biome-ignore lint/a11y/useSemanticElements: <AI generated> */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleBrowse}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleBrowse();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex group min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          "border-primary/20 bg-background",
          "hover:bg-muted/30 hover:border-primary/70",
          isDragging && "border-primary bg-primary/5",
          error &&
            "border-destructive hover:border-destructive/80 bg-destructive/3",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/5">
          <Upload
            className={cn("size-5 text-primary", error && "text-destructive")}
          />
        </div>

        <h3
          className={cn("text-lg font-semibold", error && "text-destructive")}
        >
          Drop your {title} PDF here
        </h3>

        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Support for PDF files up to 50MB. AI will automatically extract
          questions.
        </p>

        <Button
          type="button"
          variant="outline"
          className={cn(
            "mt-5",
            error &&
              "border-destructive text-destructive hover:bg-destructive/5",
          )}
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            handleBrowse();
          }}
          disabled={disabled}
        >
          Browse Files
        </Button>
      </div>

      {error && <p className="text-sm text-destructive"> {error}</p>}
    </div>
  );
}
