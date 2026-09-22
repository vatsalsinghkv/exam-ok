type Props = {
  answerKeyStatus: "not-provided" | "mapped" | "partial" | "unmapped";
};

export function ReviewNotices({ answerKeyStatus }: Props) {
  if (answerKeyStatus === "not-provided") {
    return (
      <div className="mx-4 my-3 shrink-0 rounded-lg border bg-muted/30 px-4 py-2.5 text-sm">
        <span className="font-medium">No answer key provided.</span> You can
        still save or publish this test. Correct answers can be added later.
      </div>
    );
  }

  if (answerKeyStatus === "partial" || answerKeyStatus === "unmapped") {
    return (
      <div className="mx-4 my-3 shrink-0 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 text-sm">
        <span className="font-medium">Answer key mapping needs review.</span>{" "}
        Some answers could not be automatically matched.
      </div>
    );
  }

  return null;
}
