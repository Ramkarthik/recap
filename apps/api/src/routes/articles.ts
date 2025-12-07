import { Hono } from "hono";
import { prisma } from "@recap/db";
import { authMiddleware } from "../middleware/auth";
import type { Variables } from "../types";
import { createSpan, extractArticle } from "@recap/shared";
import { processArticle } from "../cron/article-helpers";

const app = new Hono<{ Variables: Variables }>();

app.use("*", authMiddleware);

/*
The endpoint for saving an article that's used by the bookmarklet
*/
app.post("/", async (c) => {
    const user = c.get("user");
    const logger = c.get("logger");

    const { url, title, content } = await c.req.json();
    console.log("content", content);
    const span = createSpan(logger, "save_article", { userId: user.id, url });
    try {
        let article = await prisma.article.findUnique({ where: { url } });
        let created = false;

        if (!article) {
            try {
                article = await prisma.article.create({
                    data: { url, title, },
                });
                created = true;
            } catch (error) {
                article = await prisma.article.findUnique({ where: { url } });

                if (!article) {
                    logger.error({ url, title, error }, "Failed to create article and recovery failed");
                    throw error;
                }
            }
        }

        if (created) {
            await processArticle(article.id);
            logger.info({ articleId: article.id }, "Created new article");
        } else {
            const articleContent = await prisma.articleContent.findUnique({ where: { articleId: article.id } });
            if (!articleContent) {
                logger.info({ articleId: article.id }, "Processing article since content is missing");
                await processArticle(article.id);
            }
            logger.info({ articleId: article.id }, "Article already exists");
        }

        const existingLink = await prisma.userArticle.findFirst({
            where: { userId: user.id, articleId: article.id }
        });

        if (!existingLink) {
            try {
                await prisma.userArticle.create({
                    data: { userId: user.id, articleId: article.id },
                });
            } catch (e) {
                logger.warn({ userId: user.id, articleId: article.id }, "Race condition on UserArticle creation");
            }
        }

        span.end({ articleId: article.id });

        return c.json({ article });
    } catch (error) {
        span.error(error as Error);
        throw error;
    } finally {
        span.end();
    }
});

// List user articles
app.get("/", async (c) => {
    const user = c.get("user");
    console.log("/articles");
    const logger = c.get("logger");

    const span = createSpan(logger, "list_articles", { userId: user.id });
    try {
        const userArticles = await prisma.userArticle.findMany({
            where: { userId: user.id },
            include: { article: true },
            orderBy: { addedAt: "desc" },
        });

        span.end({ count: userArticles.length });

        return c.json({ articles: userArticles });
    } catch (error) {
        span.error(error as Error);
        throw error;
    } finally {
        span.end();
    }
});

// Get single article
app.get("/:id", async (c) => {
    console.log("/articlesWithId");
    const user = c.get("user");
    const id = c.req.param("id");
    const logger = c.get("logger");
    logger.info({ articleId: id, userId: user.id }, "Created new article");
    const userArticle = await prisma.userArticle.findFirst({
        where: { articleId: id, userId: user.id },
        include: { article: { include: { content: true } } },
    });
    console.log("userArticle", userArticle);
    if (!userArticle) {
        return c.json({ error: "Not found" }, 404);
    }

    return c.json({ article: userArticle });
});

export default app;