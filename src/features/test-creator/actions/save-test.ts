"use server";

import { z } from "zod";
import { getUserServer } from "@/lib/services/auth/server";
import { prisma } from "@/lib/services/prisma";
import { saveTestSchema } from "../lib/schemas";
import type { ReviewTestPayload, SaveTestResult } from "../lib/types/review";

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
      parsed.questions.some((question) =>
        question.options.some((option) => !option.text.trim() && !option.image),
      )
    ) {
      return {
        success: false,
        error: "Every question option must contain text or an image.",
      };
    }

    if (
      parsed.status === "PUBLISHED" &&
      parsed.questions.some((question) => question.text.trim().length === 0)
    ) {
      return {
        success: false,
        error: "Every question must have text.",
      };
    }

    if (
      parsed.status === "PUBLISHED" &&
      parsed.questions.some((question) => question.options.length !== 4)
    ) {
      return {
        success: false,
        error: "Every question must have exactly four options.",
      };
    }

    if (parsed.status === "PUBLISHED" && input.questions.length === 0) {
      return {
        success: false,
        error: "A test must contain at least one question.",
      };
    }

    return await prisma.$transaction(async (tx) => {
      let testId = parsed.testId;

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

      for (const question of parsed.questions) {
        const createdQuestion = await tx.question.create({
          data: {
            text: question.text,
            image: question.image,

            order: question.sourceNumber,

            testId,

            options: {
              create: question.options.map((option) => ({
                text: option.text,
                image: option.image,
                order: option.position,
              })),
            },
          },

          include: {
            options: true,
          },
        });

        if (question.correctOptionPosition !== null) {
          // TODO: replace index with order
          const correctOption = createdQuestion.options.find(
            (_, index) => index + 1 === question.correctOptionPosition,
          );

          if (correctOption) {
            await tx.question.update({
              where: {
                id: createdQuestion.id,
              },
              data: {
                correctOptionId: correctOption.id,
              },
            });
          }
        }
      }

      return {
        success: true as const,
        testId,
      };
    });
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
