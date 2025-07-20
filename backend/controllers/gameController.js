// controllers/gameController.js
const models = require('../models');
const logger = require('../utils/logger');
const {Op} = require("sequelize");
const {createFramesForGame} = require("../services/game-data/gameFramesService");


// The Game model is now accessible as models.Game

/**
 * Calculate team classification stats by summing parameter values
 * This is a separate function that can be customized for different calculation methods
 * @param {Array} teamChampions - Array of champion objects with classification_stats
 * @param {Object} classification - Classification object with parameters
 * @returns {Object} - Object with parameter names as keys and summed values
 */
const calculateTeamClassificationStats = (teamChampions, classification) => {
    if (!classification || !classification.parameters || !teamChampions || teamChampions.length === 0) {
        return {};
    }

    const teamStats = {};

    // Initialize all parameters with 0
    classification.parameters.forEach(param => {
        teamStats[param.name] = 0;
    });

    // Sum up all parameter values from team champions
    teamChampions.forEach(champion => {
        if (champion.classification_stats) {
            Object.keys(champion.classification_stats).forEach(paramName => {
                if (teamStats.hasOwnProperty(paramName)) {
                    // Ensure we convert to number and handle null/undefined values
                    const value = parseFloat(champion.classification_stats[paramName]) || 0;
                    teamStats[paramName] += value;
                }
            });
        }
    });

    return teamStats;
};

/**
 * Helper function to attach classification stats to champions and return classification info
 */
const attachClassificationStatsToChampions = async (champions, classificationId) => {
    try {
        // If no classificationId provided, try to get the first available classification
        let targetClassificationId = classificationId;
        if (!targetClassificationId) {
            const firstClassification = await models.ClassificationList.findOne({
                order: [['id', 'ASC']]
            });
            if (firstClassification) {
                targetClassificationId = firstClassification.id;
            } else {
                // No classifications available, return champions without stats
                return {
                    champions: champions.map(champion => ({
                        ...champion.toJSON(),
                        classification_stats: {}
                    })),
                    classification: null
                };
            }
        }

        // Get classification with parameters
        const classification = await models.ClassificationList.findByPk(targetClassificationId, {
            include: [
                {
                    model: models.ClassificationParameters,
                    as: 'parameters'
                }
            ]
        });

        if (!classification) {
            logger.warn(`Classification with ID ${targetClassificationId} not found`);
            return {
                champions: champions.map(champion => ({
                    ...champion.toJSON(),
                    classification_stats: {}
                })),
                classification: null
            };
        }

        // Get champion IDs
        const championIds = champions.map(champion => champion.id);

        // Get parameter values for these champions
        const parameterValues = await models.ClassificationChampionParameterValue.findAll({
            where: {
                champion_id: championIds
            },
            include: [
                {
                    model: models.ClassificationParameters,
                    as: 'parameter',
                    where: { classification_id: targetClassificationId },
                    required: false
                }
            ]
        });

        // Transform champions data to include classification_stats
        const championsWithStats = champions.map(champion => {
            const championData = champion.toJSON();
            const classificationStats = {};

            // Initialize all parameters with 0
            classification.parameters.forEach(param => {
                classificationStats[param.name] = 0;
            });

            // Fill in actual values if they exist
            const championParamValues = parameterValues.filter(pv => pv.champion_id === champion.id);
            championParamValues.forEach(paramValue => {
                if (paramValue.parameter) {
                    // Ensure we store the value as a number
                    classificationStats[paramValue.parameter.name] = parseFloat(paramValue.value) || 0;
                }
            });

            championData.classification_stats = classificationStats;
            return championData;
        });

        return {
            champions: championsWithStats,
            classification: classification
        };
    } catch (error) {
        logger.error(`Error attaching classification stats: ${error.message}`);
        // Return original champions without stats if error occurs
        return {
            champions: champions.map(champion => ({
                ...champion.toJSON(),
                classification_stats: {}
            })),
            classification: null
        };
    }
};

/**
 * Get all games
 */

const getGames = async (classificationId = null) => {
    const games = await models.Game.findAll({
        where: {
            state: {
                [Op.ne]: 'unneeded'  // not equal to 'unneeded'
            },
            patch_version: {
                [Op.ne]: null  // not null
            }
        },
        include: [
            {
                model: models.GamePlayer,
                as: 'gamePlayers',
                include: [
                    {
                        model: models.Champion,
                        as: 'champion'
                    },
                    {
                        model: models.Player,
                        as: 'player'
                    }
                ]
            },
            {model: models.Team, as: 'blueTeam'},
            {model: models.Team, as: 'redTeam'},
            {model: models.Team, as: 'winnerTeam'},
            {model: models.Match, as: 'match'}
        ]
    });

    // Collect all unique champions across all games
    const championSet = new Set();
    const championObjects = [];
    
    games.forEach(game => {
        if (game.gamePlayers) {
            game.gamePlayers.forEach(gamePlayer => {
                if (gamePlayer.champion && !championSet.has(gamePlayer.champion.id)) {
                    championSet.add(gamePlayer.champion.id);
                    championObjects.push(gamePlayer.champion);
                }
            });
        }
    });

    let classification = null;
    let championStatsMap = new Map();

    if (championObjects.length > 0) {
        // Convert to proper model instances for the helper function
        const championInstances = championObjects.map(championData => ({
            id: championData.id,
            toJSON: () => championData
        }));

        const result = await attachClassificationStatsToChampions(championInstances, classificationId);
        classification = result.classification;
        
        // Create a map for quick lookup
        result.champions.forEach(champion => {
            championStatsMap.set(champion.id, champion.classification_stats);
        });
    }

    // Transform games to include classification stats for champions and add classification to each game
    const gamesWithStats = games.map(game => {
        const gameData = game.toJSON();
        
        // Add classification info to the game
        gameData.classification = classification;
        
        // Map back the stats to the game players and separate by teams
        const blueTeamChampions = [];
        const redTeamChampions = [];
        
        if (gameData.gamePlayers) {
            gameData.gamePlayers = gameData.gamePlayers.map(gamePlayer => {
                if (gamePlayer.champion) {
                    const stats = championStatsMap.get(gamePlayer.champion.id);
                    if (stats) {
                        gamePlayer.champion.classification_stats = stats;
                    } else {
                        gamePlayer.champion.classification_stats = {};
                    }
                    
                    // Collect champions by team for team classification calculation
                    if (gamePlayer.team_side === 'blue') {
                        blueTeamChampions.push(gamePlayer.champion);
                    } else if (gamePlayer.team_side === 'red') {
                        redTeamChampions.push(gamePlayer.champion);
                    }
                }
                return gamePlayer;
            });
        }
        
        // Calculate team classification stats
        gameData.blue_team_classification = calculateTeamClassificationStats(blueTeamChampions, classification);
        gameData.red_team_classification = calculateTeamClassificationStats(redTeamChampions, classification);
        
        return gameData;
    });

    return gamesWithStats;
}

const getAllGames = async (req, res) => {
    try {
        const { classification_id } = req.query;
        const games = await getGames(classification_id ? parseInt(classification_id) : null);
        return res.json(games);
    } catch (error) {
        logger.error(`Error fetching games: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch games'
        });
    }
};
const arraySameElemsNum = (arr1, arr2) => {
    if (!arr1.length === arr2.length) return 0;
    return arr1.reduce((sum, el, i) => {
        return (el === arr2[i]) ? sum + 1 : sum;
    }, 0)
}
const findMatchesNumber = (game, filter) => {
    const pick1 = filter[1];
    const pick2 = filter[2];
    const pick1Categories = [
        game.champion1.category,
        game.champion2.category,
        game.champion3.category,
        game.champion4.category,
        game.champion5.category,
    ];
    const pick2Categories = [
        game.champion6.category,
        game.champion7.category,
        game.champion8.category,
        game.champion9.category,
        game.champion10.category,
    ];
    return Math.max(
        arraySameElemsNum(pick1, pick1Categories) + arraySameElemsNum(pick2, pick2Categories),
        arraySameElemsNum(pick1, pick2Categories) + arraySameElemsNum(pick2, pick1Categories)
    )
}
const getSimilarGames = async (req, res) => {
    try {
        const {filter} = req.body;
        const { classification_id } = req.query;
        const games = await getGames(classification_id ? parseInt(classification_id) : null);
        const filteredGames = games.filter(el => {
            const matchesNum = findMatchesNumber(el, filter);
            return matchesNum >= 7;
        })
        return res.json(filteredGames);
    } catch (e) {
        return res.status(500).json({
            status: 'error',
            message: e.message
        });
    }

}
/**
 * Get a single game by ID
 */
const getGameById = async (req, res) => {
        try {
            const {id} = req.params;
            const { classification_id } = req.query;
            
            const game = await models.Game.findByPk(id, {
                        include: [


                            {
                                model: models.GamePlayer,
                                as: 'gamePlayers',
                                include: [
                                    {
                                        model: models.Champion,
                                        as: 'champion'
                                    },
                                    {
                                        model: models.Player,
                                        as: 'player'
                                    }
                                ]
                            },
                            {model: models.Team, as: 'blueTeam'},
                            {model: models.Team, as: 'redTeam'},
                            {model: models.Team, as: 'winnerTeam'},
                            {model: models.Match, as: 'match'},
                            {
                                model: models.Frame,
                                as: 'framesPlayer',
                                include:
                                    [
                                        {
                                            model: models.FrameChampionPlayerGold,
                                            as: 'championsGold'
                                        }
                                    ]
                            }
                        ]
                    }
                )
            ;

            if (!game) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Game not found'
                });
            }

            // Transform the game to include classification stats for champions
            const gameData = game.toJSON();
            
            // Collect all unique champions from the game
            const championSet = new Set();
            const championObjects = [];
            
            if (gameData.gamePlayers) {
                gameData.gamePlayers.forEach(gamePlayer => {
                    if (gamePlayer.champion && !championSet.has(gamePlayer.champion.id)) {
                        championSet.add(gamePlayer.champion.id);
                        championObjects.push(gamePlayer.champion);
                    }
                });
            }

            let classification = null;

            if (championObjects.length > 0) {
                // Convert to proper model instances for the helper function
                const championInstances = championObjects.map(championData => ({
                    id: championData.id,
                    toJSON: () => championData
                }));

                const classificationIdToUse = classification_id ? parseInt(classification_id) : null;
                const result = await attachClassificationStatsToChampions(championInstances, classificationIdToUse);
                const championsWithStats = result.champions;
                classification = result.classification;
                
                // Separate champions by teams for team classification calculation
                const blueTeamChampions = [];
                const redTeamChampions = [];
                
                // Map back the stats to the game players
                gameData.gamePlayers = gameData.gamePlayers.map(gamePlayer => {
                    if (gamePlayer.champion) {
                        const championWithStats = championsWithStats.find(c => c.id === gamePlayer.champion.id);
                        if (championWithStats) {
                            gamePlayer.champion.classification_stats = championWithStats.classification_stats;
                        } else {
                            gamePlayer.champion.classification_stats = {};
                        }
                        
                        // Collect champions by team for team classification calculation
                        if (gamePlayer.team_side === 'blue') {
                            blueTeamChampions.push(gamePlayer.champion);
                        } else if (gamePlayer.team_side === 'red') {
                            redTeamChampions.push(gamePlayer.champion);
                        }
                    }
                    return gamePlayer;
                });
                
                // Calculate team classification stats
                gameData.blue_team_classification = calculateTeamClassificationStats(blueTeamChampions, classification);
                gameData.red_team_classification = calculateTeamClassificationStats(redTeamChampions, classification);
            } else {
                // No champions found, set empty team classification stats
                gameData.blue_team_classification = {};
                gameData.red_team_classification = {};
            }

            // Add classification info to the game
            gameData.classification = classification;

            return res.json(gameData);
        } catch
            (error) {
            logger.error(`Error fetching game ${req.params.id}: ${error.message}`);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch game'
            });
        }
    }
;

/**
 * Create a new game
 */
const createGame = async (req, res) => {
    try {
        //console.log(req.body);

        // Check if game with same event already exists
        const existingGame = await models.Game.findOne({
            where: {event: req.body.event}
        });

        if (existingGame) {
            return res.status(409).json({
                status: 'error',
                message: 'Game with this event already exists',
                game: existingGame
            });
        }

        const gameData = {...req.body};

        // Ensure all required fields are present
        if (!gameData.pick1 || !gameData.pick2 || !gameData.pick3 ||
            !gameData.pick4 || !gameData.pick5 || !gameData.pick6 ||
            !gameData.pick7 || !gameData.pick8 || !gameData.pick9 ||
            !gameData.pick10) {
            return res.status(400).json({
                status: 'error',
                message: 'All pick fields are required'
            });
        }

        // Validate winner field
        if (gameData.winner === undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'Winner field is required'
            });
        }

        //console.log(gameData);
        const newGame = await models.Game.create(gameData);
        return res.status(201).json(newGame);
    } catch (error) {
        logger.error(`Error creating game: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create game'
        });
    }
};

/**
 * Update an existing game
 */
const updateGame = async (req, res) => {
    try {
        const {id} = req.params;
        const [updated] = await models.Game.update(req.body, {
            where: {id}
        });

        if (updated === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Game not found'
            });
        }

        const updatedGame = await models.Game.findByPk(id);
        return res.json(updatedGame);
    } catch (error) {
        logger.error(`Error updating game ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update game'
        });
    }
};

/**
 * Delete a game
 */
const deleteGame = async (req, res) => {
    try {
        const {id} = req.params;
        const deleted = await models.Game.destroy({
            where: {id}
        });

        if (deleted === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Game not found'
            });
        }

        return res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting game ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete game'
        });
    }
};

/**
 * Get games by team
 */
const getGamesByTeam = async (req, res) => {
    try {
        const {team} = req.params;
        const { classification_id } = req.query;
        const games = await models.Game.findAll({
            where: {
                [models.Sequelize.Op.or]: [
                    {team1: team},
                    {team2: team}
                ]
            }
        });

        return res.json(games);
    } catch (error) {
        logger.error(`Error fetching games by team ${req.params.team}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch games by team'
        });
    }
};

/**
 * Get games by winner status
 */
const getGamesByWinner = async (req, res) => {
    try {
        const {status} = req.params;
        const { classification_id } = req.query;
        const winnerStatus = status === 'true';

        const games = await models.Game.findAll({
            where: {winner: winnerStatus}
        });

        return res.json(games);
    } catch (error) {
        logger.error(`Error fetching games by winner status: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch games by winner status'
        });
    }
};

/**
 * Get games by event
 */
const getGamesByEvent = async (req, res) => {
    try {
        const {event} = req.params;
        const { classification_id } = req.query;
        const games = await models.Game.findAll({
            where: {event}
        });

        return res.json(games);
    } catch (error) {
        logger.error(`Error fetching games by event ${req.params.event}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch games by event'
        });
    }
};

const createFinishedGameFrames = async (req, res) => {
    const gameId = req.params.id;

    try {
        const result = await createFramesForGame(gameId);
        return res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        logger.error(`Error retrieving finished frame for game ${gameId}: ${error.message}`);
        return res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message
        });
    }
};


module.exports = {
    getAllGames,
    getSimilarGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame,
    getGamesByTeam,
    getGamesByWinner,
    getGamesByEvent,
    createFinishedGameFrames,
    calculateTeamClassificationStats // Export the calculation function for potential reuse
};