// routes/index.js
const healthRoutes = require('./healthRoutes');
const eventRoutes = require('./eventRoutes');
const gameRoutes = require('./gameRoutes')

module.exports = (app) => {
    // Register all routes
    app.use('/', healthRoutes);
    app.use('/api/events', eventRoutes);
    app.use('/api/games', gameRoutes)

    // Add other route groups here
    // app.use('/api/users', userRoutes);
    // app.use('/api/posts', postRoutes);

    // 404 handler for undefined routes
    app.use('*', (req, res) => {
        res.status(404).json({
            status: 'error',
            message: 'Route not found'
        });
    });
};
