import type { Context, Next } from "hono";
import { createLogger, createSpan } from "@recap/shared";
import { generateId } from "@recap/shared";

const logger = createLogger("api");

export async function loggingMiddleware(c: Context, next: Next) {
    const requestId = c.req.header("X-Request-Id") || generateId("req");
    const { method, url } = c.req;

    const requestLogger = logger.child({ requestId });
    c.set("requestId", requestId);
    c.set("logger", requestLogger);

    const span = createSpan(requestLogger, "http_request", { method, url });

    try {
        await next();
        const status = c.res.status;
        span.end({ status });
    } catch (error) {
        const status = c.res.status || 500;
        span.error(error as Error, { status });
        throw error;
    }
}