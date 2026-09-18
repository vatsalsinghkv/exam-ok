import { z } from "zod";

export const saveTestSchema = z.object({
  testId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  name: z.string().trim().min(1),
  description: z.string(),
  duration: z.number().int().positive().nullable(),
  marksPerQuestion: z.number().nonnegative(),
  negativeMark: z.number().nonnegative(),
  questions: z
    .array(
      z.object({
        sourceNumber: z.number().int().positive(),
        text: z.string(),
        image: z.string().optional(),
        options: z
          .array(
            z.object({
              position: z.union([
                z.literal(1),
                z.literal(2),
                z.literal(3),
                z.literal(4),
              ]),
              text: z.string(),
              image: z.string().optional(),
            }),
          )
          .length(4),

        correctOptionPosition: z
          .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
          .nullable(),
      }),
    )
    .min(1),
});
