const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adds two numbers.')
        .addIntegerOption(option => 
            option.setName('first')
                .setDescription('First number')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('second')
                .setDescription('Second number')
                .setRequired(true)),
    async execute(interaction) {
        const firstNumber = interaction.options.getInteger('first');
        const secondNumber = interaction.options.getInteger('second');
        const sum = firstNumber + secondNumber;
        
        await interaction.reply(`The sum of ${firstNumber} and ${secondNumber} is ${sum}.`);
    }
};
