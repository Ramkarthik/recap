import { prisma } from "@recap/db";

export async function triggerPodcastProcessing(
    userId: string,
    date: Date,
    articleIds: string[]
) {
    const backgroundEndpointUrl = process.env.BACKGROUND_ENDPOINT_URL!;

    await fetch(backgroundEndpointUrl + "/generate-podcast", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.BACKGROUND_API_KEY}`,
        },
        body: JSON.stringify({
            userId,
            date: date.toISOString(),
            articleIds,
        }),
    });
}

export async function getUnprocessedArticlesForUser(userId: string) {
    const userArticles = await prisma.userArticle.findMany({
        where: {
            userId,
        },
        include: {
            article: true,
        },
        orderBy: {
            addedAt: "asc" as const,
        },
    });

    return userArticles.filter(ua => !ua.article.processed).map(ua => ua.articleId);
}

export async function checkPodcastExists(userId: string, date: Date) {
    return await prisma.podcast.findFirst({
        where: {
            userId,
            date,
        },
    });
}