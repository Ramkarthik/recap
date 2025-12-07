import type { User, Session } from "@recap/db";
import type { Logger } from "pino";

export type Variables = {
    user: User;
    session: Session;
    requestId: string;
    logger: Logger;
};