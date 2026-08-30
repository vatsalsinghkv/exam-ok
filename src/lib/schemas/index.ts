import { z } from "zod";

export const SettingsSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    isTwoFactorEnabled: z.boolean().optional(),
    password: z.string().min(6).optional(),
    newPassword: z.string().min(6).optional(),
  })
  .refine(
    ({ password, newPassword }) => {
      if (password && !newPassword) return false;
      return true;
    },
    {
      message: "New password is required",
      path: ["newPassword"],
    },
  )
  .refine(
    ({ password, newPassword }) => {
      if (!password && newPassword) return false;
      return true;
    },
    {
      message: "Password is required",
      path: ["password"],
    },
  );

export const LoginSchema = z.object({
  email: z.email({ message: "Please enter an email!" }),
  password: z.string().min(1, "Please enter a password"),
  code: z.string().optional(),
});

export type LoginValuesType = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Minimum 6 characters required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    },
  );

export type RegisterValuesType = z.infer<typeof RegisterSchema>;

export const ResetPasswordSchema = z.object({
  email: z.email("Please enter an email!"),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6, "Minimum 6 characters required"),
});
