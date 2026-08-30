import { CheckCircle } from "lucide-react";

interface Props {
  message?: string;
}

export const FormSuccess = ({ message }: Props) => {
  if (!message) return null;

  return (
    <div className="bg-emerald-500/15 text-emerald-500 flex items-center gap-x-2 rounded-md p-3 text-sm">
      <CheckCircle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};
