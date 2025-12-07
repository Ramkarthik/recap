import FirecrawlApp from "@mendable/firecrawl-js";
import { createLogger } from "./logger";
import type { ArticleMetadata } from "./types/article-metadata";

const logger = createLogger("firecrawl-extractor");

interface FirecrawlArticle {
    title: string;
    content: string;
    markdown: string;
    html: string;
    metadata: {
        title?: string;
        description?: string;
        language?: string;
        sourceURL: string;
    };
}

export async function extractArticleWithFirecrawl(url: string): Promise<ArticleMetadata | null> {
    try {
        const apiKey = process.env.FIRECRAWL_API_KEY;

        if (!apiKey) {
            logger.error("FIRECRAWL_API_KEY not set");
            return null;
        }

        logger.info({ url }, "Scraping with Firecrawl");

        const app = new FirecrawlApp({ apiKey });

        const result = await app.scrape(url, {
            formats: ["markdown", "html"],
            onlyMainContent: true,
        });

        if (!result) {
            logger.error({ url }, "Firecrawl scraping failed");
            return null;
        }

        logger.info({ url, title: result.metadata?.title }, "Successfully scraped with Firecrawl");
        const markdown = result.markdown || "";
        const firecrawlArticle: FirecrawlArticle = {
            title: result.metadata?.title || "",
            content: markdown.substring(0, Math.min(markdown.length, 10000)) || "",
            markdown: result.markdown || "",
            html: result.html || "",
            metadata: {
                title: result.metadata?.title,
                description: result.metadata?.description,
                language: result.metadata?.language,
                sourceURL: result.metadata?.sourceURL || url,
            },
        };

        const articleMetadata: ArticleMetadata = {
            title: firecrawlArticle.metadata.title || "",
            description: firecrawlArticle.metadata.description || "",
            content: firecrawlArticle.content,
            html: firecrawlArticle.html,
        };

        return articleMetadata;
    } catch (error) {
        logger.error({ url, error }, "Error scraping with Firecrawl");
        return null;
    }
}