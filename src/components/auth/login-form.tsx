"use client";

import { useForm } from "@tanstack/react-form-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { FormError, UnstyledLink } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth/client";
import { ROUTES } from "@/lib/constants/routes";
import { LoginSchema, type LoginValuesType } from "@/lib/schemas";
import { cn, logger } from "@/lib/utils";
import { PasswordInput } from "./password-input";
import { SubmitButton } from "./submit-button";

const defaultValues: LoginValuesType = {
  email: "",
  password: "",
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [error, setError] = useState("");

  const router = useRouter();

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: LoginSchema,
    },
    async onSubmit({ value }) {
      setError("");
      const { data, error } = await signIn.email({
        email: value.email,
        password: value.password,
        callbackURL: ROUTES.dashboard,
        rememberMe: true,
      });

      if (error) {
        setError(error?.message ?? "Authentication failed.");
        return;
      }

      toast.success("User logged in successfully!");
      router.refresh();
      router.push(data?.url ?? ROUTES.dashboard);
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="email"
                        type="email"
                        placeholder="jon.doe@example.com"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
              <form.Field
                name="password"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="flex items-center">
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <UnstyledLink
                          href={ROUTES.auth.reset}
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </UnstyledLink>
                      </div>
                      <PasswordInput
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        type="password"
                        autoComplete="new-password"
                        placeholder="******"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              {error && <FormError message={error} />}

              <Field>
                <form.Subscribe
                  selector={(state) => [state.isValid, state.isSubmitting]}
                  children={([isValid, isSubmitting]) => (
                    <SubmitButton
                      type="submit"
                      isSubmitting={isSubmitting}
                      disabled={!isValid}
                      text="Login"
                    />
                  )}
                />
                <Button variant="outline" type="button">
                  Login with Google
                </Button>

                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <UnstyledLink href={ROUTES.auth.register}>
                    Register
                  </UnstyledLink>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
