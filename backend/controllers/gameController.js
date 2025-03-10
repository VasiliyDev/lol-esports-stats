// controllers/gameController.js
const models = require('../models');
const logger = require('../utils/logger');

// The Game model is now accessible as models.Game

/**
 * Get all games
 */

const getGames = async () => {
    return await models.Game.findAll({
        include: [
            {model: models.Champion, as: 'champion1'},
            {model: models.Champion, as: 'champion2'},
            {model: models.Champion, as: 'champion3'},
            {model: models.Champion, as: 'champion4'},
            {model: models.Champion, as: 'champion5'},
            {model: models.Champion, as: 'champion6'},
            {model: models.Champion, as: 'champion7'},
            {model: models.Champion, as: 'champion8'},
            {model: models.Champion, as: 'champion9'},
            {model: models.Champion, as: 'champion10'},
            {model: models.Event, as: 'eventDetails'} // Include event data if needed
        ]
    });
}
const getAllGames = async (req, res) => {
    try {
        const games = await getGames();
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
        const games = await getGames();
        const filteredGames = games.filter(el => {
            const matchesNum =  findMatchesNumber(el,filter);
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
        const game = await models.Game.findByPk(id);

        if (!game) {
            return res.status(404).json({
                status: 'error',
                message: 'Game not found'
            });
        }

        return res.json(game);
    } catch (error) {
        logger.error(`Error fetching game ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch game'
        });
    }
};

/**
 * Create a new game
 */
const createGame = async (req, res) => {
    try {
        console.log(req.body);

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

        console.log(gameData);
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

module.exports = {
    getAllGames,
    getSimilarGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame,
    getGamesByTeam,
    getGamesByWinner,
    getGamesByEvent
};
