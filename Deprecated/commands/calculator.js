const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calculator')
        .setDescription('Performs basic arithmetic operations.')
        .addIntegerOption(option =>
            option.setName('first')
                .setDescription('First number')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('second')
                .setDescription('Second number')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('operation')
                .setDescription('Arithmetic operation to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'Add', value: 'add' },
                    { name: 'Subtract', value: 'subtract' },
                    { name: 'Multiply', value: 'multiply' },
                    { name: 'Divide', value: 'divide' }
                )),
    async execute(interaction) {
        const firstNumber = interaction.options.getInteger('first');
        const secondNumber = interaction.options.getInteger('second');
        const operation = interaction.options.getString('operation');
        let result;

        switch (operation) {
            case 'add':
                result = firstNumber + secondNumber;
                break;
            case 'subtract':
                result = firstNumber - secondNumber;
                break;
            case 'multiply':
                result = firstNumber * secondNumber;
                break;
            case 'divide':
                if (secondNumber === 0) {
                    await interaction.reply('Error: Division by zero is not allowed.');
                    return;
                }
                result = firstNumber / secondNumber;
                break;
            default:
                await interaction.reply('Unknown operation.');
                return;
        }

        await interaction.reply(`The result of ${operation}ing ${firstNumber} and ${secondNumber} is ${result}.`);
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
