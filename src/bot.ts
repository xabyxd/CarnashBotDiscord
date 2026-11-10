import { ActivityType, Client, Events, GatewayIntentBits, MessageFlags, type ActivityOptions } from "discord.js";
import "dotenv/config";
import kleur from "kleur";
import { platform, release } from "os";
import { deployCommands } from "./handlers/DeployCommands.js";
import { loadCommands } from "./handlers/LoadCommands.js";
import { log } from "./utils/logger.js";
import { formatCompactSeconds } from "./utils/time.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const VERSION = process.env.BOT_VERSION ?? "0.0.0";
const BNAME = process.env.BOT_NAME ?? "CarnashBot";
let iteration = 0;

// Future usage of a api endpoint to request a current song in spotify
const activities: ActivityOptions[] = [
    { name: "custom", type: ActivityType.Custom, state: `EXODIA L9 Member V${VERSION}` },
    { name: "EXODIA - perma", type: ActivityType.Listening },
    { name: "eto - holdin' on to your silence", type: ActivityType.Listening }
];

if (!token || !clientId) {
    log.error("Missing DISCORD_TOKEN or DISCORD_CLIENT_ID on the .env file");
    process.exit(1);
}

log.info(`Starting bot ${BNAME}`);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ],
    presence: {
        status: "dnd",
        //activities: [
        //    {
        //        name: "custom",
        //        type: ActivityType.Custom,
        //        state:`EXODIA L9 Member V${VERSION}`
        //    }
        //]
    }
});

const commands = await loadCommands();

try {
    await deployCommands(commands, token, clientId, guildId);
} catch (error) {
    log.error("Deploy failed:", error);
    process.exit(1);
}

function rotateActivity() {
    const activity = activities[iteration];
    if (!activity) return;

    client.user?.setActivity(activity);
    iteration = (iteration + 1) % activities.length;
}

client.once(Events.ClientReady, async (readyClient) => {
    log.ok(`Bot is online as ${kleur.bold(readyClient.user.tag)}\n`);
    log.info(`Bot version ${VERSION}`);
    log.info(`Username: ${readyClient.user.username}`);
    log.info(`ID:       ${readyClient.user.id}`);
    log.info(`Servers:  ${readyClient.guilds.cache.size}\n`);

    client.guilds.cache.forEach((guild) => {
        log.info(`Connected to server: ${guild.name} (ID: ${guild.id})`);
    });

    console.log("");
    log.info("System information");
    log.info(`Node: ${process.version}`);
    log.info(`Platform: ${platform()} ${release()}`);

    // Set the first activity right away, then rotate every 15 seconds
    rotateActivity();
    setInterval(rotateActivity, 15_000);

    try {
        await client.application?.edit({
            description:
                `Bot developed by: xabyxd\n` +
                `still under development, Repository:\n` +
                `github.com/xabyxd/CarnashBotDiscord/`
            }
        );
    } catch (error) {
        log.error("The description could not be updated: ", error);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const where = interaction.guild?.name ?? interaction.guildId ?? "DM";
    log.info(`${kleur.gray(formatCompactSeconds())} ${kleur.bold(interaction.user.username)} (${interaction.user.id}) used ${kleur.cyan(interaction.toString())} in ${where}`);

    const command = commands.get(interaction.commandName);
    if (!command) {
        log.warn(`Unknown command: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        log.error(`Error while running /${interaction.commandName}:`, error);

        const reply = {
            content: "There was an error while executing this command.",
            flags: MessageFlags.Ephemeral,
        } as const;

        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        } catch (replyError) {
            log.error("Could not send the error reply: ", replyError);
        }
    }
});

process.on("unhandledRejection", (reason) => {
    log.error("Unhandled rejection: ", reason);
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    log.error("Uncaught exception: ", error);
    process.exit(1);
});

client.on(Events.Error, (error) => log.error(error));
client.on(Events.Warn, (message) => log.warn(message));

for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, async () => {
        log.info(`${signal} received, closing...`);
        await client.destroy();
        process.exit(0);
    });
}

try {
    await client.login(token);
} catch (error) {
    log.error("Login failed: ", error);
    process.exit(1);
}