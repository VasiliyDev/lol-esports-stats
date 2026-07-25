// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const serverConfig = require('./config/server');
const dbService = require('./services/dvService');
const logger = require('./utils/logger');

// Initialize Express app
const app = express();
const PORT = serverConfig.port;

// Middleware
app.use(cors(serverConfig.corsOptions));
app.use(helmet(serverConfig.helmetOptions));
app.use(express.json());

// Register routes
require('./routes')(app);

// Start server
app.listen(PORT, async () => {
    logger.info(`Server running on port ${PORT}`);

    // Initial database connection with retry logic
    const connected = await dbService.connectWithRetry();

    if (!connected) {
        logger.warn('Server is running but database connection failed after multiple attempts.');
        logger.info('The application will continue to try connecting when endpoints are accessed.');
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: any) => {
    logger.error(`Unhandled rejection: ${error.message}`);
    // Graceful shutdown if needed
    // process.exit(1);
});

module.exports = app; // Export for testing
