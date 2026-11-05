import { REST, Routes, type Collection } from "discord.js";
import type { Command } from "../types/command.js";
import { log } from "../utils/logger.js";

export async function deployCommands(
    commands: Collection<string, Command>,
    token: string,
    clientId: string,
    guildId?: string,
): Promise<void> {
    const rest = new REST({ version: "10" }).setToken(token);
    const body = commands.map((c) => c.data.toJSON());

    // With guildId, it updates instantly (ideal for development); without it, it’s global.
    const route = guildId
        ? Routes.applicationGuildCommands(clientId, guildId)
        : Routes.applicationCommands(clientId);

    log.info(`Registering ${body.length} command(s) ${guildId ? `in guild ${guildId}` : "globally"}...`);
    await rest.put(route, { body });
    log.ok("Commands registered");
}