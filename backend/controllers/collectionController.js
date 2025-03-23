// controllers/collectionController.js
const { Collection, Game, CollectionGameRelation } = require('../models');
const logger = require('../utils/logger');

/**
 * Create a new collection
 */
const createCollection = async (req, res) => {
    try {
        const { name, gameIds } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: 'Collection name is required'
            });
        }

        // Create new collection
        const newCollection = await Collection.create({ name });

        // Check if gameIds are provided to add games to collection
        if (gameIds && Array.isArray(gameIds) && gameIds.length > 0) {
            // Verify all games exist
            const games = await Game.findAll({
                where: { id: gameIds }
            });

            if (games.length !== gameIds.length) {
                const foundIds = games.map(game => game.id);
                const missingIds = gameIds.filter(id => !foundIds.includes(id));

                // Don't fail the request, just note the missing games
                logger.warn(`Some games not found when creating collection: ${missingIds.join(', ')}`);
            }

            // Create relations for all existing games
            const relations = [];
            for (const game of games) {
                const relation = await CollectionGameRelation.create({
                    collection_id: newCollection.id,
                    game_id: game.id
                });
                relations.push(relation);
            }

            return res.status(201).json({
                status: 'success',
                message: 'Collection created successfully with games',
                collection: newCollection,
                addedGames: games.length
            });
        }

        return res.status(201).json({
            status: 'success',
            message: 'Collection created successfully',
            collection: newCollection
        });
    } catch (error) {
        logger.error(`Error creating collection: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create collection'
        });
    }
};

/**
 * Rename a collection
 */
const renameCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: 'New collection name is required'
            });
        }

        // Find the collection
        const collection = await Collection.findByPk(id);
        if (!collection) {
            return res.status(404).json({
                status: 'error',
                message: `Collection with ID ${id} not found`
            });
        }

        // Update the collection name
        collection.name = name;
        await collection.save();

        return res.status(200).json({
            status: 'success',
            message: 'Collection renamed successfully',
            collection
        });
    } catch (error) {
        logger.error(`Error renaming collection ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to rename collection'
        });
    }
};

/**
 * Add games to a collection
 */
const addGamesToCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const { gameIds } = req.body;

        // Validate required fields
        if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Game IDs array is required'
            });
        }

        // Find the collection
        const collection = await Collection.findByPk(id);
        if (!collection) {
            return res.status(404).json({
                status: 'error',
                message: `Collection with ID ${id} not found`
            });
        }

        // Verify all games exist
        const games = await Game.findAll({
            where: { id: gameIds }
        });

        if (games.length !== gameIds.length) {
            const foundIds = games.map(game => game.id);
            const missingIds = gameIds.filter(id => !foundIds.includes(id));

            return res.status(404).json({
                status: 'error',
                message: `Some games not found: ${missingIds.join(', ')}`
            });
        }

        // Create relations for all games
        const relations = [];
        for (const gameId of gameIds) {
            // Check if relation already exists
            const existingRelation = await CollectionGameRelation.findOne({
                where: {
                    collection_id: id,
                    game_id: gameId
                }
            });

            if (!existingRelation) {
                const relation = await CollectionGameRelation.create({
                    collection_id: id,
                    game_id: gameId
                });
                relations.push(relation);
            }
        }

        return res.status(200).json({
            status: 'success',
            message: `${relations.length} games added to collection successfully`,
            addedRelations: relations
        });
    } catch (error) {
        logger.error(`Error adding games to collection ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to add games to collection'
        });
    }
};

/**
 * Remove a game from a collection
 */
const removeGameFromCollection = async (req, res) => {
    try {
        const { collectionId, gameId } = req.params;

        // Find the collection
        const collection = await Collection.findByPk(collectionId);
        if (!collection) {
            return res.status(404).json({
                status: 'error',
                message: `Collection with ID ${collectionId} not found`
            });
        }

        // Find the game
        const game = await Game.findByPk(gameId);
        if (!game) {
            return res.status(404).json({
                status: 'error',
                message: `Game with ID ${gameId} not found`
            });
        }

        // Find and delete the relation
        const deleted = await CollectionGameRelation.destroy({
            where: {
                collection_id: collectionId,
                game_id: gameId
            }
        });

        if (deleted === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Game with ID ${gameId} is not in collection with ID ${collectionId}`
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Game removed from collection successfully'
        });
    } catch (error) {
        logger.error(`Error removing game ${req.params.gameId} from collection ${req.params.collectionId}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to remove game from collection'
        });
    }
};

/**
 * Delete a collection
 */
const deleteCollection = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete the collection
        const deleted = await Collection.destroy({
            where: { id }
        });

        if (deleted === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Collection with ID ${id} not found`
            });
        }

        // CollectionGameRelation records will be automatically deleted if cascade delete is set up

        return res.status(200).json({
            status: 'success',
            message: 'Collection deleted successfully'
        });
    } catch (error) {
        logger.error(`Error deleting collection ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete collection'
        });
    }
};

/**
 * Get all collections
 */
const getAllCollections = async (req, res) => {
    try {
        const collections = await Collection.findAll();
        return res.json(collections);
    } catch (error) {
        logger.error(`Error fetching collections: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch collections'
        });
    }
};

/**
 * Get a collection by ID
 */
const getCollectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const collection = await Collection.findByPk(id, {
            include: [
                {
                    model: Game,
                    as: 'games',
                    through: { attributes: [] } // Don't include the junction table attributes
                }
            ]
        });

        if (!collection) {
            return res.status(404).json({
                status: 'error',
                message: 'Collection not found'
            });
        }

        return res.json(collection);
    } catch (error) {
        logger.error(`Error fetching collection ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch collection'
        });
    }
};

module.exports = {
    createCollection,
    renameCollection,
    addGamesToCollection,
    removeGameFromCollection,
    deleteCollection,
    getAllCollections,
    getCollectionById
};
