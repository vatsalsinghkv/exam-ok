"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { signIn } from "@/lib/services/auth/client";

interface Props {
  type: "login" | "signup";
}

export function Social({ type }: Props) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | null>(null);

  const clickHandler = async (provider: "google") => {
    setLoadingProvider(provider);
    try {
      await signIn.social({ provider, callbackURL: ROUTES.dashboard.home });
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Something went wrong");
      setLoadingProvider(null);
    }
  };

  return (
    <div className="flex items-center w-full gap-x-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => clickHandler("google")}
        className="w-full"
      >
        {loadingProvider === "google" ? (
          <Loader2 className="animate-spin w-5 h-5" />
        ) : (
          <FcGoogle size={20} className="mr-1" />
        )}
        {type === "login" ? "Login" : "Sign up"} with Google
      </Button>
    </div>
  );
}
