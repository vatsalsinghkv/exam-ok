import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  answerKeyStatus: "not-provided" | "mapped" | "partial" | "unmapped";
  onClose: () => void;
};

export function ReviewNotices({ answerKeyStatus, onClose }: Props) {
  if (answerKeyStatus === "not-provided") {
    return (
      <div
        className={cn(
          "mx-4 my-2 shrink-0 rounded-md border bg-muted/30 px-3 py-0.5 text-sm",
          "flex justify-between items-center",
          "border-cyan-500/30 bg-cyan-500/5",
        )}
      >
        <p>
          <span className="font-medium">No answer key provided.</span> Correct
          answers can be added later.
        </p>

        <Button onClick={onClose} size="icon-sm" variant="ghost">
          <X />
        </Button>
      </div>
    );
  }

  if (answerKeyStatus === "partial" || answerKeyStatus === "unmapped") {
    return (
      <div
        className={cn(
          "mx-4 my-2 shrink-0 rounded-md border px-3 py-0.5 text-sm",
          "flex justify-between items-center",
          "border-amber-500/30 bg-amber-500/5",
        )}
      >
        <p>
          <span className="font-medium">Answer key mapping needs review.</span>{" "}
          Some answers could not be automatically matched.
        </p>

        <Button onClick={onClose} size="icon-sm" variant="ghost">
          <X />
        </Button>
      </div>
    );
  }

  return null;
}
