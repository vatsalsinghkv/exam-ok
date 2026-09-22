"use client";

import { CheckCircle2, Save, Settings2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export type HeaderProps = {
  name: string;
  questionCount: number;
  isSaving: boolean;
  onDiscard: () => void;
  onSettings: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
};

export function ReviewHeader({
  name,
  questionCount,
  isSaving,
  onDiscard,
  onSettings,
  onSaveDraft,
  onPublish,
}: HeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-4 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger />

        <div className="min-w-0 flex items-center gap-2">
          <h1 className="truncate font-semibold">{name || "Untitled Test"}</h1>

          <Badge variant="outline" className="h-5 px-1.5 text-[11px]">
            Draft
          </Badge>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onDiscard}
        >
          <X className="size-4" />
          <span className="hidden sm:inline">Discard</span>
        </Button>

        <Button type="button" variant="outline" size="sm" onClick={onSettings}>
          <Settings2 className="size-4" />
          <span className="hidden sm:inline">Settings</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSaving}
          onClick={onSaveDraft}
        >
          <Save className="size-4" />
          <span className="hidden sm:inline">Save Draft</span>
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={isSaving || questionCount === 0}
          onClick={onPublish}
        >
          <CheckCircle2 className="size-4" />
          <span>Publish</span>
        </Button>
      </div>
    </header>
  );
}
