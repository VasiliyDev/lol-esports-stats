// controllers/classificationController.js
const models = require('../models');
const { ClassificationList, ClassificationParameters, Champion, ClassificationChampionParameterValue } = models;
const logger = require('../utils/logger');

// ================== CLASSIFICATIONS ==================

/**
 * Get all classifications with their parameters
 */
const getAllClassifications = async (req, res) => {
    try {
        const classifications = await ClassificationList.findAll({
            include: [
                {
                    model: ClassificationParameters,
                    as: 'parameters'
                }
            ]
        });

        return res.json({
            status: 'success',
            data: classifications
        });
    } catch (error) {
        logger.error(`Error fetching classifications: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch classifications'
        });
    }
};

/**
 * Get classification by ID
 */
const getClassificationById = async (req, res) => {
    try {
        const { id } = req.params;

        const classification = await ClassificationList.findByPk(id, {
            include: [
                {
                    model: ClassificationParameters,
                    as: 'parameters'
                }
            ]
        });

        if (!classification) {
            return res.status(404).json({
                status: 'error',
                message: `Classification with ID ${id} not found`
            });
        }

        return res.json({
            status: 'success',
            data: classification
        });
    } catch (error) {
        logger.error(`Error fetching classification ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch classification'
        });
    }
};

/**
 * Create a new classification
 */
const createClassification = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: 'Classification name is required'
            });
        }

        const newClassification = await ClassificationList.create({ name });

        return res.status(201).json({
            status: 'success',
            message: 'Classification created successfully',
            data: newClassification
        });
    } catch (error) {
        logger.error(`Error creating classification: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create classification'
        });
    }
};

/**
 * Rename classification by ID
 */
const renameClassification = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: 'New classification name is required'
            });
        }

        const classification = await ClassificationList.findByPk(id);
        if (!classification) {
            return res.status(404).json({
                status: 'error',
                message: `Classification with ID ${id} not found`
            });
        }

        classification.name = name;
        await classification.save();

        // Get updated classification with parameters
        const updatedClassification = await ClassificationList.findByPk(id, {
            include: [
                {
                    model: ClassificationParameters,
                    as: 'parameters'
                }
            ]
        });

        return res.json({
            status: 'success',
            message: 'Classification renamed successfully',
            data: updatedClassification
        });
    } catch (error) {
        logger.error(`Error renaming classification ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to rename classification'
        });
    }
};

/**
 * Delete classification by ID
 */
const deleteClassification = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await ClassificationList.destroy({
            where: { id }
        });

        if (deleted === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Classification with ID ${id} not found`
            });
        }

        return res.json({
            status: 'success',
            message: 'Classification deleted successfully'
        });
    } catch (error) {
        logger.error(`Error deleting classification ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete classification'
        });
    }
};

/**
 * Get full info of classification with champions and their parameter values
 */
const getClassificationFullInfo = async (req, res) => {
    try {
        const { id } = req.params;

        // Get classification info
        const classification = await ClassificationList.findByPk(id, {
            include: [
                {
                    model: ClassificationParameters,
                    as: 'parameters'
                }
            ]
        });

        if (!classification) {
            return res.status(404).json({
                status: 'error',
                message: `Classification with ID ${id} not found`
            });
        }

        // Get all champions with their parameter values for this classification
        const champions = await Champion.findAll({
            include: [
                {
                    model: ClassificationChampionParameterValue,
                    as: 'parameterValues',
                    include: [
                        {
                            model: ClassificationParameters,
                            as: 'parameter',
                            where: { classification_id: id },
                            required: false
                        }
                    ],
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
            if (championData.parameterValues) {
                championData.parameterValues.forEach(paramValue => {
                    if (paramValue.parameter) {
                        classificationStats[paramValue.parameter.name] = paramValue.value || 0;
                    }
                });
            }

            // Remove parameterValues from response and add classification_stats
            delete championData.parameterValues;
            championData.classification_stats = classificationStats;

            return championData;
        });

        const result = {
            classification: classification,
            champions: championsWithStats
        };

        return res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        logger.error(`Error fetching classification full info ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch classification full info'
        });
    }
};

// ================== CLASSIFICATION PARAMETERS ==================

/**
 * Get all classification parameters
 */
const getAllClassificationParameters = async (req, res) => {
    try {
        const parameters = await ClassificationParameters.findAll({
            include: [
                {
                    model: ClassificationList,
                    as: 'classification'
                }
            ]
        });

        return res.json({
            status: 'success',
            data: parameters
        });
    } catch (error) {
        logger.error(`Error fetching classification parameters: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch classification parameters'
        });
    }
};

/**
 * Get classification parameters by classification ID
 */
const getClassificationParametersByClassificationId = async (req, res) => {
    try {
        const { classificationId } = req.params;

        const parameters = await ClassificationParameters.findAll({
            where: { classification_id: classificationId },
            include: [
                {
                    model: ClassificationList,
                    as: 'classification'
                }
            ]
        });

        return res.json({
            status: 'success',
            data: parameters
        });
    } catch (error) {
        logger.error(`Error fetching classification parameters for classification ${req.params.classificationId}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch classification parameters'
        });
    }
};

/**
 * Get classification parameter by ID
 */
const getClassificationParameterById = async (req, res) => {
    try {
        const { id } = req.params;

        const parameter = await ClassificationParameters.findByPk(id, {
            include: [
                {
                    model: ClassificationList,
                    as: 'classification'
                }
            ]
        });

        if (!parameter) {
            return res.status(404).json({
                status: 'error',
                message: `Classification parameter with ID ${id} not found`
            });
        }

        return res.json({
            status: 'success',
            data: parameter
        });
    } catch (error) {
        logger.error(`Error fetching classification parameter ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch classification parameter'
        });
    }
};

/**
 * Create a new classification parameter
 */
const createClassificationParameter = async (req, res) => {
    try {
        const { classification_id, name } = req.body;

        if (!classification_id || !name) {
            return res.status(400).json({
                status: 'error',
                message: 'Classification ID and parameter name are required'
            });
        }

        // Verify classification exists
        const classification = await ClassificationList.findByPk(classification_id);
        if (!classification) {
            return res.status(404).json({
                status: 'error',
                message: `Classification with ID ${classification_id} not found`
            });
        }

        const newParameter = await ClassificationParameters.create({
            classification_id,
            name
        });

        // Get parameter with classification info
        const parameterWithClassification = await ClassificationParameters.findByPk(newParameter.id, {
            include: [
                {
                    model: ClassificationList,
                    as: 'classification'
                }
            ]
        });

        return res.status(201).json({
            status: 'success',
            message: 'Classification parameter created successfully',
            data: parameterWithClassification
        });
    } catch (error) {
        logger.error(`Error creating classification parameter: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to create classification parameter'
        });
    }
};

/**
 * Update classification parameter by ID
 */
const updateClassificationParameter = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, classification_id } = req.body;

        const parameter = await ClassificationParameters.findByPk(id);
        if (!parameter) {
            return res.status(404).json({
                status: 'error',
                message: `Classification parameter with ID ${id} not found`
            });
        }

        // If classification_id is being changed, verify it exists
        if (classification_id && classification_id !== parameter.classification_id) {
            const classification = await ClassificationList.findByPk(classification_id);
            if (!classification) {
                return res.status(404).json({
                    status: 'error',
                    message: `Classification with ID ${classification_id} not found`
                });
            }
            parameter.classification_id = classification_id;
        }

        if (name) {
            parameter.name = name;
        }

        await parameter.save();

        // Get updated parameter with classification info
        const updatedParameter = await ClassificationParameters.findByPk(id, {
            include: [
                {
                    model: ClassificationList,
                    as: 'classification'
                }
            ]
        });

        return res.json({
            status: 'success',
            message: 'Classification parameter updated successfully',
            data: updatedParameter
        });
    } catch (error) {
        logger.error(`Error updating classification parameter ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update classification parameter'
        });
    }
};

/**
 * Delete classification parameter by ID
 */
const deleteClassificationParameter = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await ClassificationParameters.destroy({
            where: { id }
        });

        if (deleted === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Classification parameter with ID ${id} not found`
            });
        }

        return res.json({
            status: 'success',
            message: 'Classification parameter deleted successfully'
        });
    } catch (error) {
        logger.error(`Error deleting classification parameter ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete classification parameter'
        });
    }
};

/**
 * Update classification champion parameters with values
 * Expected request body:
 * {
 *   classification_id: 1,
 *   champions: [
 *     {
 *       champion_id: 1,
 *       parameters: {
 *         parameter_id_1: parameter_value,
 *         parameter_id_2: parameter_value,
 *         ...
 *       }
 *     },
 *     ...
 *   ]
 * }
 */
const updateClassificationChampionParameters = async (req, res) => {
    try {
        const { classification_id, champions } = req.body;

        if (!classification_id || !champions || !Array.isArray(champions)) {
            return res.status(400).json({
                status: 'error',
                message: 'Classification ID and champions array are required'
            });
        }

        // Verify classification exists
        const classification = await ClassificationList.findByPk(classification_id);
        if (!classification) {
            return res.status(404).json({
                status: 'error',
                message: `Classification with ID ${classification_id} not found`
            });
        }

        // Get all parameters for this classification to validate parameter_ids
        const classificationParameters = await ClassificationParameters.findAll({
            where: { classification_id }
        });
        const validParameterIds = classificationParameters.map(p => p.id);

        let processedChampions = 0;
        let totalParametersUpdated = 0;

        // Process each champion
        for (const championData of champions) {
            const { champion_id, parameters } = championData;

            if (!champion_id || !parameters || typeof parameters !== 'object') {
                logger.warn(`Skipping invalid champion data: ${JSON.stringify(championData)}`);
                continue;
            }

            // Verify champion exists
            const champion = await Champion.findByPk(champion_id);
            if (!champion) {
                logger.warn(`Champion with ID ${champion_id} not found, skipping`);
                continue;
            }

            // Process each parameter for this champion
            for (const [parameter_id, parameter_value] of Object.entries(parameters)) {
                const paramId = parseInt(parameter_id);
                const value = parseFloat(parameter_value as any);

                // Validate parameter belongs to this classification
                if (!validParameterIds.includes(paramId)) {
                    logger.warn(`Parameter ID ${paramId} does not belong to classification ${classification_id}, skipping`);
                    continue;
                }

                if (value === 0) {
                    // Remove the parameter value if it exists when value is 0
                    const deleted = await ClassificationChampionParameterValue.destroy({
                        where: {
                            parameter_id: paramId,
                            champion_id: champion_id
                        }
                    });

                    if (deleted > 0) {
                        totalParametersUpdated++;
                    }
                } else {
                    // Create or update the parameter value
                    const [parameterValue, created] = await ClassificationChampionParameterValue.findOrCreate({
                        where: {
                            parameter_id: paramId,
                            champion_id: champion_id
                        },
                        defaults: {
                            parameter_id: paramId,
                            champion_id: champion_id,
                            value: value
                        }
                    });

                    if (!created && parameterValue.value !== value) {
                        // Update existing value if it's different
                        parameterValue.value = value;
                        await parameterValue.save();
                        totalParametersUpdated++;
                    } else if (created) {
                        totalParametersUpdated++;
                    }
                }
            }

            processedChampions++;
        }

        return res.json({
            status: 'success',
            message: 'Classification champion parameters updated successfully',
            data: {
                classification_id,
                processed_champions: processedChampions,
                total_parameters_updated: totalParametersUpdated
            }
        });

    } catch (error) {
        logger.error(`Error updating classification champion parameters: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update classification champion parameters'
        });
    }
};

// Add this to the module.exports at the end of the file
module.exports = {
    // Classification methods
    getAllClassifications,
    getClassificationById,
    createClassification,
    renameClassification,
    deleteClassification,
    getClassificationFullInfo,
    
    // Classification parameter methods
    getAllClassificationParameters,
    getClassificationParametersByClassificationId,
    getClassificationParameterById,
    createClassificationParameter,
    updateClassificationParameter,
    deleteClassificationParameter,
    
    // Champion parameter values
    updateClassificationChampionParameters
};