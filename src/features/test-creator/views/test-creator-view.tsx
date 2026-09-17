import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";

import Upload from "../components/steps/upload";
import type { ParsedTest } from "../lib/types";

export function TestCreatorView() {
  const [parsedTest, setParsedTest] = useState<ParsedTest | null>(null);

  return (
    <div className="relative">
      <PageHeader name="Create New Test" />

      <div className="p-5">
        {parsedTest ? (
          <>Review</>
        ) : (
          <Upload
            onParsed={(data) => {
              setParsedTest(data);
            }}
          />
        )}
      </div>
    </div>
  );
}
