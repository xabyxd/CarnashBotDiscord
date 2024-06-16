const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lolrank')
        .setDescription('Get the rank of a League of Legends player.')
        .addStringOption(option => 
            option.setName('summonertag')
                .setDescription('The summoner name and tag (e.g., xabyxd#6666)')
                .setRequired(true)),
    async execute(interaction) {
        const summonertag = interaction.options.getString('summonertag');
        const [API_summoner, API_tag] = summonertag.split('#');
        const API_region = 'EUW'; // or make it an option if you want to support multiple regions
        const API_lang = 'en';

        const API_BASE_URL = 'https://api.antonyz.tk';
        const API_ENDPOINT = '/lol/rank?';
        const API_URL = `${API_BASE_URL}${API_ENDPOINT}name=${API_summoner}&tag=${API_tag}&r=${API_region}&lang=${API_lang}`;

        try {
            const response = await axios.get(API_URL);
            const data = response.data;

            if (!data || !data.rank) {
                await interaction.reply('Could not retrieve rank data for the provided summoner tag.');
                return;
            }

            const rank = data.rank;
            await interaction.reply(`Summoner: ${API_summoner}\nRank: ${rank}`);
        } catch (error) {
            console.error(error);
            await interaction.reply('There was an error fetching the rank data.');
        }
    }
};
