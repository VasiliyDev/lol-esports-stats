// createDb.js
const models = require('./models');
const logger = require('./utils/logger');

async function createDatabase() {
    try {
        console.log('Creating database tables...');

        // Disable foreign key checks temporarily or use deferred constraints
        const sequelize = models.sequelize;

        // For PostgreSQL, we need a careful approach to handle dependencies
        // First, sync models that don't have foreign key dependencies
        await models.Region.sync({ force: true });
        await models.Team.sync({ force: true });
        await models.Category.sync({ force: true });
        await models.Player.sync({ force: true });

        // Then sync models with simple dependencies
        await models.League.sync({ force: true });
        await models.Champion.sync({ force: true });
        await models.Tournament.sync({ force: true });
        await models.Match.sync({ force: true });
        await models.Game.sync({ force: true });
        await models.Collection.sync({ force: true });

        // Finally sync models with complex dependencies
        await models.TeamMatch.sync({ force: true });
        await models.VOD.sync({ force: true });
        await models.GamePlayer.sync({ force: true });
        await models.CollectionGameRelation.sync({ force: true });

        console.log('Database tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error(`Error creating database tables: ${error.message}`);
        process.exit(1);
    }
}

createDatabase();
