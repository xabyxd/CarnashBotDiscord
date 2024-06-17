const axios = require('axios');

const API_BASE_URL = 'https://api.antonyz.tk';
const API_ENDPOINT = '/lol/rank?';

async function fetchLolRank(summoner, tag) {
    const API_URL = `${API_BASE_URL}${API_ENDPOINT}name=${summoner}&tag=${tag}&r=EUW&lang=en`;

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
 * xabyxd Team
 * @DEVELOPMENT
 * by xabyxd Development Team
 * @LICENSE
 * Apache License 2.0
 * + @INFO
 * at xabyxd Support
 */
