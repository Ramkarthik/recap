import { Hono } from "hono";
import { prisma } from "@recap/db";
import { authMiddleware } from "../middleware/auth";
import type { Variables } from "../types";
import { createSpan } from "@recap/shared";

const app = new Hono<{ Variables: Variables }>();

app.use("*", authMiddleware);

// Get user profile
app.get("/", async (c) => {
    const user = c.get("user");
    const logger = c.get("logger");
    const span = createSpan(logger, "get_user_profile", { userId: user.id });
    logger.info({ userId: user.id }, "Fetching user profile");
    try {
        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                feedUrl: true,
                credits: true,
                podcastName: true,
            },
        });
        span.end({ profile });
        return c.json({ user: profile });
    } catch (error) {
        span.error(error as Error);
        throw error;
    }
});

// Update user profile
app.patch("/", async (c) => {
    const user = c.get("user");
    const { name, podcastName } = await c.req.json();

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: { name, podcastName },
    });

    return c.json({ user: updated });
});

app.get("/complete", async (c) => {
    const user = c.get("user");

    const profile = await prisma.user.findUnique({
        where: { id: user.id },
    });

    if (!profile) {
        return c.redirect(process.env.APP_URL + "/login");
    }

    return c.redirect(process.env.APP_URL + "/dashboard");
});

export default app;