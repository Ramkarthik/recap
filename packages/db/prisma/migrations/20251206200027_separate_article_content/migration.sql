/*
  Warnings:

  - You are about to drop the column `content` on the `Article` table. All the data in the column will be lost.
  - Made the column `processed` on table `Article` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "content",
ALTER COLUMN "processed" SET NOT NULL;

-- CreateTable
CREATE TABLE "ArticleContent" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "content" TEXT,

    CONSTRAINT "ArticleContent_pkey" PRIMARY KEY ("id")
);
