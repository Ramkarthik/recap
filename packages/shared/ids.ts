
import { customAlphabet } from "nanoid";

export function generateId(prefix: string, length: number = 12) {
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    const nanoid = customAlphabet(alphabet, length);
    return `${prefix}_${nanoid()}`;
}