// routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// GET all games
router.get('/', gameController.getAllGames);

// GET games by team - specific routes need to come before generic parameter routes
router.get('/team/:team', gameController.getGamesByTeam);

// GET games by winner status (true/false)
router.get('/winner/:status', gameController.getGamesByWinner);

// GET games by event
router.get('/event/:event', gameController.getGamesByEvent);

// GET a single game by id - this should come after other specific routes
router.get('/:id', gameController.getGameById);

// POST create a new game
router.post('/', gameController.createGame);

// PUT update a game
router.put('/:id', gameController.updateGame);

// DELETE a game
router.delete('/:id', gameController.deleteGame);

module.exports = router;
