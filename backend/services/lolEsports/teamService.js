// services/lolEsports/teamService.js
const models = require('../../models');
const logger = require('../../utils/logger');

const findOrCreateTeam = async (teamData) => {
    if (!teamData || !teamData.code) {
        throw new Error('Invalid team data or missing team code');
    }

    try {
        // Find team by code
        let team = await models.Team.findOne({
            where: { code: teamData.code }
        });

        // If team doesn't exist, create it
        if (!team) {
            team = await models.Team.create({
                code: teamData.code,
                name: teamData.name || teamData.code,
                image: teamData.image || null
            });
            return { team, created: true };
        }

        // If team exists but data has changed, update it
        const needsUpdate =
            (teamData.name && team.name !== teamData.name) ||
            (teamData.image && team.image !== teamData.image);

        if (needsUpdate) {
            await team.update({
                name: teamData.name || team.name,
                image: teamData.image || team.image
            });
            return { team, created: false, updated: true };
        }

        return { team, created: false, updated: false };
    } catch (error) {
        logger.error(`Error finding/creating team ${teamData.code}: ${error.message}`);
        throw error;
    }
};

const associateTeamsWithMatch = async (matchData, matchId) => {
    const stats = {
        teamsCreated: 0,
        teamsUpdated: 0,
        teamsAssociated: 0
    };

    try {
        if (!matchData.teams || !Array.isArray(matchData.teams) || matchData.teams.length < 2) {
            return stats;
        }

        // Process each team in the match
        for (let i = 0; i < matchData.teams.length; i++) {
            const teamData = matchData.teams[i];

            // Find or create the team
            const { team, created, updated } = await findOrCreateTeam(teamData);

            if (created) {
                stats.teamsCreated++;
            } else if (updated) {
                stats.teamsUpdated++;
            }

            // Create or update the team-match association
            const [teamMatch, teamMatchCreated] = await models.TeamMatch.findOrCreate({
                where: {
                    team_id: team.id,
                    match_id: matchId
                },
                defaults: {
                    side: i === 0 ? 'BLUE' : 'RED',
                    wins: teamData.result ? teamData.result.gameWins : 0
                }
            });

            if (!teamMatchCreated) {
                // Update existing team-match association
                await teamMatch.update({
                    wins: teamData.result ? teamData.result.gameWins : teamMatch.wins
                });
            }

            stats.teamsAssociated++;
        }

        return stats;
    } catch (error) {
        logger.error(`Error associating teams with match ${matchId}: ${error.message}`);
        throw error;
    }
};

module.exports = {
    findOrCreateTeam,
    associateTeamsWithMatch
};
