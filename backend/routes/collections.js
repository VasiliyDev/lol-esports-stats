const express = require('express');
const router = express.Router();
const collectionController = require("../controllers/collectionController");

// Get all collections
router.get('/', collectionController.getAllCollections);

// Get a collection by ID
router.get('/:id', collectionController.getCollectionById);

// Create a new collection
router.post('/', collectionController.createCollection);

// Rename a collection
router.put('/:id/rename', collectionController.renameCollection);

// Add games to a collection
router.post('/:id/games', collectionController.addGamesToCollection);

// Remove a game from a collection
router.delete('/:collectionId/games/:gameId', collectionController.removeGameFromCollection);

// Delete a collection
router.delete('/:id', collectionController.deleteCollection);

module.exports = router;
