import { Collection } from "discord.js";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Command } from "../types/command.js";
import { log } from "../utils/logger.js";

const commandsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../commands");

export async function loadCommands(): Promise<Collection<string, Command>> {
    const commands = new Collection<string, Command>();
    // .js when running in compiled form (dist), .ts if you use tsx/ts-node during development
    const files = (await readdir(commandsDir)).filter(
        (f) => /\.(js|ts)$/.test(f) && !f.endsWith(".d.ts"),
    );

    for (const file of files) {
        const mod = await import(pathToFileURL(path.join(commandsDir, file)).href);
        const command: Command | undefined = mod.default;

        if (!command?.data || typeof command.execute !== "function") {
            log.warn(`Skipping ${file}: missing "data" or "execute"`);
            continue;
        }
        commands.set(command.data.name, command);
    }

    log.info(`Loaded ${commands.size} command(s)`);
    return commands;
}