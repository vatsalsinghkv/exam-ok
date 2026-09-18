"use client";

import { Settings2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

export type TestSettings = {
  name: string;
  description: string;
  duration: number | null;
  marksPerQuestion: number;
  negativeMark: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  settings: TestSettings;
  questionCount: number;

  onChange: (settings: TestSettings) => void;
};

export function TestSettingsSheet({
  open,
  onOpenChange,
  settings,
  questionCount,
  onChange,
}: Props) {
  const update = <K extends keyof TestSettings>(
    key: K,
    value: TestSettings[K],
  ) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="size-4" />
            Test Settings
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-6">
          <div className="space-y-2">
            <Label htmlFor="test-name">Test name</Label>

            <Input
              id="test-name"
              value={settings.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="e.g. UGC NET Computer Science June 2026"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-description">Description</Label>

            <Textarea
              id="test-description"
              value={settings.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Optional description"
              className="min-h-24 resize-none"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>

            <div className="flex items-center gap-2">
              <Input
                id="duration"
                type="number"
                min={1}
                value={settings.duration ?? ""}
                onChange={(event) =>
                  update(
                    "duration",
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
              />

              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="marks">Marks per question</Label>

            <Input
              id="marks"
              type="number"
              min={0}
              step="0.25"
              value={settings.marksPerQuestion}
              onChange={(event) =>
                update("marksPerQuestion", Number(event.target.value))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="negative-mark">Negative marking</Label>

            <Input
              id="negative-mark"
              type="number"
              min={0}
              step="0.25"
              value={settings.negativeMark}
              onChange={(event) =>
                update("negativeMark", Number(event.target.value))
              }
            />
          </div>

          <Separator />

          <div className="rounded-lg bg-muted/40 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Questions</span>

              <span className="font-medium">{questionCount}</span>
            </div>

            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Maximum marks</span>

              <span className="font-medium">
                {questionCount * settings.marksPerQuestion}
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
