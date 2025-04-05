// pandaservice.js
const { pandaAPI } = require('./pandaApiService');

class PandaService {

    static async fetchGameInfo(gameId) {
        const game = await pandaAPI.getGameById(gameId);
        if (!game) {
            console.error(`No game found for id ${gameId}`);
            return null;
        }
        return game;
    }

    static async fetchAllRunningMatches() {
        const runningMatches = await pandaAPI.getRunningMatches();
        if (!runningMatches.length) {
            console.warn(`No running matches currently found.`);
        }
        return runningMatches;
    }

    static async fetchBasicMatchDetails(gameId) {
        const gameDetails = await this.fetchGameInfo(gameId);
        if (!gameDetails) return null;

        return {
            id: gameDetails.id,
            status: gameDetails.status,
            opponents: gameDetails.opponents,
            league: gameDetails.league
        };
    }

    // Add any additional data processing or reformatting methods here as necessary
}

module.exports = { PandaService };