import { Hono } from "hono";
import { processArticles } from "./article-processing";
import { triggerPodcastGeneration } from "./trigger-podcast";
import { retryFailedPodcasts } from "./retry-podcasts";

const app = new Hono();

const cronAuth = async (c: any, next: any) => {
    const authHeader = c.req.header("Authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    await next();
};

app.use("*", cronAuth);

app.get("/trigger-podcast-generation", async (c) => {
    await triggerPodcastGeneration();
    return c.json({ success: true });
});

app.get("/article-processing", async (c) => {
    await processArticles();
    return c.json({ success: true });
});

app.get("/retry-podcasts", async (c) => {
    await retryFailedPodcasts();
    return c.json({ success: true });
});

export default app;