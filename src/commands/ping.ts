import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/command.js";

const command: Command = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Shows the latency of the bot."),
    async execute(interaction) {
        const sent = await interaction.reply({
            content: 'Pinging...',
            withResponse: true
        });
        const message = sent.resource?.message;
        const latency = (message?.createdTimestamp ?? Date.now()) - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        await interaction.editReply(`🏓 Pong! Latency is ${latency}ms. API Latency is ${apiLatency}ms.`);
    },
};

export default command;