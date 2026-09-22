import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";

import { Review, Upload } from "@/features/test-creator/components";
import type { ParsedTest } from "@/features/test-creator/lib/types";
import { saveTestAction } from "../actions/save-test";

export function TestCreatorView() {
  const [parsedTest, setParsedTest] = useState<ParsedTest | null>(null);

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <PageHeader name="Create New Test" />

      {parsedTest ? (
        <Review
          data={parsedTest}
          onBack={() => setParsedTest(null)}
          onSaveDraft={async (payload) => {
            const result = await saveTestAction({
              ...payload,
              status: "DRAFT",
            });

            if (!result.success) {
              toast.error(result.error);
            }

            return result;
          }}
          onPublish={async (payload) => {
            const result = await saveTestAction({
              ...payload,
              status: "PUBLISHED",
            });

            if (!result.success) {
              toast.error(result.error);
            }

            return result;
          }}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col p-5">
          <Upload
            onParsed={(data) => {
              setParsedTest(data);
            }}
          />
        </div>
      )}
    </div>
  );
}
