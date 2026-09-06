import { Headphones, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { UnstyledLink } from "./unstyled-link";

type Props = { name: string; className?: string };

export function PageHeader({ name, className }: Props) {
  return (
    <div
      className={cn(
        "p-2 flex border-b justify-between items-center",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold capitalize tracking-tight">
          {name}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button
          render={<UnstyledLink href="mailto:example@example.com" />}
          variant="outline"
          size="sm"
        >
          <ThumbsUp />
          {/* <span className='hidden lg:block'>Feedback</span> */}
        </Button>

        <Button
          render={<UnstyledLink href="mailto:example@example.com" />}
          variant="outline"
          size="sm"
        >
          <Headphones />
          {/* <span className='hidden lg:block'>Need help?</span> */}
        </Button>
      </div>
    </div>
  );
}
