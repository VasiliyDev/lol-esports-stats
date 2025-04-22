// services/lolEsports/matchService.js
const models = require('../../models');
const logger = require('../../utils/logger');
const {associateTeamsWithMatch} = require('./teamService');
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
        const matches = await models.Match.findAll();
        logger.info(`Processing details for ${matches.length} recent matches`);

        // Process matches in batches to avoid overwhelming the API
        const BATCH_SIZE = 5; // Process 5 matches at a time
        for (let i = 0; i < matches.length; i += BATCH_SIZE) {
            const batch = matches.slice(i, i + BATCH_SIZE);
            const batchPromises = batch.map(async (match) => {
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

                    return matchStats;
                } catch (error) {
                    // Check if it's a rate limit error
                    if (error.message.includes('429') || error.message.includes('rate limit')) {
                        logger.warn(`Rate limit hit for match ${match.lol_id}, waiting before retry...`);
                        // Wait for 5 seconds before retrying
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        try {
                            // Retry once
                            const matchDetails = await lolEsportsAPI.getEventDetails(match.lol_id);
                            const matchStats = await processMatchDetails(matchDetails);
                            stats.totalMatchesProcessed++;
                            stats.totalGamesCreated += matchStats.gamesCreated;
                            stats.totalGamesUpdated += matchStats.gamesUpdated;
                            return matchStats;
                        } catch (retryError) {
                            logger.error(`Error retrying match ${match.lol_id}: ${retryError.message}`);
                        }
                    } else {
                        logger.error(`Error processing details for match ${match.lol_id}: ${error.message}`);
                    }
                    stats.errors.push({
                        matchId: match.id,
                        lolMatchId: match.lol_id,
                        error: error.message
                    });
                    return null;
                }
            });

            // Wait for current batch to complete
            await Promise.all(batchPromises);

            // Add a small delay between batches to avoid rate limits
            if (i + BATCH_SIZE < matches.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
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

        // Process all events in parallel
        const eventPromises = tournamentsData.schedule.events.map(async (event) => {
            try {
                if (!event.match || !event.match.id) {
                    logger.warn('Event missing match data', event);
                    return null;
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
                    where: {lol_id: event.match.id}
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

                return match;
            } catch (error) {
                logger.error(`Error processing match ${event.match?.id}: ${error.message}`);
                stats.errors.push({
                    match: event.match?.id,
                    error: error.message
                });
                return null;
            }
        });

        // Wait for all events to be processed
        await Promise.all(eventPromises);

        return stats;
    } catch (error) {
        logger.error(`Error in bulk event processing: ${error.message}`);
        throw error;
    }
};

// Helper function to process games for a match
const processGamesForMatch = async (games, matchId, stats) => {
    try {
        // Process games in batches to avoid overwhelming the API
        const BATCH_SIZE = 3; // Process 3 games at a time
        for (let i = 0; i < games.length; i += BATCH_SIZE) {

            const batch = games.slice(i, i + BATCH_SIZE);
            const gamePromises = batch.map(async (gameData, index) => {
                try {
                    if (!gameData.id) {
                        logger.warn(`Game missing ID for match ${matchId}`);
                        return null;
                    }

                    // Check if game already exists
                    let game = await models.Game.findOne({
                        where: {lol_id: gameData.id}
                    });

                    // Game data to save
                    const gameToSave = {
                        lol_id: gameData.id,
                        match_id: matchId,
                        game_number: index + 1 // 1-based index for game number
                    };

                    // Create or update game
                    if (!game) {
                        game = await models.Game.create(gameToSave);
                        stats.gamesCreated++;
                    } else {
                        await game.update(gameToSave);
                        stats.gamesUpdated++;
                    }


                    return game;
                } catch (error) {
                    // Check if it's a rate limit error
                    if (error.message.includes('429') || error.message.includes('rate limit')) {
                        logger.warn(`Rate limit hit for game ${gameData.id} in match ${matchId}, waiting before retry...`);
                        // Wait for 5 seconds before retrying
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        try {
                            // Retry once
                            let game = await models.Game.findOne({
                                where: {lol_id: gameData.id}
                            });

                            const gameToSave = {
                                lol_id: gameData.id,
                                match_id: matchId,
                                game_number: index + 1
                            };

                            if (!game) {
                                game = await models.Game.create(gameToSave);
                                stats.gamesCreated++;
                            } else {
                                await game.update(gameToSave);
                                stats.gamesUpdated++;
                            }


                            return game;
                        } catch (retryError) {
                            logger.error(`Error retrying game ${gameData.id} for match ${matchId}: ${retryError.message}`);
                        }
                    } else {
                        logger.error(`Error processing game ${gameData.id} for match ${matchId}: ${error.message}`);
                    }
                    stats.errors.push({
                        game: gameData.id,
                        match: matchId,
                        error: error.message
                    });
                    return null;
                }
            });

            // Wait for current batch to complete
            await Promise.all(gamePromises);

            // Add a small delay between batches to avoid rate limits
            if (i + BATCH_SIZE < games.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    } catch (error) {
        logger.error(`Error processing games for match ${matchId}: ${error.message}`);
        stats.errors.push({
            match: matchId,
            error: error.message
        });
    }
};

// Helper function to process VODs for a game

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

        // Process tournaments in batches to avoid overwhelming the API
        const BATCH_SIZE = 3; // Process 3 tournaments at a time
        for (let i = 0; i < tournaments.length; i += BATCH_SIZE) {
            const batch = tournaments.slice(i, i + BATCH_SIZE);
            const batchPromises = batch.map(async (tournament) => {
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

                    return tournamentStats;
                } catch (error) {
                    // Check if it's a rate limit error
                    if (error.message.includes('429') || error.message.includes('rate limit')) {
                        logger.warn(`Rate limit hit for tournament ${tournament.slug}, waiting before retry...`);
                        // Wait for 5 seconds before retrying
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        try {
                            // Retry once
                            const tournamentsData = await lolEsportsAPI.getCompletedTournaments(tournament.lol_id);
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

                            return tournamentStats;
                        } catch (retryError) {
                            logger.error(`Error retrying tournament ${tournament.slug}: ${retryError.message}`);
                        }
                    } else {
                        logger.error(`Error processing events for tournament ${tournament.slug}: ${error.message}`);
                    }
                    stats.errors.push({
                        tournamentId: tournament.id,
                        tournamentSlug: tournament.slug,
                        error: error.message
                    });
                    return null;
                }
            });

            // Wait for current batch to complete
            await Promise.all(batchPromises);

            // Add a small delay between batches to avoid rate limits
            if (i + BATCH_SIZE < tournaments.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        return stats;
    } catch (error) {
        logger.error(`Error in processing all tournaments events: ${error.message}`);
        throw error;
    }
};

/**
 * Process game windows for completed matches to determine winners
 * @param {Object} lolEsportsAPI - The LoL Esports API client
 * @returns {Promise<Object>} - Stats about processed game windows
 */
const processGameWindowsForCompletedMatches = async (lolEsportsAPI) => {
    const stats = {
        totalGamesProcessed: 0,
        gamesWithWinnerFound: 0,
        gamesUpdated: 0,
        errors: []
    };

    try {
        // Get all completed games that need processing (missing winner or players)
        const games = await models.Game.findAll({
            where: {
                state: 'completed',
                [Op.or]: [
                    {winner_team_id: null},
                    {'$gamePlayers.id$': null}
                ]
            },
            include: [
                {
                    model: models.GamePlayer,
                    as: 'gamePlayers',
                    required: false
                },
                {
                    model: models.Match,
                    required: true
                }
            ]
        });

        logger.info(`Found ${games.length} completed games needing processing`);

        // Process games in batches
        const BATCH_SIZE = 3;
        for (let i = 0; i < games.length; i += BATCH_SIZE) {
            const batch = games.slice(i, i + BATCH_SIZE);
            const batchPromises = batch.map(async (game) => {
                try {
                    // Get game window data with current time as startingTime
                    const currentTime = new Date().toISOString();
                    const gameWindow = await lolEsportsAPI.getWindow(game.lol_id, currentTime);

                    if (!gameWindow || !gameWindow.frames || gameWindow.frames.length === 0) {
                        logger.warn(`No game window data found for game ${game.lol_id}`);
                        return;
                    }

                    // Get the last frame to determine winner
                    const lastFrame = gameWindow.frames[gameWindow.frames.length - 1];

                    // Find the winner team by checking which team has more gold
                    const blueTeamGold = lastFrame.blueTeam?.totalGold || 0;
                    const redTeamGold = lastFrame.redTeam?.totalGold || 0;

                    let winnerTeamId = null;
                    if (blueTeamGold > redTeamGold) {
                        winnerTeamId = game.Match.blue_team_id;
                    } else if (redTeamGold > blueTeamGold) {
                        winnerTeamId = game.Match.red_team_id;
                    }

                    // Prepare update data
                    const updateData = {};
                    if (winnerTeamId) {
                        updateData.winner_team_id = winnerTeamId;
                        stats.gamesWithWinnerFound++;
                        stats.gamesUpdated++;
                        logger.info(`Updated winner for game ${game.lol_id}: team ${winnerTeamId}`);
                    }

                    if (Object.keys(updateData).length > 0) {
                        await game.update(updateData);
                    }

                    stats.totalGamesProcessed++;
                } catch (error) {
                    // Check if it's a rate limit error
                    if (error.message.includes('429') || error.message.includes('rate limit')) {
                        logger.warn(`Rate limit hit for game window ${game.lol_id}, waiting before retry...`);
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        try {
                            // Retry once with current time
                            const currentTime = new Date().toISOString();
                            const gameWindow = await lolEsportsAPI.getWindow(game.lol_id, currentTime);
                            if (gameWindow && gameWindow.frames && gameWindow.frames.length > 0) {
                                const lastFrame = gameWindow.frames[gameWindow.frames.length - 1];
                                const blueTeamGold = lastFrame.blueTeam?.totalGold || 0;
                                const redTeamGold = lastFrame.redTeam?.totalGold || 0;

                                let winnerTeamId = null;
                                if (blueTeamGold > redTeamGold) {
                                    winnerTeamId = game.Match.blue_team_id;
                                } else if (redTeamGold > blueTeamGold) {
                                    winnerTeamId = game.Match.red_team_id;
                                }

                                // Prepare update data for retry
                                const updateData = {};
                                if (winnerTeamId) {
                                    updateData.winner_team_id = winnerTeamId;
                                    stats.gamesWithWinnerFound++;
                                    stats.gamesUpdated++;
                                }

                                if (Object.keys(updateData).length > 0) {
                                    await game.update(updateData);
                                }
                            }
                        } catch (retryError) {
                            logger.error(`Error retrying game window for game ${game.lol_id}: ${retryError.message}`);
                        }
                    } else {
                        logger.error(`Error processing game window for game ${game.lol_id}: ${error.message}`);
                    }
                    stats.errors.push({
                        gameId: game.lol_id,
                        matchId: game.Match.id,
                        error: error.message
                    });
                }
            });

            // Wait for current batch to complete
            await Promise.all(batchPromises);

            // Add a small delay between batches to avoid rate limits
            if (i + BATCH_SIZE < games.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        return stats;
    } catch (error) {
        logger.error(`Error processing game windows for completed matches: ${error.message}`);
        throw error;
    }
};

module.exports = {
    processCompletedTournaments,
    processAllTournamentsMatches,
    processAllMatchDetails,
    processGameWindowsForCompletedMatches
};
