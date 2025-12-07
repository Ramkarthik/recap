import { extractArticleWithFirecrawl } from "./firecrawl-parser";
import { extractArticleWithReadability } from "./readability-parser";
import type { ArticleMetadata } from "./types/article-metadata";

export async function extractArticle(url: string): Promise<ArticleMetadata | null> {
    try {
        const readability = await extractArticleWithReadability(url);
        if (readability) {
            return readability;
        }
        const firecrawl = await extractArticleWithFirecrawl(url);
        if (firecrawl) {
            return firecrawl;
        }
        return null;
    } catch (error) {
        console.error("Error extracting article:", error);
        return null;
    }
}