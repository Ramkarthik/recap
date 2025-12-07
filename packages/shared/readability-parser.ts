import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { createLogger } from "./logger";
import type { ArticleMetadata } from "./types/article-metadata";

const logger = createLogger("readability-extractor");

interface ExtractedArticle {
    title: string;
    content: string;
    textContent: string;
    excerpt: string;
    byline: string | null;
    length: number;
    siteName: string | null;
}

export async function extractArticleWithReadability(url: string): Promise<ArticleMetadata | null> {
    try {
        logger.info({ url }, "Fetching article");

        // Fetch the HTML
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; RecapBot/1.0)",
            },
        });

        if (!response.ok) {
            logger.error({ url, status: response.status }, "Failed to fetch article");
            return null;
        }

        const html = await response.text();

        // Parse with JSDOM
        const dom = new JSDOM(html, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (!article) {
            logger.error({ url }, "Failed to parse article");
            return null;
        }

        logger.info({ url, title: article.title }, "Successfully extracted article");

        const extractedArticle: ExtractedArticle = {
            title: article.title || "",
            content: article.textContent || "",
            textContent: article.textContent || "",
            excerpt: article.excerpt || "",
            byline: article.byline || null,
            length: article.length || 0,
            siteName: article.siteName || null,
        };

        const articleMetadata: ArticleMetadata = {
            title: extractedArticle.title,
            description: extractedArticle.excerpt,
            content: extractedArticle.textContent,
            html: extractedArticle.content,
        };

        return articleMetadata;
    } catch (error) {
        logger.error({ url, error }, "Error extracting article");
        return null;
    }
}