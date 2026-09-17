import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ParsedTest } from "../../lib/types";

type Props = {
  data: ParsedTest;
  onBack: () => void;
};

export default function Review({ data, onBack }: Props) {
  const { name, questionCount, questions } = data;

  return (
    <div className="space-y-4 h-full flex-col flex min-h-0">
      <header className="shrink-0">
        <h2 className="font-bold text-lg">{name}</h2>
        <p>Total questions: {questionCount}</p>
      </header>

      <Tabs
        defaultValue={questions[0]?.sourceNumber}
        className="flex flex-1 min-h-0 w-full"
        orientation="vertical"
      >
        <ScrollArea className="w-72 pr-5 shrink-0 h-full overflow-y-auto">
          <TabsList
            variant="line"
            className="flex flex-col h-auto w-full bg-transparent"
          >
            {questions.map((q, i) => (
              <TabsTrigger
                key={q.sourceNumber}
                value={q.sourceNumber}
                className="flex flex-col text-left p-3 mb-1 items-start whitespace-normal h-auto w-full"
              >
                <span className="font-semibold">Q{i + 1}.</span>
                <span className="line-clamp-2 font-normal mt-1 opacity-80 text-sm">
                  {q.text}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <section className="flex-1 bg-white/30 h-full overflow-y-auto p-6 rounded-md border">
          {questions.map((q, i) => (
            <TabsContent
              key={q.sourceNumber}
              value={q.sourceNumber}
              className="mt-0 h-full outline-none"
            >
              <h3 className="font-bold text-xl mb-4 border-b pb-2">
                Question {i + 1}
              </h3>

              <div className="space-y-6">
                {/* Question Text */}
                <p className="whitespace-pre-wrap text-base leading-relaxed">
                  {q.text}
                </p>

                {/* Options List */}
                {q.options && q.options.length > 0 && (
                  <div className="flex flex-col gap-3 mt-6">
                    {q.options.map((option, index) => (
                      <div
                        key={option.text}
                        className="flex items-start gap-4 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-bold text-muted-foreground shrink-0 mt-0.5">
                          {String.fromCharCode(65 + index)}.{" "}
                        </span>
                        <span className="flex-1 whitespace-pre-wrap">
                          {option.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </section>
      </Tabs>
    </div>
  );
}
