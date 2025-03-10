// controllers/championController.js
const models = require('../models');
const logger = require('../utils/logger');

/**
 * Get all champions
 */

const { Champion, Category } = require('../models');
const getAllChampions = async (req, res) => {
    try {
        const champions = await Champion.findAll();
        return res.json(champions);
    } catch (error) {
        logger.error(`Error fetching champions: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch champions'
        });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const champions = await Category.findAll();
        return res.json(champions);
    } catch (error) {
        logger.error(`Error fetching categories: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch categories'
        });
    }
};

async function setChampionCategory(req, res) {
    try {
        const { id:championId } = req.params;
        const {category:categoryId} = req.body
        // Check if the category exists
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: `Category with ID ${categoryId} not found.`
            });
        }

        // Find the champion
        const champion = await Champion.findByPk(championId);
        if (!champion) {
            return res.status(404).json({
                status: 'error',
                message: `Champion with ID ${championId} not found.`
            });
        }

        champion.category = categoryId;
        await champion.save();
        return res.status(200).json({
            status: 'success',
            message: `Champion category updated successfully.`,
            champion:champion
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

/**
 * Get a single champion by ID
 */
const getChampionById = async (req, res) => {
    try {
        const { id } = req.params;
        const champion = await models.Champion.findByPk(id);

        if (!champion) {
            return res.status(404).json({
                status: 'error',
                message: 'Champion not found'
            });
        }

        return res.json(champion);
    } catch (error) {
        logger.error(`Error fetching champion ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch champion'
        });
    }
};

/**
 * Get champions by role (position 0-4)
 */
const getChampionsByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const roleInt = parseInt(role);

        // Validate role is between 0-4
        if (isNaN(roleInt) || roleInt < 0 || roleInt > 4) {
            return res.status(400).json({
                status: 'error',
                message: 'Role must be a number between 0 and 4'
            });
        }

        const champions = await models.Champion.findAll({
            where: { role: roleInt }
        });

        return res.json(champions);
    } catch (error) {
        logger.error(`Error fetching champions by role ${req.params.role}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch champions by role'
        });
    }
};

/**
 * Get champions by name
 */
const getChampionsByName = async (req, res) => {
    try {
        const { name } = req.params;

        const champions = await models.Champion.findAll({
            where: { name }
        });

        return res.json(champions);
    } catch (error) {
        logger.error(`Error fetching champions by name ${req.params.name}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch champions by name'
        });
    }
};

/**
 * Get champion by role and name
 */
const getChampionByRoleAndName = async (req, res) => {
    try {
        const { role, name } = req.params;
        const roleInt = parseInt(role);

        // Validate role is between 0-4
        if (isNaN(roleInt) || roleInt < 0 || roleInt > 4) {
            return res.status(400).json({
                status: 'error',
                message: 'Role must be a number between 0 and 4'
            });
        }

        const champion = await models.Champion.findOne({
            where: {
                role: roleInt,
                name
            }
        });

        if (!champion) {
            return res.status(404).json({
                status: 'error',
                message: 'Champion not found with specified role and name'
            });
        }

        return res.json(champion);
    } catch (error) {
        logger.error(`Error fetching champion by role ${req.params.role} and name ${req.params.name}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch champion by role and name'
        });
    }
};

/**
 * Create a new champion
 */
const createChampion = async (req, res) => {
    try {
        const championData = { ...req.body };

        // Validate required fields
        if (!championData.name) {
            return res.status(400).json({
                status: 'error',
                message: 'Champion name is required'
            });
        }

        if (championData.role === undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'Champion role is required'
            });
        }

        // Validate role is between 0-4
        const roleInt = parseInt(championData.role);
        if (isNaN(roleInt) || roleInt < 0 || roleInt > 4) {
            return res.status(400).json({
                status: 'error',
                message: 'Role must be a number between 0 and 4'
            });
        }

        // Check if champion with same role and name already exists
        const existingChampion = await models.Champion.findOne({
            where: {
                role: roleInt,
                name: championData.name
            }
        });

        if (existingChampion) {
            return res.status(409).json({
                status: 'error',
                message: 'Champion with this role and name already exists',
                champion: existingChampion
            });
        }

        const newChampion = await models.Champion.create(championData);
        return res.status(201).json(newChampion);
    } catch (error) {
        logger.error(`Error creating champion: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create champion'
        });
    }
};

/**
 * Create champion if it doesn't exist
 */
const createChampionIfNotExists = async (req, res) => {
    try {
        const championData = { ...req.body };

        // Validate required fields
        if (!championData.name) {
            return res.status(400).json({
                status: 'error',
                message: 'Champion name is required'
            });
        }

        if (championData.role === undefined) {
            return res.status(400).json({
                status: 'error',
                message: 'Champion role is required'
            });
        }

        // Validate role is between 0-4
        const roleInt = parseInt(championData.role);
        if (isNaN(roleInt) || roleInt < 0 || roleInt > 4) {
            return res.status(400).json({
                status: 'error',
                message: 'Role must be a number between 0 and 4'
            });
        }

        // Check if champion with same role and name already exists
        const [champion, created] = await models.Champion.findOrCreate({
            where: {
                role: roleInt,
                name: championData.name
            },
            defaults: championData
        });

        return res.status(created ? 201 : 200).json({
            status: 'success',
            message: created ? 'Champion created' : 'Champion already exists',
            champion,
            created
        });
    } catch (error) {
        logger.error(`Error in createChampionIfNotExists: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to process champion'
        });
    }
};

/**
 * Update an existing champion
 */
const updateChampion = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Get current champion
        const champion = await models.Champion.findByPk(id);
        if (!champion) {
            return res.status(404).json({
                status: 'error',
                message: 'Champion not found'
            });
        }

        // If updating role or name, check for duplicates
        if ((updateData.role !== undefined || updateData.name !== undefined) &&
            (updateData.role !== champion.role || updateData.name !== champion.name)) {

            // Check if another champion with the new role and name already exists
            const existingChampion = await models.Champion.findOne({
                where: {
                    role: updateData.role !== undefined ? updateData.role : champion.role,
                    name: updateData.name !== undefined ? updateData.name : champion.name
                }
            });

            if (existingChampion && existingChampion.id !== parseInt(id)) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Another champion with this role and name already exists',
                    champion: existingChampion
                });
            }
        }

        // Perform the update
        const [updated] = await models.Champion.update(updateData, {
            where: { id }
        });

        if (updated === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Champion not found'
            });
        }

        const updatedChampion = await models.Champion.findByPk(id);
        return res.json(updatedChampion);
    } catch (error) {
        logger.error(`Error updating champion ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update champion'
        });
    }
};

/**
 * Delete a champion
 */
const deleteChampion = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await models.Champion.destroy({
            where: { id }
        });

        if (deleted === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Champion not found'
            });
        }

        return res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting champion ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete champion'
        });
    }
};

module.exports = {
    getAllChampions,
    getAllCategories,
    setChampionCategory,
    getChampionById,
    getChampionsByRole,
    getChampionsByName,
    getChampionByRoleAndName,
    createChampion,
    createChampionIfNotExists,
    updateChampion,
    deleteChampion
};
