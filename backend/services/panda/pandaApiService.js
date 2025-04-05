// pandaApiService.js
const API_KEY = 'YOUR_PANDA_API_KEY';
const BASE_URL = 'https://api.pandascore.co';

class PandaAPI {

    constructor(apiKey) {
        this.apiKey = apiKey || API_KEY;
    }

    async getGameById(gameId) {
        const response = await fetch(`${BASE_URL}/lol/games/${gameId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch game ${gameId}:`, response.statusText);
            return null;
        }

        return await response.json();
    }

    async getRunningMatches() {
        const response = await fetch(`${BASE_URL}/matches/running?filter[videogame]=league-of-legends`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch running matches:`, response.statusText);
            return [];
        }

        return await response.json();
    }

    // You can add more specific endpoints here as needed
}

// Singleton instance
const pandaAPI = new PandaAPI();

module.exports = { pandaAPI };