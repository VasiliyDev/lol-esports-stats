// services/gameFramesService.js

const { lolEsportsAPI } = require('./lolEsportsApiService');
const models = require('../../models');
const logger = require('../../utils/logger');
const { Op } = require('sequelize');

/**
 * Helper function to detect objective changes between frames
 * @param {Object} currentFrame - The current frame data
 * @param {Object} lastSavedFrame - The last saved frame data from the database
 * @param {String} team - 'blueTeam' or 'redTeam'
 * @returns {Array} Array of event objects
 */
const detectObjectiveChanges = (currentFrame, lastSavedFrame, team) => {
    const events = [];
    const teamSide = team === 'blueTeam' ? 'blue' : 'red';

    // If no last saved frame, we can't detect changes
    if (!lastSavedFrame) {
        return events;
    }

    // Check inhibitor changes
    const inhibitorDiff = currentFrame[team].inhibitors - lastSavedFrame[team].inhibitors;
    if (inhibitorDiff !== 0) {
        events.push({
            team_side: teamSide,
            event_type: 'inhibitor',
            change_value: inhibitorDiff > 0 ? 1 : -1
        });
    }

    // Check tower changes
    const towerDiff = currentFrame[team].towers - lastSavedFrame[team].towers;
    if (towerDiff !== 0) {
        events.push({
            team_side: teamSide,
            event_type: 'tower',
            change_value: towerDiff > 0 ? 1 : -1
        });
    }

    // Check baron changes
    const baronDiff = currentFrame[team].barons - lastSavedFrame[team].barons;
    if (baronDiff !== 0) {
        events.push({
            team_side: teamSide,
            event_type: 'baron',
            change_value: baronDiff > 0 ? 1 : -1
        });
    }

    // Check dragon changes
    const currentDragons = currentFrame[team].dragons || [];
    const lastDragons = lastSavedFrame[team].dragons || [];

    if (currentDragons.length > lastDragons.length) {
        // New dragon(s) acquired
        for (let i = lastDragons.length; i < currentDragons.length; i++) {
            const dragonType = currentDragons[i];
            events.push({
                team_side: teamSide,
                event_type: 'dragon',
                change_value: 1,
                dragon_type: dragonType
            });
        }
    }

    return events;
};

const createFramesForGame = async (gameId, force = false) => {
    const game = await models.Game.findOne({
        where: { lol_id: gameId },
        include: [{ model: models.GamePlayer, as: 'gamePlayers' }]
    });

    if (!game) {
        const error = new Error('Game not found in database');
        error.statusCode = 404;
        throw error;
    }

    const participantMap = {};
    game.gamePlayers.forEach(gp => {
        participantMap[gp.participant_id] = {
            player_id: gp.player_id,
            champion_id: gp.champion_id
        };
    });

    const existingFramesCount = await models.Frame.count({
        where: { game_id: game.id }
    });

    if (existingFramesCount > 0) {
        if (!force) {
            logger.info(`Game ${gameId} already parsed, skipping as force=false.`);
            return;
        }

        logger.info(`Force=true. Removing previous data for game ${gameId}.`);

        // Just delete frames - FrameEvent and FrameChampionPlayerGold will be cascade deleted
        await models.Frame.destroy({
            where: { game_id: game.id }
        });
    }

    let originalDate = new Date(game.game_start_date);
    originalDate.setSeconds(Math.floor(originalDate.getSeconds() / 10) * 10, 0);
    let currentTimestamp = originalDate.toISOString();

    const maxAttempts = 5;
    let attempts = 0, previousTimestamp = '';
    let gameFinishedTimestamp = null;
    let lastSavedFrameData = null;

    while (attempts < maxAttempts) {
        let windowData;
        let lastFrame;
        try {
            windowData = await lolEsportsAPI.getWindow(game.lol_id, currentTimestamp);

            if (!windowData || !windowData.frames || windowData.frames.length === 0) {
                logger.warn(`No frame data found at timestamp ${currentTimestamp}. Exiting loop.`);
                break;
            }

            lastFrame = windowData.frames[windowData.frames.length - 1];
            const frameTimestamp = new Date(lastFrame.rfc460Timestamp);

            const existingFrame = await models.Frame.findOne({
                where: {
                    game_id: game.id,
                    timestamp: {
                        [Op.between]: [
                            new Date(frameTimestamp.getTime() - 5000),
                            new Date(frameTimestamp.getTime() + 5000)
                        ]
                    }
                }
            });

            if (existingFrame) {
                logger.info(`Existing frame detected near ${frameTimestamp.toISOString()}, creation skipped.`);
            } else {
                // Create frame
                const frameCreated = await models.Frame.create({
                    game_id: game.id,
                    timestamp: frameTimestamp
                });

                // Process gold data
                const participantsGoldData = [];
                ['blueTeam', 'redTeam'].forEach(team => {
                    lastFrame[team].participants.forEach(participant => {
                        const mapped = participantMap[participant.participantId];
                        if (mapped) {
                            participantsGoldData.push({
                                frame_id: frameCreated.id,
                                position_number: participant.participantId,
                                gold_amount: participant.totalGold,
                                champion_id: mapped.champion_id,
                                player_id: mapped.player_id
                            });
                        } else {
                            logger.warn(`Participant id ${participant.participantId} not found in mappings.`);
                        }
                    });
                });

                if (participantsGoldData.length > 0) {
                    await models.FrameChampionPlayerGold.bulkCreate(participantsGoldData);
                }

                // Process objective changes
                if (lastSavedFrameData) {
                    // Detect changes for both teams
                    const blueTeamEvents = detectObjectiveChanges(lastFrame, lastSavedFrameData, 'blueTeam');
                    const redTeamEvents = detectObjectiveChanges(lastFrame, lastSavedFrameData, 'redTeam');

                    // Combine events and add frame_id
                    const allEvents = [...blueTeamEvents, ...redTeamEvents].map(event => ({
                        ...event,
                        frame_id: frameCreated.id
                    }));

                    // Save events to database if any exist
                    if (allEvents.length > 0) {
                        await models.FrameEvent.bulkCreate(allEvents);
                        logger.info(`Created ${allEvents.length} frame events for frame ${frameCreated.id}`);
                    }
                }

                // Update the last saved frame data for next comparison
                lastSavedFrameData = lastFrame;
            }

            if (lastFrame.gameState === 'finished') {
                gameFinishedTimestamp = frameTimestamp;
                logger.info(`Game finish detected at timestamp ${currentTimestamp}.`);
                break;
            }

            previousTimestamp = currentTimestamp;
            currentTimestamp = new Date(new Date(currentTimestamp).getTime() + 10000).toISOString();
            attempts = 0;

        } catch (err) {
            attempts++;
            logger.warn(`Attempt ${attempts}/${maxAttempts} failed at timestamp ${currentTimestamp}: ${err.message}`);

            if (attempts >= maxAttempts) {
                const timeoutError = new Error('Failed reaching API within max attempts.');
                timeoutError.statusCode = 408;
                throw timeoutError;
            }

            currentTimestamp = new Date(new Date(currentTimestamp).getTime() + 10000).toISOString();
        }
    }

    if (gameFinishedTimestamp) {
        game.game_finish_date = gameFinishedTimestamp;
        await game.save();
        logger.info(`Updated game ${gameId}'s finish timestamp.`);
    } else {
        logger.warn(`Game ${gameId} finish timestamp not found.`);
    }

    return {
        finishedFrameTimestamp: gameFinishedTimestamp ? gameFinishedTimestamp.toISOString() : null,
        previousFrameTimestamp: previousTimestamp
    };
};

const createFramesForAllDatedGames = async (force = false) => {
    try {
        const gamesWithStartDate = await models.Game.findAll({
            where: {
                game_start_date: {
                    [Op.ne]: null
                }
            }
        });

        logger.info(`Retrieved ${gamesWithStartDate.length} games with a valid start date.`);

        for (const game of gamesWithStartDate) {
            try {
                await createFramesForGame(game.lol_id, force);
                logger.info(`Frames created for game ${game.lol_id}.`);
            } catch (innerError) {
                logger.error(`Error creating frames for game ${game.lol_id}:`, innerError);
            }
        }

        logger.info('Frames created for all games with start dates successfully.');
    } catch (error) {
        logger.error("Error while creating frames for dated games:", error);
        throw error;
    }
};

module.exports = {
    createFramesForGame,
    createFramesForAllDatedGames
};