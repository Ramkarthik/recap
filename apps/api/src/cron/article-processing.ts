import { prisma } from "@recap/db";
import { processArticle } from "./article-helpers";

/*
This function is called by the cron job to process articles.
*/
export async function processArticles() {
    console.log("Starting article processing...");

    const articles = await prisma.article.findMany({
        where: {
            processed: false,
        },
    });

    for (const article of articles) {
        try {
            await processArticle(article.id);
            console.log(`Processed article: ${article.url}`);
        } catch (error) {
            console.error(`Failed to process article ${article.url}:`, error);
        }
    }
    console.log("Article processing complete");
}