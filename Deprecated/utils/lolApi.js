const axios = require('axios');

const API_BASE_URL = 'https://api.antonyz.tk';
const API_ENDPOINT = '/lol/rank?';

async function fetchLolRank(summoner, tag, region) {
    const API_URL = `${API_BASE_URL}${API_ENDPOINT}name=${summoner}&tag=${tag}&r=${region}&lang=en`;

    try {
        const response = await axios.get(API_URL);
        return response.data; // Devuelve directamente los datos de la API
    } catch (error) {
        console.error('Error fetching data from API:', error.message);
        throw error;
    }
}

module.exports = {
    fetchLolRank
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
