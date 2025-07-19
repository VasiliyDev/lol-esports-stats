
// services/leagueService.js
const models = require('../../models');
const logger = require('../../utils/logger');


/**
 * Drop regions table and all its associated data
 * @returns {Promise<boolean>} Success status
 */
const dropRegions = async () => {
    try {
        const sequelize = models.sequelize;

        // Check if table exists before dropping
        const [results] = await sequelize.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'regions'
            );
        `);

        const tableExists = results[0].exists;

        if (tableExists) {
            // Drop table if it exists
            await sequelize.query('DROP TABLE IF EXISTS regions CASCADE;');
            logger.info('Successfully dropped regions table');
        } else {
            logger.info('Regions table does not exist, skipping drop');
        }

        // Recreate only the specific models rather than all models
        await models.Region.sync({ force: true });
        // Optionally sync League model as well if needed
        await models.League.sync({ force: true });

        logger.info('Successfully recreated regions table');
        return true;
    } catch (error) {
        logger.error(`Error dropping regions table: ${error.message}`);
        throw error;
    }
};
/**
 * Process leagues data from Riot API
 * @param {Object} data - The leagues data from Riot API
 * @returns {Promise<Object>} - Stats about processed leagues
 */
const processLeaguesData = async (data) => {
    if (!data || !data.leagues || !Array.isArray(data.leagues)) {
        throw new Error('Invalid leagues data format');
    }

    const stats = {
        regionsCreated: 0,
        regionsSkipped: 0,
        leaguesCreated: 0,
        leaguesSkipped: 0,
        errors: []
    };

    try {
        // Process each league
        for (const leagueData of data.leagues) {
            try {
                // 1. Check if region exists, create if not
                const regionName = leagueData.region;
                let region = await findOrCreateRegion(regionName);

                if (region.created) {
                    stats.regionsCreated++;
                } else {
                    stats.regionsSkipped++;
                }

                // 2. Check if league exists, create if not
                const existingLeague = await models.League.findOne({
                    where: { slug: leagueData.slug }
                });

                if (!existingLeague) {
                    await models.League.create({
                        name: leagueData.name,
                        slug: leagueData.slug,
                        region: region.id,
                        image: leagueData.image || null,
                        priority: leagueData.priority || 0,
                        lol_id: leagueData.id
                    });
                    stats.leaguesCreated++;
                } else {
                    stats.leaguesSkipped++;
                }
            } catch (error) {
                logger.error(`Error processing league ${leagueData.name}: ${error.message}`);
                stats.errors.push({
                    league: leagueData.name,
                    error: error.message
                });
            }
        }

        return stats;
    } catch (error) {
        logger.error(`Error in bulk league processing: ${error.message}`);
        throw error;
    }
};

/**
 * Find an existing region by name or create a new one
 * @param {string} regionName - The name of the region
 * @returns {Promise<Object>} - The region object and whether it was created
 */
const findOrCreateRegion = async (regionName) => {
    try {
        // Convert region name to slug (lowercase, replace spaces with underscores)
        const regionSlug = regionName.toLowerCase().replace(/\s+/g, '_');

        // Look for existing region
        let region = await models.Region.findOne({
            where: { name: regionName }
        });

        // If region doesn't exist, create it
        if (!region) {
            region = await models.Region.create({
                name: regionName,
                slug: regionSlug
            });
            return { id: region.id, created: true };
        }

        return { id: region.id, created: false };
    } catch (error) {
        logger.error(`Error finding/creating region ${regionName}: ${error.message}`);
        throw error;
    }
};

module.exports = {
    processLeaguesData,
    dropRegions
};
