import kleur from "kleur";
import { formatCompactSeconds } from "./time.js";

const stamp = () => process.env.NODE_ENV === "production" ? [] : [kleur.gray(formatCompactSeconds())];

export const log = {
    info: (...args: unknown[]) => console.log(...stamp(), kleur.cyan("[INFO] "), ...args),
    ok: (...args: unknown[]) => console.log(...stamp(), kleur.green("[OK] "), ...args),
    warn: (...args: unknown[]) => console.warn(...stamp(), kleur.yellow("[WARN] "), ...args),
    error: (...args: unknown[]) => console.error(...stamp(), kleur.red("[ERROR]"), ...args),
};