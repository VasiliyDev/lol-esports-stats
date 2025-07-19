const models = require('../../models');
const logger = require('../../utils/logger');
const { findOrCreateTeam } = require('./teamService');

/**
 * Process match details from the LoL Esports API
 * @param {Object} matchDetails - The match details from getEventsDetails API
 * @returns {Promise<Object>} - Stats about processed data
 */
const processVODsForGame = async (vods, gameId, stats) => {
    // First, delete existing VODs for this game to avoid duplicates
    await models.VOD.destroy({
        where: {game_id: gameId}
    });

    // Process VODs sequentially
    for (const vod of vods) {
        try {
            if (!vod.parameter) {
                continue; // Skip VODs without parameters
            }
            console.log(vod,'VOOD')

            const newVod = await models.VOD.create({
                game_id: gameId,
                parameter: vod.parameter,
                ...(vod.provider ? {provider: vod.provider} : {})
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

    console.log(`Processed ${vods.length} VODs for game ${gameId}`);
};
const processMatchDetails = async (matchDetails) => {
    console.log(matchDetails);
    if (!matchDetails || !matchDetails|| !matchDetails.event) {
        throw new Error('Invalid match details data format');
    }

    const stats = {
        matchUpdated: false,
        gamesCreated: 0,
        gamesUpdated: 0,
        errors: []
    };

    try {
        const eventData = matchDetails.event;

        // 1. Find match in database
        let match = await models.Match.findOne({
            where: { lol_id: eventData.id }
        });

        if (!match) {
            logger.warn(`Match with lol_id ${eventData.id} not found, can't update details`);
            return stats;
        }


        // 3. Process games
        if (eventData.match?.games && Array.isArray(eventData.match.games)) {
            for (const gameData of eventData.match.games) {
                try {
                    if (!gameData.id) {
                        logger.warn(`Game missing ID for match ${eventData.id}`);
                        continue;
                    }

                    // Find team sides for this game
                    let blueSideTeamId = null;
                    let redSideTeamId = null;

                    if (gameData.teams && gameData.teams.length >= 2) {
                        for (const gameTeam of gameData.teams) {
                            // Find the team in our database
                            const teamFromApi = eventData.match.teams.find(t => t.id === gameTeam.id);
                            if (teamFromApi) {
                                const dbTeam = await models.Team.findOne({
                                    where: { code: teamFromApi.code }
                                });

                                if (dbTeam) {
                                    if (gameTeam.side === 'blue') {
                                        blueSideTeamId = dbTeam.id;
                                    } else if (gameTeam.side === 'red') {
                                        redSideTeamId = dbTeam.id;
                                    }
                                }
                            }
                        }
                    }

                    // Prepare game data
                    const gameToSave = {
                        lol_id: gameData.id,
                        match_id: match.id,
                        game_number: gameData.number || 1,
                        state: gameData.state || 'unknown',
                        blue_team_id: blueSideTeamId,
                        red_team_id: redSideTeamId
                    };

                    // Find or create game
                    let game = await models.Game.findOne({
                        where: { lol_id: gameData.id }
                    });

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
                    logger.error(`Error processing game ${gameData.id} for match ${eventData.id}: ${error.message}`);
                    stats.errors.push({
                        type: 'game',
                        gameId: gameData.id,
                        error: error.message
                    });
                }
            }
        }

        return stats;
    } catch (error) {
        logger.error(`Error in match details processing: ${error.message}`);
        throw error;
    }
};

module.exports = {
    processMatchDetails
};
