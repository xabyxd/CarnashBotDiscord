const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Replies with Hello!'),
    async execute(interaction) {
        await interaction.reply('Hello!');
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
