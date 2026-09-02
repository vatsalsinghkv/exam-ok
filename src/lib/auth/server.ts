import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getUserServer(reqHeaders?: Headers) {
  const requestHeaders = reqHeaders || (await headers());

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
  return session?.user || null;
}

export const { signInEmail, signUpEmail, signOut, signInSocial } = auth.api;
