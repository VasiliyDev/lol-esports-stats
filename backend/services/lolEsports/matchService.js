// services/lolEsports/matchService.js
const models = require('../../models');
const logger = require('../../utils/logger');
const { associateTeamsWithMatch } = require('./teamService');
const {startingDate} = require("../../filters/parsing_restrictions");
const {Op} = require("sequelize");
const {processMatchDetails} = require("./matchDetailService");

/**
 * Process match details for all matches
 * @param {Object} lolEsportsAPI - The LoL Esports API client
 * @returns {Promise<Object>} - Stats about processed match details
 */
const processAllMatchDetails = async (lolEsportsAPI) => {
    const stats = {
        totalMatchesProcessed: 0,
        totalGamesCreated: 0,
        totalGamesUpdated: 0,
        errors: []
    };

    try {
        // Get recent matches that need detailed processing
        // For example, matches created in the last week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const matches = await models.Match.findAll();

        logger.info(`Processing details for ${matches.length} recent matches`);

        // Process each match
        for (const match of matches) {
            try {
                // Fetch match details
                const matchDetails = await lolEsportsAPI.getEventDetails(match.lol_id);

                // Process the match details
                const matchStats = await processMatchDetails(matchDetails);

                // Update stats
                stats.totalMatchesProcessed++;
                stats.totalGamesCreated += matchStats.gamesCreated;
                stats.totalGamesUpdated += matchStats.gamesUpdated;

                // Log progress
                logger.info(`Processed details for match ${match.lol_id}: created ${matchStats.gamesCreated} games, updated ${matchStats.gamesUpdated} games`);

                // Add a small delay to avoid API rate limits
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                logger.error(`Error processing details for match ${match.lol_id}: ${error.message}`);
                stats.errors.push({
                    matchId: match.id,
                    lolMatchId: match.lol_id,
                    error: error.message
                });
            }
        }

        return stats;
    } catch (error) {
        logger.error(`Error processing all match details: ${error.message}`);
        throw error;
    }
};


const processCompletedTournaments = async (tournamentsData, tournamentId) => {
    if (!tournamentsData || !tournamentsData.schedule || !tournamentsData.schedule.events || !tournamentId) {
        throw new Error('Invalid events data format or missing tournamentId');
    }

    const stats = {
        matchesCreated: 0,
        matchesUpdated: 0,
        teamsCreated: 0,
        teamsUpdated: 0,
        teamsAssociated: 0,
        errors: []
    };

    try {
        // Get tournament from database to verify it exists
        const tournament = await models.Tournament.findByPk(tournamentId);
        if (!tournament) {
            throw new Error(`Tournament with ID ${tournamentId} not found`);
        }

        // Process each event (match)
        for (const event of tournamentsData.schedule.events) {
            try {
                if (!event.match || !event.match.id) {
                    logger.warn('Event missing match data', event);
                    continue;
                }

                // Convert dates from string to Date objects
                const startTime = event.startTime ? new Date(event.startTime) : null;

                // Process match data (without team details now)
                const matchData = {
                    lol_id: event.match.id,
                    tournament_id: tournamentId,
                    start_time: startTime,
                    block_name: event.blockName || null,
                    match_type: event.match.type || null,
                    strategy_type: event.match.strategy ? event.match.strategy.type : null,
                    strategy_count: event.match.strategy ? event.match.strategy.count : null
                };

                // Check if match already exists
                let match = await models.Match.findOne({
                    where: { lol_id: event.match.id }
                });

                // Create or update match
                if (!match) {
                    match = await models.Match.create(matchData);
                    stats.matchesCreated++;
                } else {
                    await match.update(matchData);
                    stats.matchesUpdated++;
                }

                // Process teams for this match
                if (event.match.teams && Array.isArray(event.match.teams)) {
                    const teamStats = await associateTeamsWithMatch(event.match, match.id);
                    stats.teamsCreated += teamStats.teamsCreated;
                    stats.teamsUpdated += teamStats.teamsUpdated;
                    stats.teamsAssociated += teamStats.teamsAssociated;
                }

                // Process games for this match
                if (event.games && Array.isArray(event.games)) {
                    await processGamesForMatch(event.games, match.id, stats);
                }
            } catch (error) {
                logger.error(`Error processing match ${event.match?.id}: ${error.message}`);
                stats.errors.push({
                    match: event.match?.id,
                    error: error.message
                });
            }
        }

        return stats;
    } catch (error) {
        logger.error(`Error in bulk event processing: ${error.message}`);
        throw error;
    }
};

// Helper function to process games for a match
const processGamesForMatch = async (games, matchId, stats) => {
    for (let i = 0; i < games.length; i++) {
        const gameData = games[i];
        try {
            if (!gameData.id) {
                logger.warn(`Game missing ID for match ${matchId}`);
                continue;
            }

            // Check if game already exists
            let game = await models.Game.findOne({
                where: { lol_id: gameData.id }
            });

            // Game data to save
            const gameToSave = {
                lol_id: gameData.id,
                match_id: matchId,
                game_number: i + 1 // 1-based index for game number
            };

            // Create or update game
            if (!game) {
                game = await models.Game.create(gameToSave);
                stats.gamesCreated++;
            } else {
                await game.update(gameToSave);
                stats.gamesUpdated++;
            }

            // Process VODs for this game
            if (gameData.vods && Array.isArray(gameData.vods)) {
                await processVODsForGame(gameData.vods, game.id, stats);
            }
        } catch (error) {
            logger.error(`Error processing game ${gameData.id} for match ${matchId}: ${error.message}`);
            stats.errors.push({
                game: gameData.id,
                match: matchId,
                error: error.message
            });
        }
    }
};

// Helper function to process VODs for a game
const processVODsForGame = async (vods, gameId, stats) => {
    // First, delete existing VODs for this game to avoid duplicates
    await models.VOD.destroy({
        where: { game_id: gameId }
    });

    // Then create new VODs
    for (const vod of vods) {
        try {
            if (!vod.parameter) {
                continue; // Skip VODs without parameters
            }

            await models.VOD.create({
                game_id: gameId,
                parameter: vod.parameter
            });

            stats.vodsCreated++;
        } catch (error) {
            logger.error(`Error processing VOD for game ${gameId}: ${error.message}`);
            stats.errors.push({
                gameId,
                error: error.message,
                vodParameter: vod.parameter
            });
        }
    }
};

const processAllTournamentsMatches = async (lolEsportsAPI) => {
    const stats = {
        totalTournaments: 0,
        totalMatchesCreated: 0,
        totalMatchesUpdated: 0,
        totalTeamsCreated: 0,
        totalTeamsUpdated: 0,
        totalTeamsAssociated: 0,
        tournamentsProcessed: [],
        errors: []
    };

    try {
        // Get all tournaments from the database
        const tournaments = await models.Tournament.findAll({
            where: {
                start_date: {
                    [Op.gt]: startingDate
                }
            }
        });
        stats.totalTournaments = tournaments.length;

        // Process each tournament
        for (const tournament of tournaments) {
            try {
                // Fetch completed events for this tournament
                const tournamentsData = await lolEsportsAPI.getCompletedTournaments(tournament.lol_id);

                // Process the events
                const tournamentStats = await processCompletedTournaments(tournamentsData, tournament.id);

                // Update stats
                stats.totalMatchesCreated += tournamentStats.matchesCreated;
                stats.totalMatchesUpdated += tournamentStats.matchesUpdated;
                stats.totalTeamsCreated += tournamentStats.teamsCreated;
                stats.totalTeamsUpdated += tournamentStats.teamsUpdated;
                stats.totalTeamsAssociated += tournamentStats.teamsAssociated;

                stats.tournamentsProcessed.push({
                    tournamentId: tournament.id,
                    tournamentSlug: tournament.slug,
                    matchesCreated: tournamentStats.matchesCreated,
                    matchesUpdated: tournamentStats.matchesUpdated,
                    teamsCreated: tournamentStats.teamsCreated,
                    teamsUpdated: tournamentStats.teamsUpdated,
                    teamsAssociated: tournamentStats.teamsAssociated,
                    errors: tournamentStats.errors
                });

                // Log progress
                logger.info(`Processed events for tournament ${tournament.slug}: created ${tournamentStats.matchesCreated} matches, ${tournamentStats.gamesCreated} games, ${tournamentStats.vodsCreated} VODs`);

                // Short delay to avoid hitting API rate limits
            } catch (error) {
                logger.error(`Error processing events for tournament ${tournament.slug}: ${error.message}`);
                stats.errors.push({
                    tournamentId: tournament.id,
                    tournamentSlug: tournament.slug,
                    error: error.message
                });
            }
        }

        return stats;
    } catch (error) {
        logger.error(`Error in processing all tournaments events: ${error.message}`);
        throw error;
    }
};

module.exports = {
    processCompletedTournaments,
    processAllTournamentsMatches,
    processAllMatchDetails
};
