"use server";

import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { getUserServer } from "@/lib/services/auth/server";
import { prisma } from "@/lib/services/prisma";
import type { ReviewTestPayload, SaveTestResult } from "../lib/types/review";

const saveTestSchema = z.object({
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

type SaveTestInput = ReviewTestPayload & {
  status: "DRAFT" | "PUBLISHED";
};

export async function saveTestAction(
  input: SaveTestInput,
): Promise<SaveTestResult> {
  try {
    const parsed = saveTestSchema.parse(input);

    const user = await getUserServer();
    if (!user) throw new Error("Unauthorized!");

    const userId = user.id;

    if (
      parsed.status === "PUBLISHED" &&
      parsed.questions.some(
        (question) =>
          !question.text.trim() ||
          question.options.length !== 4 ||
          question.options.some(
            (option) => !option.text.trim() && !option.image,
          ),
      )
    ) {
      return {
        success: false,
        error: "Fix the incomplete questions before publishing.",
      };
    }

    return await prisma.$transaction(
      async (tx) => {
        let testId = parsed.testId;

        /*
         * --------------------------------------------------------
         * 1. Create or update Test
         * --------------------------------------------------------
         */

        if (testId) {
          const existingTest = await tx.test.findFirst({
            where: {
              id: testId,
              userId,
            },
          });

          if (!existingTest) {
            return {
              success: false as const,
              error: "Test not found.",
            };
          }

          const attemptCount = await tx.attempt.count({
            where: {
              testId,
            },
          });

          if (attemptCount > 0) {
            return {
              success: false as const,
              error:
                "This test can no longer be edited because attempts already exist.",
            };
          }

          await tx.test.update({
            where: {
              id: testId,
            },
            data: {
              name: parsed.name,
              description: parsed.description || null,
              duration: parsed.duration,
              marksPerQuestion: parsed.marksPerQuestion,
              negativeMark: parsed.negativeMark,
              status: parsed.status,
            },
          });

          /*
           * For now, replace the draft's questions.
           *
           * Question/Option/Answer relations cascade from Question.
           */
          await tx.question.deleteMany({
            where: {
              testId,
            },
          });
        } else {
          const test = await tx.test.create({
            data: {
              name: parsed.name,
              description: parsed.description || null,
              duration: parsed.duration,
              marksPerQuestion: parsed.marksPerQuestion,
              negativeMark: parsed.negativeMark,
              status: parsed.status,
              userId,
            },
          });

          testId = test.id;
        }

        /*
         * --------------------------------------------------------
         * 2. Build Question + Option records in memory
         * --------------------------------------------------------
         */

        const questionRows: {
          id: string;
          text: string;
          image: string | null;
          order: number;
          correctOptionId: string | null;
          testId: string;
        }[] = [];

        const optionRows: {
          id: string;
          text: string;
          image: string | null;
          order: number;
          questionId: string;
        }[] = [];

        for (const question of parsed.questions) {
          const questionId = createId();

          let correctOptionId: string | null = null;

          for (const option of question.options) {
            const optionId = createId();

            optionRows.push({
              id: optionId,
              text: option.text,
              image: option.image ?? null,
              order: option.position,
              questionId,
            });

            if (option.position === question.correctOptionPosition) {
              correctOptionId = optionId;
            }
          }

          questionRows.push({
            id: questionId,
            text: question.text,
            image: question.image ?? null,
            order: question.sourceNumber,
            correctOptionId,
            testId,
          });
        }

        /*
         * --------------------------------------------------------
         * 3. Bulk insert
         * --------------------------------------------------------
         */

        await tx.question.createMany({
          data: questionRows,
        });

        await tx.option.createMany({
          data: optionRows,
        });

        return {
          success: true as const,
          testId,
        };
      },
      {
        maxWait: 5000,
        timeout: 30000,
      },
    );
  } catch (error) {
    console.error("Save test failed:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid test data.",
      };
    }

    return {
      success: false,
      error: "Failed to save the test.",
    };
  }
}
