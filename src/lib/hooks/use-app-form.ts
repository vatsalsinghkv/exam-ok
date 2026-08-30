import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

// Initialization
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, useTypedAppFormContext } = createFormHook({
  formContext,
  fieldContext,
  fieldComponents: {},
  formComponents: {},
});
