import { Hono } from "hono";
import { auth } from "./routes/auth";
import articles from "./routes/articles";
import podcasts from "./routes/podcasts";
import user from "./routes/user";
import feed from "./routes/feed";
import type { Variables } from "./types";
import { loggingMiddleware } from "./middleware/logging";

import { cors } from "hono/cors";

const app = new Hono<{ Variables: Variables }>();

app.use(
    "*",
    cors({
        origin: [process.env.APP_URL!],
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    })
);

app.use("*", loggingMiddleware);

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));
app.route("/api/articles", articles);
app.route("/api/podcasts", podcasts);
app.route("/api/user", user);
app.route("/feed", feed);

export default app;