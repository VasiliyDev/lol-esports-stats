// services/lolEsports/gameWindowService.js
const models = require('../../models');
const logger = require('../../utils/logger');
const { Op } = require('sequelize');

/**
 * Find or create a player based on esports ID
 * @param {Object} playerData - The player data from the API
 * @returns {Promise<Object>} - The player object and whether it was created
 */
const findOrCreatePlayer = async (playerData) => {
    try {
        const [player, created] = await models.Player.findOrCreate({
            where: { esports_id: playerData.esportsPlayerId },
            defaults: {
                name: playerData.summonerName
            }
        });

        // Update name if it has changed
        if (!created && player.name !== playerData.summonerName) {
            await player.update({ name: playerData.summonerName });
        }

        return { player, created };
    } catch (error) {
        logger.error(`Error finding/creating player ${playerData.summonerName}: ${error.message}`);
        throw error;
    }
};

/**
 * Find or create a champion based on name
 * @param {Object} championData - The champion data from the API
 * @returns {Promise<Object>} - The champion object and whether it was created
 */
const findOrCreateChampion = async (championData) => {
    try {
        const [champion, created] = await models.Champion.findOrCreate({
            where: { name: championData },
            defaults: {
                // You might want to add more default values here
                role: null,
                image: null
            }
        });

        return { champion, created };
    } catch (error) {
        logger.error(`Error finding/creating champion ${championData}: ${error.message}`);
        throw error;
    }
};

/**
 * Determine the winner team ID based on the final frame data
 * @param {Object} gameWindowData - The game window data from the API
 * @param {Object} game - The game object
 * @returns {Promise<number|null>} - The winner team ID or null if not determinable
 */
const determineWinnerTeamId = async (gameWindowData, game) => {
    // Only process completed games
    if (game.state !== 'completed') {
        return null;
    }

    try {
        // Get the last frame (final state of the game)
        const frames = gameWindowData.frames;
        if (!frames || frames.length === 0) {
            return null;
        }

        const lastFrame = frames[frames.length - 1];
        if (lastFrame.gameState !== 'finished') {
            // If the last frame doesn't show the game as finished, we can't determine the winner
            return null;
        }

        // Check for victory conditions - this will depend on your API's data structure
        // For example, if there's an explicit winner field, use that
        // Otherwise, you might need to determine the winner based on other game stats

        // For this example, let's assume the team with more towers and inhibitors wins
        // You should adjust this logic based on your actual data
        const blueTeamScore = lastFrame.blueTeam.towers + lastFrame.blueTeam.inhibitors;
        const redTeamScore = lastFrame.redTeam.towers + lastFrame.redTeam.inhibitors;

        if (blueTeamScore > redTeamScore) {
            return game.blue_team_id;
        } else if (redTeamScore > blueTeamScore) {
            return game.red_team_id;
        }

        // If the scores are equal, check kills
        if (lastFrame.blueTeam.totalKills > lastFrame.redTeam.totalKills) {
            return game.blue_team_id;
        } else if (lastFrame.redTeam.totalKills > lastFrame.blueTeam.totalKills) {
            return game.red_team_id;
        }

        // If still equal, we might not be able to determine a winner from this data
        return null;
    } catch (error) {
        logger.error(`Error determining winner for game ${game.id}: ${error.message}`);
        return null;
    }
};

/**
 * Process game window data from the LoL Esports API
 * @param {Object} gameWindowData - The game window data from getWindow API
 * @returns {Promise<Object>} - Stats about processed data
 */
const processGameWindowData = async (gameWindowData) => {
    if (!gameWindowData || !gameWindowData.gameMetadata) {
        throw new Error('Invalid game window data format');
    }

    const stats = {
        gameUpdated: false,
        playersCreated: 0,
        playersUpdated: 0,
        championsCreated: 0,
        gamePlayersCreated: 0,
        errors: []
    };

    try {
        // 1. Find the game in our database
        const game = await models.Game.findOne({
            where: { lol_id: gameWindowData.esportsGameId }
        });

        if (!game) {
            logger.warn(`Game with lol_id ${gameWindowData.esportsGameId} not found, can't update details`);
            return stats;
        }

        // 2. Update game metadata
        const metadata = gameWindowData.gameMetadata;
        await game.update({
            patch_version: metadata.patchVersion
        });

        // 3. Determine winner if possible
        const winnerTeamId = await determineWinnerTeamId(gameWindowData, game);
        if (winnerTeamId) {
            await game.update({ winner_team_id: winnerTeamId });
        }

        stats.gameUpdated = true;

        // 4. First, clear existing game player associations for this game
        await models.GamePlayer.destroy({
            where: { game_id: game.id }
        });

        // 5. Process blue team players
        for (const playerData of metadata.blueTeamMetadata.participantMetadata) {
            try {
                // Find or create player
                const { player, created } = await findOrCreatePlayer(playerData);
                if (created) {
                    stats.playersCreated++;
                } else {
                    stats.playersUpdated++;
                }

                // Find or create champion
                const { champion, created: championCreated } = await findOrCreateChampion(playerData.championId);
                if (championCreated) {
                    stats.championsCreated++;
                }

                // Create game player association
                await models.GamePlayer.create({
                    game_id: game.id,
                    player_id: player.id,
                    champion_id: champion.id,
                    team_side: 'blue',
                    position: playerData.role,
                    participant_id: playerData.participantId
                });

                stats.gamePlayersCreated++;
            } catch (error) {
                logger.error(`Error processing blue team player ${playerData.summonerName}: ${error.message}`);
                stats.errors.push({
                    type: 'player',
                    playerName: playerData.summonerName,
                    error: error.message
                });
            }
        }

        // 6. Process red team players
        for (const playerData of metadata.redTeamMetadata.participantMetadata) {
            try {
                // Find or create player
                const { player, created } = await findOrCreatePlayer(playerData);
                if (created) {
                    stats.playersCreated++;
                } else {
                    stats.playersUpdated++;
                }

                // Find or create champion
                const { champion, created: championCreated } = await findOrCreateChampion(playerData.championId);
                if (championCreated) {
                    stats.championsCreated++;
                }

                // Create game player association
                await models.GamePlayer.create({
                    game_id: game.id,
                    player_id: player.id,
                    champion_id: champion.id,
                    team_side: 'red',
                    position: playerData.role,
                    participant_id: playerData.participantId
                });

                stats.gamePlayersCreated++;
            } catch (error) {
                logger.error(`Error processing red team player ${playerData.summonerName}: ${error.message}`);
                stats.errors.push({
                    type: 'player',
                    playerName: playerData.summonerName,
                    error: error.message
                });
            }
        }

        return stats;
    } catch (error) {
        logger.error(`Error in game window processing: ${error.message}`);
        throw error;
    }
};

/**
 * Fetch and process game window data for a specific game
 * @param {Object} lolEsportsAPI - The LoL Esports API client
 * @param {String} gameId - The LoL Esports game ID
 * @returns {Promise<Object>} - Stats about processed game window data
 */
const fetchAndProcessGameWindow = async (lolEsportsAPI, gameId) => {
    try {
        // Fetch game window data
        const gameWindowData = await lolEsportsAPI.getWindow(gameId);

        // Process the game window data
        return await processGameWindowData(gameWindowData);
    } catch (error) {
        logger.error(`Error fetching and processing game window for game ${gameId}: ${error.message}`);
        throw error;
    }
};

/**
 * Process game window data for all recent games
 * @param {Object} lolEsportsAPI - The LoL Esports API client
 * @returns {Promise<Object>} - Stats about processed game windows
 */
const processAllGamesWindows = async (lolEsportsAPI) => {
    const stats = {
        totalGamesProcessed: 0,
        totalPlayersCreated: 0,
        totalPlayersUpdated: 0,
        totalChampionsCreated: 0,
        totalGamePlayersCreated: 0,
        errors: []
    };

    try {
        // Get all games that need window processing
        // For example, games with state 'completed' but no players
        const games = await models.Game.findAll({
            where: {
                state: 'completed',
                [Op.or]: [
                    { winner_team_id: null },
                    { '$gamePlayers.id$': null }
                ]
            },
            include: [
                {
                    model: models.GamePlayer,
                    as: 'gamePlayers',
                    required: false
                }
            ]
        });

        logger.info(`Processing windows for ${games.length} games`);

        // Process each game
        for (const game of games) {
            try {
                // Fetch and process game window
                const gameStats = await fetchAndProcessGameWindow(lolEsportsAPI, game.lol_id);

                // Update stats
                stats.totalGamesProcessed++;
                stats.totalPlayersCreated += gameStats.playersCreated;
                stats.totalPlayersUpdated += gameStats.playersUpdated;
                stats.totalChampionsCreated += gameStats.championsCreated;
                stats.totalGamePlayersCreated += gameStats.gamePlayersCreated;

                // Log progress
                logger.info(`Processed window for game ${game.lol_id}: created ${gameStats.playersCreated} players, ${gameStats.championsCreated} champions, ${gameStats.gamePlayersCreated} game players`);

                // Add a small delay to avoid API rate limits
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                logger.error(`Error processing window for game ${game.lol_id}: ${error.message}`);
                stats.errors.push({
                    gameId: game.id,
                    lolGameId: game.lol_id,
                    error: error.message
                });
            }
        }

        return stats;
    } catch (error) {
        logger.error(`Error processing all game windows: ${error.message}`);
        throw error;
    }
};

module.exports = {
    processGameWindowData,
    fetchAndProcessGameWindow,
    processAllGamesWindows
};
