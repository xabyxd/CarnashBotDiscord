const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('developerbadge')
        .setDescription('Obtiene el badge de desarrollador activo.'),
    async execute(interaction) {
        const badgeUrl = 'https://imgur.com/a/9fP72PN';

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Badge de Desarrollador Activo')
            .setDescription('¡Aquí está tu badge de desarrollador activo!')
            .setImage(badgeUrl);

        await interaction.reply({ embeds: [embed] });
    },
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
