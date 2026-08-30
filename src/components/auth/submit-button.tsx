import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props extends React.ComponentProps<typeof Button> {
  isSubmitting: boolean;
  text: string;
}

export function SubmitButton({
  text,
  isSubmitting,
  disabled,
  ...props
}: Props) {
  return (
    <Button className="w-full" disabled={isSubmitting || disabled} {...props}>
      {isSubmitting && <Loader2 className="animate-spin w-5 h-5" />}
      {text}
    </Button>
  );
}
