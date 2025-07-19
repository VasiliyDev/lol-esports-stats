const models = require('./models');
const logger = require('./utils/logger');

async function createDatabase() {
    try {
        console.log('Creating database tables...');

        const sequelize = models.sequelize;

        console.log('Loaded models:', Object.keys(models));

        // Synch non-dependent models
        await models.Region.sync({ force: true });
        await models.Team.sync({ force: true });
        await models.Category.sync({ force: true });
        await models.Player.sync({ force: true });
        await models.ClassificationList.sync({ force: true }); // No dependencies

        // Simple dependent models
        await models.League.sync({ force: true });
        await models.Champion.sync({ force: true });
        await models.Tournament.sync({ force: true });
        await models.Match.sync({ force: true });
        await models.Game.sync({ force: true });
        await models.Collection.sync({ force: true });
        await models.ClassificationParameters.sync({ force: true }); // Depends on ClassificationList

        // Complex dependent models
        await models.TeamMatch.sync({ force: true });
        await models.VOD.sync({ force: true });
        await models.GamePlayer.sync({ force: true });
        await models.CollectionGameRelation.sync({ force: true });
        await models.Frame.sync({ force: true });

        await models.FrameChampionPlayerGold.sync({ force: true });
        await models.FrameEvent.sync({ force: true });
        await models.TeamRating.sync({force:true});

        // Classifications - most complex (depends on both ClassificationParameters and Champion)
        await models.ClassificationChampionParameterValue.sync({ force: true });

        console.log('Database tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error(`Error creating database tables: ${error.message}`);
        process.exit(1);
    }
}

createDatabase();