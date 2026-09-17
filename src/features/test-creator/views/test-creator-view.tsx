import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import Review from "../components/steps/review";
import Upload from "../components/steps/upload";
import type { ParsedTest } from "../lib/types";

export function TestCreatorView() {
  const [parsedTest, setParsedTest] = useState<ParsedTest | null>(null);

  return (
    <div className="relative h-full flex flex-col">
      <PageHeader name="Create New Test" />

      <div className="p-5 flex-1 flex flex-col min-h-0">
        {parsedTest ? (
          <Review data={parsedTest} onBack={() => setParsedTest(null)} />
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
