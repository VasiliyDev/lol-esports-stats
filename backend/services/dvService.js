// services/dbService.js
const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');
const logger = require('../utils/logger');

// Initialize Sequelize with configuration
const sequelize = new Sequelize(dbConfig);

/**
 * Connect to the database with retry mechanism
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise<boolean>} - Connection status
 */
const connectWithRetry = async (maxRetries = 5, delay = 5000) => {
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await sequelize.authenticate();
            logger.info('Database connected successfully');
            return true;
        } catch (error) {
            retries++;
            logger.error(`Connection attempt ${retries}/${maxRetries} failed: ${error.message}`);

            if (retries >= maxRetries) {
                logger.error('Max retries reached. Unable to connect to the database.');
                return false;
            }

            logger.info(`Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return false;
};

/**
 * Check database connection health
 * @returns {Promise<boolean>} - Connection status
 */
const checkHealth = async () => {
    try {
        await sequelize.authenticate();
        return true;
    } catch (error) {
        logger.error(`Database health check failed: ${error.message}`);
        return false;
    }
};

/**
 * Attempt to reconnect to the database
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise<boolean>} - Reconnection status
 */
const reconnect = async (maxRetries = 3, delay = 2000) => {
    logger.info('Attempting to reconnect to the database...');
    return await connectWithRetry(maxRetries, delay);
};

module.exports = {
    sequelize,
    connectWithRetry,
    checkHealth,
    reconnect
};
