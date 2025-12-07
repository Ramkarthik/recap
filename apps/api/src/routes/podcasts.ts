import { Hono } from "hono";
import { prisma } from "@recap/db";
import { authMiddleware } from "../middleware/auth";
import type { Variables } from "../types";
import { triggerPodcastGenerationForUser } from "../cron/trigger-podcast";

const app = new Hono<{ Variables: Variables }>();

app.use("*", authMiddleware);

// List user podcasts
app.get("/", async (c) => {
    const user = c.get("user");

    const podcasts = await prisma.podcast.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
    });

    return c.json({ podcasts });
});

// Get single podcast
app.get("/:id", async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");

    const podcast = await prisma.podcast.findFirst({
        where: { id, userId: user.id },
    });

    if (!podcast) {
        return c.json({ error: "Not found" }, 404);
    }

    return c.json({ podcast });
});

app.post("/generate-podcast", async (c) => {
    const user = c.get("user");
    console.log("Generating podcast for user", user.id);
    const podcast = await triggerPodcastGenerationForUser(user, true);

    return c.json({ podcast });
});

export default app;