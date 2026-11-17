import { PermissionFlagsBits, type Message } from "discord.js";

export interface PrefixCommand {
    name: string;
    aliases?: string[];
    execute: (message: Message, args: string[]) => Promise<void>;
}

// Optional whitelist: role IDs the "say" command is allowed to mention.
// Leave it empty to allow any valid role of the server.
const SAY_ALLOWED_ROLE_IDS = new Set<string>([
    // "123456789012345678",
    // "987654321098765432",
    "1569636856490885223"
]);

//const SAY_ALLOWED_ROLE_IDS = new Set(
//    (process.env.SAY_ALLOWED_ROLE_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean)
//);

const list: PrefixCommand[] = [
    {
        name: "ping",
        execute: async (message) => {
            await message.reply("Pong!");
        },
    },
    {// move say command to a slash command (makes more sense xd)
        name: "say",
        aliases: ["decir"],
        execute: async (message, args) => {
            if (!message.inGuild()) return;

            if (args.length === 0) {
                await message.reply("Usage: `!say <text>`");
                return;
            }

            const text = args.join(" ");

            if (/@(everyone|here)/i.test(text)) {
                await message.reply("Command `say` can't contain `@everyone` or `@here` mentions");
                return;
            }

            // Role mentions arrive as <@&ID>; every one must be a real role of this server
            const allowedRoles: string[] = [];
            for (const match of text.matchAll(/<@&(\d+)>/g)) {
                const id = match[1];
                if (!id) continue;

                const role = message.guild.roles.cache.get(id);
                if (!role) {
                    await message.reply("That role doesn't exist in this server");
                    return;
                }

                // If a whitelist is configured, the role must be in it
                if (SAY_ALLOWED_ROLE_IDS.size > 0 && !SAY_ALLOWED_ROLE_IDS.has(id)) {
                    await message.reply(`The role **${role.name}** can't be mentioned with this command`);
                    return;
                }

                // Don't let users ping roles through the bot that they couldn't ping themselves
                const canMentionAll = message.member?.permissions.has(PermissionFlagsBits.MentionEveryone) ?? false;
                if (!role.mentionable && !canMentionAll) {
                    await message.reply(`You can't mention the role **${role.name}**`);
                    return;
                }

                allowedRoles.push(id);
            }

            // parse: users can be pinged; only the validated roles above can be pinged
            await message.reply({
                content: text,
                allowedMentions: { parse: ["users"], roles: allowedRoles },
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