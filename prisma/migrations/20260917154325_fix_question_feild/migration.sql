/*
  Warnings:

  - You are about to drop the column `subTopic` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `topic` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `randomOrder` on the `test` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[questionId,order]` on the table `option` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[testId,order]` on the table `question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `option` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "option" ADD COLUMN     "image" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "question" DROP COLUMN "subTopic",
DROP COLUMN "topic";

-- AlterTable
ALTER TABLE "test" DROP COLUMN "randomOrder",
ADD COLUMN     "status" "TestStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX "option_questionId_order_key" ON "option"("questionId", "order");

-- CreateIndex
CREATE INDEX "question_correctOptionId_idx" ON "question"("correctOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "question_testId_order_key" ON "question"("testId", "order");
