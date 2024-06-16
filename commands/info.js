const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Provides information about the bot.'),
    async execute(interaction) {
        const { client } = interaction;

        // Uptime calculation
        const uptime = process.uptime();
        const days = Math.floor(uptime / (3600 * 24));
        const hours = Math.floor((uptime % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Bot Information')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: 'Bot Name', value: client.user.username, inline: true },
                { name: 'Bot ID', value: client.user.id, inline: true },
                { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
                { name: 'Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: false },
                { name: 'Created At', value: client.user.createdAt.toDateString(), inline: false }
            )
            .setTimestamp();

        await interaction.reply({ 
            embeds: [embed] 
        });
    }
};
