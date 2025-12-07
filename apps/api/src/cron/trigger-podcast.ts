import { prisma, type User } from "@recap/db";
import { triggerPodcastProcessing, checkPodcastExists, getUnprocessedArticlesForUser } from "./podcast-helpers";

export async function triggerPodcastGeneration() {
    console.log("Triggering podcast generation...");

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const users = await prisma.user.findMany();

    for (const user of users) {
        try {
            const existingPodcast = await checkPodcastExists(user.id, yesterday);
            if (existingPodcast) continue;

            const articles = await getUnprocessedArticlesForUser(user.id);
            if (articles.length === 0) continue;

            await triggerPodcastProcessing(user.id, yesterday, articles);
        } catch (error) {
            console.error(`Failed to trigger podcast for user ${user.id}:`, error);
        }
    }

    console.log("Triggered podcast generation for all users");
}

export async function triggerPodcastGenerationForUser(user: User, force: boolean = false) {
    console.log("Triggering podcast generation...");

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate());
    yesterday.setHours(0, 0, 0, 0);


    try {
        const existingPodcast = await checkPodcastExists(user.id, yesterday);

        if (existingPodcast && !force) return;
        console.log("Existing podcast", existingPodcast);
        const userArticles = await prisma.userArticle.findMany({
            where: {
                userId: user.id,
            },
            include: {
                article: true,
            },
        });

        const articles = userArticles.map(ua => ua.article).filter(article => !article.processed);
        if (articles.length === 0) return;
        console.log("Articles", articles);

        await triggerPodcastProcessing(user.id, force ? new Date() : yesterday, articles.map(article => article.id));
    } catch (error) {
        console.error(`Failed to trigger podcast for user ${user.id}:`, error);
    }
    console.log("Triggered podcast generation for user", user.id);
}