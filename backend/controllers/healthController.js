// controllers/healthController.js
const dbService = require('../services/dvService');
const logger = require('../utils/logger');

/**
 * Check application health including database connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkHealth = async (req, res) => {
    try {
        const dbConnected = await dbService.checkHealth();

        if (dbConnected) {
            return res.json({
                status: 'ok',
                db: 'connected'
            });
        }

        // Attempt to reconnect
        logger.info('Health check detected database disconnection. Attempting to reconnect...');
        const reconnected = await dbService.reconnect(3, 2000);

        if (reconnected) {
            return res.json({
                status: 'ok',
                db: 'reconnected'
            });
        } else {
            return res.status(500).json({
                status: 'error',
                db: 'disconnected'
            });
        }
    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Welcome endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const welcome = (req, res) => {
    res.json({
        message: 'Welcome to the Node.js, PostgreSQL, Docker API'
    });
};

module.exports = {
    checkHealth,
    welcome
};
