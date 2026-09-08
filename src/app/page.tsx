"use client";

import { UnstyledLink } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { useSession } from "@/lib/services/auth/client";

export default function Home() {
  const { data, isPending } = useSession();
  const user = data?.user;

  console.dir(data);
  console.dir({ isPending });
  return (
    <main className="flex items-center justify-center h-screen">
      <div>
        <h1>User: {user?.name}</h1>
        <div className="flex gap-4">
          <UnstyledLink
            className={buttonVariants({ variant: "outline", size: "lg" })}
            href={ROUTES.auth.signup}
          >
            Sign Up
          </UnstyledLink>

          <UnstyledLink
            className={buttonVariants({ variant: "default", size: "lg" })}
            href={ROUTES.auth.signin}
          >
            Sign In
          </UnstyledLink>
        </div>
      </div>
    </main>
  );
}
