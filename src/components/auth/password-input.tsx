"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordInputProps = React.ComponentProps<typeof Input>;

export function PasswordInput({ ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative group">
      <Input
        {...props}
        type={showPassword ? "text" : "password"}
        className="pr-10"
      />

      <Button
        type="button"
        variant="link"
        size="icon"
        className="absolute right-0 top-0 text-foreground/50 group-focus-within:text-foreground transition-all"
        onClick={() => setShowPassword((previous) => !previous)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
}
