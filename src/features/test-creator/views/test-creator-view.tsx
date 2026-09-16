"use state";

import { PageHeader } from "@/components/shared/page-header";
import Upload from "../components/steps/upload";

export function TestCreatorView() {
  return (
    <div className="relative">
      <PageHeader name="Create New Test" />

      <div className="p-5">
        <Upload />
      </div>
    </div>
  );
}
