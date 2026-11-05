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
 * carnashgg Team
 * @DEVELOPMENT
 * by carnashgg Development Team
 * @LICENSE
 * Apache License 2.0
 * + @INFO
 * at carnashgg Support
 */
