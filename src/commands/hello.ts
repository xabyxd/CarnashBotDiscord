import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/command.js";

const command: Command = {
    data: new SlashCommandBuilder()
    .setName("hello")
    .setDescription("Just says hello back."),
    async execute(interaction) {
        await interaction.reply(`Helloooo!!!!`);
    },
};

export default command;