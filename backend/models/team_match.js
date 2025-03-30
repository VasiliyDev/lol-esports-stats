// models/team_match.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TeamMatch = sequelize.define('TeamMatch', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        team_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'teams',
                key: 'id'
            }
        },
        match_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'matches',
                key: 'id'
            }
        },
        side: {
            type: DataTypes.STRING,
            allowNull: true
        },
        wins: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        tableName: 'team_matches',
        schema: 'public',
        timestamps: false,
        underscored: true,
        indexes: [
            {
                name: 'team_matches_team_match_idx',
                fields: ['team_id', 'match_id'],
                unique: true
            }
        ]
    });

    TeamMatch.associate = (models) => {
        TeamMatch.belongsTo(models.Team, {
            foreignKey: 'team_id',
            as: 'team'
        });
        TeamMatch.belongsTo(models.Match, {
            foreignKey: 'match_id',
            as: 'match'
        });
    };

    return TeamMatch;
};
