import type { Message } from "discord.js";

export interface PrefixCommand {
    name: string;
    aliases?: string[];
    execute: (message: Message, args: string[]) => Promise<void>;
}

const list: PrefixCommand[] = [
    {
        name: "ping",
        execute: async (message) => {
            await message.reply("Pong!");
        },
    },
    {
        name: "say",
        aliases: ["decir"],
        execute: async (message, args) => {
            if (args.length === 0) {
                await message.reply("Usage: `!say <text>`");
                return;
            }
            // parse: [] prevents the bot from pinging @everyone or roles
            await message.reply({
                content: args.join(" "),
                allowedMentions: { parse: [] },
            });
        },
    },
];

export function loadPrefixCommands(): Map<string, PrefixCommand> {
    const map = new Map<string, PrefixCommand>();
    for (const command of list) {
        map.set(command.name, command);
        for (const alias of command.aliases ?? []) map.set(alias, command);
    }
    return map;
}