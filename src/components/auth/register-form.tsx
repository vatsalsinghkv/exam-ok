import { useForm } from "@tanstack/react-form-nextjs";
import { useState } from "react";

import { register } from "@/actions/auth/register";

import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError, FormSuccess, UnstyledLink } from "@/components/shared";

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

import { ROUTES } from "@/lib/constants/routes";
import { RegisterSchema, type RegisterValuesType } from "@/lib/schemas";
import { Social } from "./social";

const defaultValues: RegisterValuesType = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const form = useForm({
    defaultValues,
    validators: { onSubmit: RegisterSchema },
    async onSubmit({ value }) {
      const res = await register(value);

      if (res.status === "failed") {
        setError(res.error);
        return;
      }

      setSuccess(res.success);
    },
  });

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
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
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      type="text"
                      placeholder="John Doe"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

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
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <PasswordInput
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      aria-invalid={isInvalid}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="******"
                      autoComplete="new-password"
                    />

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="confirmPassword"
              validators={{
                onChangeListenTo: ["password"],
                onChange: ({ value, fieldApi }) => {
                  const password = fieldApi.form.getFieldValue("password");
                  if (value && password && value !== password) {
                    return "Passwords don't match";
                  }
                  return undefined;
                },
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Confirm Password
                    </FieldLabel>

                    <PasswordInput
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      aria-invalid={isInvalid}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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

            <FormError message={error} />
            <FormSuccess message={success} />

            <FieldGroup>
              <Field>
                <form.Subscribe
                  selector={(state) => [state.isValid, state.isSubmitting]}
                  children={([isValid, isSubmitting]) => (
                    <SubmitButton
                      type="submit"
                      isSubmitting={isSubmitting}
                      disabled={!isValid}
                      text="Create Account"
                    />
                  )}
                />
                <Social type="signup" />

                <FieldDescription className="px-6 text-center">
                  Already have an account?{" "}
                  <UnstyledLink href={ROUTES.auth.signin}>Sign in</UnstyledLink>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
