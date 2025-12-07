import { prisma } from "@recap/db";
import { triggerPodcastProcessing, checkPodcastExists, getUnprocessedArticlesForUser } from "./podcast-helpers";

export async function retryFailedPodcasts() {
    console.log("Retrying failed podcasts...");

    const users = await prisma.user.findMany();

    for (const user of users) {
        for (let i = 1; i <= 3; i++) {
            const checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - i);
            checkDate.setHours(0, 0, 0, 0);

            try {
                const existingPodcast = await checkPodcastExists(user.id, checkDate);
                if (existingPodcast) continue;

                const articles = await getUnprocessedArticlesForUser(user.id);
                if (articles.length === 0) continue;

                await triggerPodcastProcessing(user.id, checkDate, articles);
            } catch (error) {
                console.error(`Failed retry for user ${user.id} on ${checkDate}:`, error);
            }
        }
    }

    console.log("Retry complete");
}