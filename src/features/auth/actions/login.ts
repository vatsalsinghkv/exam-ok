"use server";

import { headers } from "next/headers";
import { LoginSchema, type LoginValuesType } from "@/features/auth/schemas";
import type { AuthResponseType } from "@/features/auth/type";
import { DEFAULT_AUTHENTICATED_REDIRECT } from "@/lib/constants/routes";
import { signInEmail } from "@/lib/services/auth/server";

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
