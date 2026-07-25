// controllers/esportsController.js
const models = require('../models');
const logger = require('../utils/logger');
const { lolEsportsAPI } = require("../services/game-data/lolEsportsApiService")
const { processLeaguesData, dropRegions } = require("../services/game-data/leagueService");
const { processAllLeaguesTournaments } = require("../services/game-data/tournamentService");
const {processAllTournamentsEvents, processAllTournamentsMatches, processAllMatchDetails} = require("../services/game-data/matchService");
const {processAllGamesWindows} = require("../services/game-data/gameWindowService");
const {createFramesForAllDatedGames} = require("../services/game-data/gameFramesService");

/**
 * Reset database tables for regions
 */
const resetRegions = async (req, res) => {
    try {
        await dropRegions();

        return res.json({
            status: 'success',
            message: 'Successfully reset regions tables'
        });
    } catch (error) {
        logger.error(`Error resetting tables: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to reset tables',
            error: error.message
        });
    }
};

/**
 * Parse all data - full process
 * 1. Fetch and process leagues
 * 2. Fetch and process tournaments for each league
 */
const startParsing = async (req, res) => {
    try {
        // Step 1: Fetch and process leagues
        logger.info('Starting the parsing process - fetching leagues');
        const leaguesData = await lolEsportsAPI.getLeagues();
        const leagueStats = await processLeaguesData(leaguesData);

        // Step 2: Fetch and process tournaments for each league
        logger.info('Processing tournaments for all leagues');
        const tournamentStats = await processAllLeaguesTournaments(lolEsportsAPI);

        // Step 3: Fetch and process matches and games for each tournament
        logger.info('Processing matches and games for all tournaments');
        const matchStats = await processAllTournamentsMatches(lolEsportsAPI);

        // Step 4: Fetch and process detailed match information
        logger.info('Processing detailed match information');
        const matchDetailsStats = await processAllMatchDetails(lolEsportsAPI);

        // Step 5: Fetch and process game window data
        logger.info('Processing game window data');
        const gameWindowStats = await processAllGamesWindows(lolEsportsAPI);

        // Step 6: Fetch all datas

        const gameFramesStats = await createFramesForAllDatedGames()

        // Return combined stats
        return res.json({
            status: 'success',
            message: 'Data parsing completed successfully',
            stats: {
                leagues: leagueStats,
                tournaments: tournamentStats,
                matches: matchStats,
                matchDetails: matchDetailsStats,
                gameWindows: gameWindowStats,
                frameStats: gameFramesStats
            }
        });
    } catch (error) {
        logger.error(`Error in parsing process: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to complete parsing process',
            error: error.message
        });
    }
};
/**
 * Parse just tournaments, skipping leagues processing
 */
const parseTournaments = async (req, res) => {
    try {
        logger.info('Processing tournaments for all leagues');
        const tournamentStats = await processAllLeaguesTournaments(lolEsportsAPI);

        return res.json({
            status: 'success',
            message: 'Tournament parsing completed successfully',
            stats: tournamentStats
        });
    } catch (error) {
        logger.error(`Error parsing tournaments: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to parse tournaments',
            error: error.message
        });
    }
};

module.exports = {
    resetRegions,
    startParsing,
    parseTournaments
};
