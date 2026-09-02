import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession, sendVerificationEmail } =
  createAuthClient();

export const getUserClient = () => {
  const { data: session } = useSession();
  return session?.user || null;
};
