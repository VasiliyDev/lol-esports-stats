// controllers/collectionController.js
const models = require('../models');
const { Collection, Game, CollectionGameRelation } = models;
const logger = require('../utils/logger');

// Helper function to get detailed collection
const getDetailedCollection = async (collectionId) => {
    return await Collection.findByPk(collectionId, {
        include: [
            {
                model: Game,
                as: 'games',
                through: { attributes: [] },
                include: [
                    // Use the correct alias names that match your Game model
                    {model: models.Champion, as: 'champion1', foreignKey: 'pick1'},
                    {model: models.Champion, as: 'champion2', foreignKey: 'pick2'},
                    {model: models.Champion, as: 'champion3', foreignKey: 'pick3'},
                    {model: models.Champion, as: 'champion4', foreignKey: 'pick4'},
                    {model: models.Champion, as: 'champion5', foreignKey: 'pick5'},
                    {model: models.Champion, as: 'champion6', foreignKey: 'pick6'},
                    {model: models.Champion, as: 'champion7', foreignKey: 'pick7'},
                    {model: models.Champion, as: 'champion8', foreignKey: 'pick8'},
                    {model: models.Champion, as: 'champion9', foreignKey: 'pick9'},
                    {model: models.Champion, as: 'champion10', foreignKey: 'pick10'},
                    {model: models.Event, as: 'eventDetails'}
                ]
            }
        ]
    });
};

// Common function to add games to a collection
const addGamesToCollectionHelper = async (collectionId, gameIds, shouldFailOnMissing = true) => {
    // Verify all games exist
    const games = await Game.findAll({
        where: { id: gameIds }
    });

    if (games.length !== gameIds.length) {
        const foundIds = games.map(game => game.id);
        const missingIds = gameIds.filter(id => !foundIds.includes(Number(id)));

        if (shouldFailOnMissing) {
            throw new Error(`Some games not found: ${missingIds.join(', ')}`);
        } else {
            // Just log a warning
            logger.warn(`Some games not found when adding to collection: ${missingIds.join(', ')}`);
        }
    }

    // Create relations for all existing games
    const relations = [];
    for (const game of games) {
        // Check if relation already exists
        const existingRelation = await CollectionGameRelation.findOne({
            where: {
                collection_id: collectionId,
                game_id: game.id
            }
        });

        if (!existingRelation) {
            const relation = await CollectionGameRelation.create({
                collection_id: collectionId,
                game_id: game.id
            });
            relations.push(relation);
        }
    }

    return {
        addedGames: relations.length,
        games
    };
};

/**
 * Create a new collection
 */
const createCollection = async (req, res) => {
    try {
        console.log('here');
        const { name, items:gameIds } = req.body;

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
            try {
                // Use the common helper with shouldFailOnMissing = false
                await addGamesToCollectionHelper(newCollection.id, gameIds, false);

                // Fetch the detailed collection with all game information
                const detailedCollection = await getDetailedCollection(newCollection.id);

                return res.status(201).json({
                    status: 'success',
                    message: 'Collection created successfully with games',
                    collection: detailedCollection
                });
            } catch (error) {
                logger.error(`Error adding games to new collection: ${error.message}`);
                // Still return the collection even if adding games fails
                return res.status(201).json({
                    status: 'success',
                    message: 'Collection created but some games could not be added',
                    collection: newCollection,
                    error: error.message
                });
            }
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

        // Get the detailed collection after renaming
        const detailedCollection = await getDetailedCollection(id);

        return res.status(200).json({
            status: 'success',
            message: 'Collection renamed successfully',
            collection: detailedCollection
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
            return res.status(200).json({
                status: 'success',
                message: 'No games added'
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

        try {
            // Use the common helper with shouldFailOnMissing = true
            const result = await addGamesToCollectionHelper(id, gameIds, true);

            // Fetch the detailed collection with all game information
            const detailedCollection = await getDetailedCollection(id);

            return res.status(200).json({
                status: 'success',
                message: `${result.addedGames} games added to collection successfully`,
                collection: detailedCollection
            });
        } catch (error) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
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

        // Fetch the updated collection after removing the game
        const updatedCollection = await getDetailedCollection(collectionId);

        return res.status(200).json({
            status: 'success',
            message: 'Game removed from collection successfully',
            collection: updatedCollection
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
        const collections = await Collection.findAll({
            include: [
                {
                    model: Game,
                    as: 'games',
                    through: { attributes: [] },
                    include: [
                        // Include all the same game details as in getDetailedCollection
                        {model: models.Champion, as: 'champion1', foreignKey: 'pick1'},
                        {model: models.Champion, as: 'champion2', foreignKey: 'pick2'},
                        {model: models.Champion, as: 'champion3', foreignKey: 'pick3'},
                        {model: models.Champion, as: 'champion4', foreignKey: 'pick4'},
                        {model: models.Champion, as: 'champion5', foreignKey: 'pick5'},
                        {model: models.Champion, as: 'champion6', foreignKey: 'pick6'},
                        {model: models.Champion, as: 'champion7', foreignKey: 'pick7'},
                        {model: models.Champion, as: 'champion8', foreignKey: 'pick8'},
                        {model: models.Champion, as: 'champion9', foreignKey: 'pick9'},
                        {model: models.Champion, as: 'champion10', foreignKey: 'pick10'},
                        {model: models.Event, as: 'eventDetails'}
                    ]
                }
            ]
        });
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
        const collection = await getDetailedCollection(id);

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
