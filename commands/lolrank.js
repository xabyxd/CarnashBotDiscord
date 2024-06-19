const { SlashCommandBuilder } = require('@discordjs/builders');
const { fetchLolRank } = require('../utils/lolApi');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lolrank')
        .setDescription('Get the rank of a League of Legends player.')
        .addStringOption(option =>
            option.setName('summonertag')
                .setDescription('The summoner name and tag (e.g., xabyxd#6666)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('region')
                .setDescription('The region of the player (e.g., EUW, NA, EUNE, etc.)')
                .setRequired(true)),
    async execute(interaction) {
        const summonertag = interaction.options.getString('summonertag');
        const region = interaction.options.getString('region');
        const [summoner, tag] = summonertag.split('#');

        if (!summoner || !tag) {
            await interaction.reply('Please provide a valid summoner tag in the format `name#tag`.');
            return;
        }

        try {
            const data = await fetchLolRank(summoner, tag, region);

            console.log('API response data:', data); // Debugging line to inspect the response structure

            // Check if the response has the expected structure
            if (data) {
                await interaction.reply({ content: `Summoner: ${summoner}\nTag: ${tag}\nRegion: ${region}\nRank: ${data}`,
                    ephemeral: false
                });
            } else {
                await interaction.reply({ content: 'Could not retrieve rank data for the provided summoner tag.',
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error fetching data from API:', error.message);
            if (error.response && error.response.status === 500) {
                await interaction.reply({ content: 'Internal Server Error: The API server encountered an issue.',
                    ephemeral: true
                });
            } else if (error.response && error.response.status === 404) {
                await interaction.reply({ content: 'Summoner not found. Please check the summoner name and try again.',
                    ephemeral: true
                });
            } else {
                await interaction.reply({ content: 'There was an error fetching the rank data. Please try again later.',
                    ephemeral: true
                });
            }
        }
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
