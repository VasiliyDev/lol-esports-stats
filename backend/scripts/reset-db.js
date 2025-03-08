const { sequelize } = require('../models');

async function resetDatabase() {
    try {
        console.log('Starting database reset...');

        // This will drop all tables and recreate them based on your models
        await sequelize.sync({ force: true });

        console.log('Database reset successful!');
        process.exit(0);
    } catch (error) {
        console.error('Database reset failed:', error);
        process.exit(1);
    }
}

resetDatabase();

