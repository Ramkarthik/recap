import { Hono } from "hono";
import { generatePodcast } from "./podcast";
import { generateId } from "@recap/shared";
import { parseArticle } from "./article";

const app = new Hono();

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
    const authHeader = c.req.header("Authorization");
    const apiKey = process.env.API_KEY;

    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    await next();
};

app.use("/generate-podcast", authMiddleware);
app.use("/parse-article", authMiddleware);

app.post("/generate-podcast", async (c) => {
    const payload = await c.req.json();
    const requestId = c.req.header("X-Request-Id") || generateId("req");
    const idempotencyKey = c.req.header("X-Idempotency-Key") || generateId("idm");

    // Process async
    generatePodcast(payload, requestId, idempotencyKey).catch((error: any) => {
        console.error("Podcast generation failed:", error);
    });

    return c.json({ status: "processing" });
});

app.post("/parse-article", async (c) => {
    const payload = await c.req.json();
    const requestId = c.req.header("X-Request-Id") || generateId("req");
    const idempotencyKey = c.req.header("X-Idempotency-Key") || generateId("idm");

    // Process async
    await parseArticle(payload, requestId, idempotencyKey).catch((error: any) => {
        console.error("Article parsing failed:", error);
    });

    return c.json({ status: "processing" });
});

app.get("/health", (c) => c.json({ status: "ok" }));

export default {
    port: process.env.PORT || 3000,
    fetch: app.fetch,
};