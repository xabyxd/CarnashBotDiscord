import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/command.js";
import { fetchLolRank, LolApiError } from "../utils/lolApi.js";

const TIER_COLORS: Record<string, number> = {
    UNRANKED: 0x4b4b4b,
    IRON: 0x51484a,
    BRONZE: 0x8c513a,
    SILVER: 0x80989d,
    GOLD: 0xcd8837,
    PLATINUM: 0x4e9996,
    EMERALD: 0x2da05e,
    DIAMOND: 0x576bce,
    MASTER: 0x9d48e0,
    GRANDMASTER: 0xc44444,
    CHALLENGER: 0xf4c874
};

// Master+ tiers have no division
const NO_DIVISION_TIERS = ["MASTER", "GRANDMASTER", "CHALLENGER"];

const RANK_IMAGE_BASE_URL = "https://xabyserver.ddns.net/carnashbot/static";

const rankImageUrl = (tier: string) => `${RANK_IMAGE_BASE_URL}/${tier.toLowerCase()}.webp`;

const WINRATE_BAR_SIZE = 20;

function winrateBar(wins: number, losses: number): string {
    const total = wins + losses;
    if (total === 0) return "░".repeat(WINRATE_BAR_SIZE);
    const filled = Math.round((wins / total) * WINRATE_BAR_SIZE);
    return "█".repeat(filled) + "░".repeat(WINRATE_BAR_SIZE - filled);
}

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("lolrank")
        .setDescription("Get the rank of a League of Legends player.")
        .addStringOption((option) =>
            option
                .setName("summonertag")
                .setDescription("The summoner name and tag (e.g., xabyxd#6X6)")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("region")
                .setDescription("The region of the player")
                .setRequired(true)
                .addChoices(
                    { name: "EUW", value: "EUW" },
                    { name: "EUNE", value: "EUNE" },
                    { name: "NA", value: "NA" },
                    { name: "KR", value: "KR" },
                    { name: "BR", value: "BR" },
                    { name: "LAN", value: "LAN" },
                    { name: "LAS", value: "LAS" },
                    { name: "OCE", value: "OCE" },
                    { name: "TR", value: "TR" },
                    { name: "RU", value: "RU" },
                    { name: "JP", value: "JP" }
                )
        ),
    async execute(interaction) {
        const summonerTag = interaction.options.getString("summonertag", true).trim();
        const region = interaction.options.getString("region", true);

        const separator = summonerTag.lastIndexOf("#");
        const summoner = summonerTag.slice(0, separator).trim();
        const tag = summonerTag.slice(separator + 1).trim();

        if (separator === -1 || !summoner || !tag) {
            await interaction.reply({
                content: "Please provide a valid summoner tag in the format `name#tag`.",
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // The API can take more than 3 seconds to respond
        await interaction.deferReply();

        // Errors are sent as ephemeral messages, so the public "thinking" reply is removed first
        const replyError = async (content: string) => {
            await interaction.deleteReply();
            await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
        };

        try {
            const data = await fetchLolRank(summoner, tag, region);

            if (!data || !data.tier) {
                await replyError("Could not retrieve rank data for the provided summoner tag.");
                return;
            }

            const tier = data.tier.toUpperCase();
            const displayName = data.summoner ?? `${summoner}#${tag}`;

            // Unranked player: no LP, wins or losses to show
            if (tier === "UNRANKED") {
                const unrankedEmbed = new EmbedBuilder()
                    .setColor(TIER_COLORS.UNRANKED ?? 0x4b4b4b)
                    .setTitle(displayName)
                    .setDescription("**Unranked**\nThis player has no Solo/Duo rank yet.")
                    .setThumbnail(rankImageUrl(tier))
                    .addFields({ name: "Region", value: data.region ?? region, inline: true })
                    .setFooter({ text: "Ranked Solo/Duo" })
                    .setTimestamp();

                await interaction.editReply({ embeds: [unrankedEmbed] });
                return;
            }

            const division = NO_DIVISION_TIERS.includes(tier) ? "" : ` ${data.rank ?? ""}`;
            const tierName = tier.charAt(0) + tier.slice(1).toLowerCase();

            const wins = data.wins ?? 0;
            const losses = data.losses ?? 0;

            const embed = new EmbedBuilder()
                .setColor(TIER_COLORS[tier] ?? 0x0099ff)
                .setTitle(displayName)
                .setDescription(`**${tierName}${division}** - ${data.lp ?? 0} LP`)
                .setThumbnail(rankImageUrl(tier))
                .addFields(
                    { name: "Region", value: data.region ?? region, inline: true },
                    { name: "Wins", value: `${wins}`, inline: true },
                    { name: "Losses", value: `${losses}`, inline: true },
                    { name: "Winrate", value: data.winrate ?? "N/A", inline: true },
                    { name: "Games", value: `${wins + losses}`, inline: true },
                    { name: "\u200b", value: `\`${winrateBar(wins, losses)}\` ${data.winrate ?? ""}`, inline: false }
                )
                .setFooter({ text: "Ranked Solo/Duo" })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("Error fetching data from API:", error);

            const status = error instanceof LolApiError ? error.status : undefined;

            if (status === 404) {
                await replyError("Summoner not found. Please check the summoner name and try again.");
            } else if (status === 500) {
                await replyError("Internal Server Error: The API server encountered an issue.");
            } else {
                await replyError("There was an error fetching the rank data. Please try again later.");
            }
        }
    }
};

export default command;