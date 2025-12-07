import { prisma } from "@recap/db";
import { extractArticle } from "@recap/shared";
import { generateArticleSummary } from "./ai";

export async function parseArticle(payload: any, requestId: string, idempotencyKey: string) {
    const { articleId } = payload;
    console.log("Parsing article for requestId", requestId, "and idempotencyKey", idempotencyKey);

    const article = await prisma.article.findUnique({
        where: {
            id: articleId,
        },
        include: {
            content: true,
        },
    });

    if (!article) {
        console.error("Article not found for id", articleId);
        return;
    }
    const existingContent = article.content && article.content.content;
    const parsedArticle = existingContent ? {
        title: article.title,
        content: existingContent,
        description: existingContent.substring(0, Math.min(existingContent.length, 100)) || '',
        html: existingContent
    } : await extractArticle(article.url);

    if (!parsedArticle) {
        console.error("Article parsing failed for id", articleId);
        return;
    }

    console.log("Article parsed successfully for id", articleId);
    await prisma.article.update({
        where: {
            id: articleId,
        },
        data: {
            title: parsedArticle.title,
        },
    });

    if (!existingContent) {
        await prisma.articleContent.create({
            data: {
                articleId: articleId,
                content: parsedArticle.content,
            },
        });
    }

    console.log("Article parsed successfully for id", articleId);

    const summary = await generateArticleSummary(parsedArticle);

    if (!summary) {
        console.error("Article summary generation failed for id", articleId);
        return;
    }

    console.log("Article summary generated successfully for id", articleId);
    await prisma.article.update({
        where: {
            id: articleId,
        },
        data: {
            summary: summary.summary,
            category: summary.category,
        },
    });

    console.log("Article summary generated updated in the db successfully for id", articleId);
}