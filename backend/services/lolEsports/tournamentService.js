// services/lolEsports/tournamentService.js
const models = require('../../models');
const logger = require('../../utils/logger');
const {allowedLeagues} = require("../../filters/parsing_restrictions");
const {Op} = require("sequelize");

/**
 * Process tournaments data for a league
 * @param {Object} tournamentsData - The tournaments data from Riot API
 * @param {Number} leagueId - The database ID of the league these tournaments belong to
 * @returns {Promise<Object>} - Stats about processed tournaments
 */
const processTournamentsForLeague = async (tournamentsData, leagueId) => {
    if (!tournamentsData || !tournamentsData.leagues || !Array.isArray(tournamentsData.leagues) || !leagueId) {
        throw new Error('Invalid tournaments data format or missing leagueId');
    }

    const stats = {
        tournamentsCreated: 0,
        tournamentsUpdated: 0,
        tournamentsSkipped: 0,
        errors: []
    };

    try {
        // Process each league's tournaments
        for (const leagueData of tournamentsData.leagues) {
            if (!leagueData.tournaments || !Array.isArray(leagueData.tournaments)) {
                logger.warn('League data missing tournaments array');
                continue;
            }

            // Process each tournament
            for (const tournamentData of leagueData.tournaments) {
                try {
                    if (!tournamentData.id || !tournamentData.slug) {
                        logger.warn('Tournament missing required fields', tournamentData);
                        continue;
                    }

                    // Convert dates from string to Date objects
                    const startDate = tournamentData.startDate ? new Date(tournamentData.startDate) : null;
                    const endDate = tournamentData.endDate ? new Date(tournamentData.endDate) : null;

                    // Check if tournament already exists
                    const existingTournament = await models.Tournament.findOne({
                        where: { lol_id: tournamentData.id }
                    });

                    if (!existingTournament) {
                        // Create new tournament
                        await models.Tournament.create({
                            lol_id: tournamentData.id,
                            slug: tournamentData.slug,
                            start_date: startDate,
                            end_date: endDate,
                            league: leagueId
                        });
                        stats.tournamentsCreated++;
                    } else {
                        // Update existing tournament
                        await existingTournament.update({
                            slug: tournamentData.slug,
                            start_date: startDate,
                            end_date: endDate,
                            league: leagueId
                        });
                        stats.tournamentsUpdated++;
                    }
                } catch (error) {
                    logger.error(`Error processing tournament ${tournamentData.slug}: ${error.message}`);
                    stats.errors.push({
                        tournament: tournamentData.slug,
                        error: error.message
                    });
                }
            }
        }

        return stats;
    } catch (error) {
        logger.error(`Error in bulk tournament processing: ${error.message}`);
        throw error;
    }
};

/**
 * Fetch and process tournaments for all leagues in the database
 * @param {Object} lolEsportsAPI - The LoL Esports API client
 * @returns {Promise<Object>} - Stats about processed tournaments for all leagues
 */
const processAllLeaguesTournaments = async (lolEsportsAPI) => {
    const stats = {
        totalLeagues: 0,
        totalTournamentsCreated: 0,
        totalTournamentsUpdated: 0,
        leaguesProcessed: [],
        errors: []
    };

    try {
        // Get all leagues from the database
        const leagues = await models.League.findAll({
            where: {
                slug: {
                    [Op.in]: allowedLeagues
                }
            }
        });
        stats.totalLeagues = leagues.length;

        // Process each league
        for (const league of leagues) {
            try {
                // Fetch tournaments for this league
                const tournamentsData = await lolEsportsAPI.getTournamentsForLeague(league.lol_id);

                // Process the tournaments
                const leagueStats = await processTournamentsForLeague(tournamentsData, league.id);

                // Update stats
                stats.totalTournamentsCreated += leagueStats.tournamentsCreated;
                stats.totalTournamentsUpdated += leagueStats.tournamentsUpdated;
                stats.leaguesProcessed.push({
                    leagueId: league.id,
                    leagueName: league.name,
                    tournamentsCreated: leagueStats.tournamentsCreated,
                    tournamentsUpdated: leagueStats.tournamentsUpdated,
                    errors: leagueStats.errors
                });

                // Log progress
                logger.info(`Processed tournaments for league ${league.name} (${league.id}): created ${leagueStats.tournamentsCreated}, updated ${leagueStats.tournamentsUpdated}`);

                // Short delay to avoid hitting API rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                logger.error(`Error processing tournaments for league ${league.name} (${league.id}): ${error.message}`);
                stats.errors.push({
                    leagueId: league.id,
                    leagueName: league.name,
                    error: error.message
                });
            }
        }

        return stats;
    } catch (error) {
        logger.error(`Error in processing all leagues tournaments: ${error.message}`);
        throw error;
    }
};

module.exports = {
    processTournamentsForLeague,
    processAllLeaguesTournaments
};
