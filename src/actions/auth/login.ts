"use server";

import { headers } from "next/headers";
import { signInEmail } from "@/lib/auth/server";
import { DEFAULT_AUTHENTICATED_REDIRECT } from "@/lib/constants/routes";
import { LoginSchema, type LoginValuesType } from "@/lib/schemas";
import type { AuthResponseType } from "@/lib/types/auth";

type LoginUser = Awaited<ReturnType<typeof signInEmail>>["user"];

export async function login(
  values: LoginValuesType,
): Promise<AuthResponseType<LoginUser>> {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      status: "failed",
      error: "Invalid fields!",
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const data = await signInEmail({
      body: {
        email,
        password,
        callbackURL: DEFAULT_AUTHENTICATED_REDIRECT,
      },
      headers: await headers(),
    });

    return {
      status: "success",
      success: "User logged in successfully!",
      data: data.user,
    };
  } catch (error) {
    return {
      status: "failed",
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}
