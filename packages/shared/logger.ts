import pino from "pino";

export const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    transport: process.env.NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "HH:MM:ss",
                ignore: "pid,hostname",
            },
        }
        : undefined,
});

export function createLogger(name: string) {
    return logger.child({ service: name });
}

export function createSpan(logger: pino.Logger, name: string, context?: Record<string, any>) {
    const start = Date.now();
    const spanLogger = context ? logger.child(context) : logger;

    spanLogger.info({ span: name }, `${name} started`);

    return {
        end: (additionalContext?: Record<string, any>) => {
            const duration = Date.now() - start;
            spanLogger.info(
                { span: name, duration, ...additionalContext },
                `${name} completed`
            );
        },
        error: (error: Error, additionalContext?: Record<string, any>) => {
            const duration = Date.now() - start;
            spanLogger.error(
                { span: name, duration, error, ...additionalContext },
                `${name} failed`
            );
        },
    };
}