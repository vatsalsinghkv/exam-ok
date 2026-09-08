"use server";

import {
  RegisterSchema,
  type RegisterValuesType,
} from "@/features/auth/schemas";
import type { AuthResponseType } from "@/features/auth/type";
import { DEFAULT_AUTHENTICATED_REDIRECT } from "@/lib/constants/routes";
import { signUpEmail } from "@/lib/services/auth/server";

type RegisterUser = Awaited<ReturnType<typeof signUpEmail>>["user"];

export async function register(
  values: RegisterValuesType,
): Promise<AuthResponseType<RegisterUser>> {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      status: "failed",
      error: "Invalid fields!",
    };
  }

  const { email, password, name } = validatedFields.data;

  try {
    const data = await signUpEmail({
      body: {
        name,
        email,
        password,
        callbackURL: DEFAULT_AUTHENTICATED_REDIRECT,
      },
    });

    return {
      status: "success",
      success: "User created successfully!",
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
