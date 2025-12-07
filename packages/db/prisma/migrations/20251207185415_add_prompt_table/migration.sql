/*
  Warnings:

  - A unique constraint covering the columns `[articleId]` on the table `ArticleContent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleContent_articleId_key" ON "ArticleContent"("articleId");

-- AddForeignKey
ALTER TABLE "ArticleContent" ADD CONSTRAINT "ArticleContent_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
