import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession, sendVerificationEmail } =
  createAuthClient();

export const useCurrentUser = () => {
  const { data: session, isPending } = useSession();
  return { user: session?.user || null, isPending };
};
