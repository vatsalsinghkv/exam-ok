"use client";

import { UnstyledLink } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { useSession } from "@/lib/auth/client";
import { ROUTES } from "@/lib/constants/routes";

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
            href={ROUTES.auth.register}
          >
            Sign Up
          </UnstyledLink>

          <UnstyledLink
            className={buttonVariants({ variant: "default", size: "lg" })}
            href={ROUTES.auth.login}
          >
            Sign In
          </UnstyledLink>
        </div>
      </div>
    </main>
  );
}
