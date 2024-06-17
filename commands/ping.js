const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows the latency of the bot.'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        await interaction.editReply(`🏓 Pong! Latency is ${latency}ms. API Latency is ${apiLatency}ms.`);
    }
};

/**
 * @OWNED
 * xabyxd Team
 * @DEVELOPMENT
 * by xabyxd Development Team
 * @LICENSE
 * Apache License 2.0
 * + @INFO
 * at xabyxd Support
 */
