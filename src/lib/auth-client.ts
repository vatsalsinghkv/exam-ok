import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession } = createAuthClient();

export const useUserClient = () => {
  const { data: session } = useSession();
  return session?.user || null;
};
