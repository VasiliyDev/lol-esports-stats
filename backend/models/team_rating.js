// models/team_rating.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TeamRating = sequelize.define('TeamRating', {
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
        date_calculated: {
            type: DataTypes.DATE,
            allowNull: false
        },
        gpr_score: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        elo: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        rank: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    }, {
        tableName: 'team_ratings',
        schema: 'public',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['team_id', 'date_calculated']
            }
        ]
    });

    TeamRating.associate = (models) => {
        TeamRating.belongsTo(models.Team, {
            foreignKey: 'team_id',
            as: 'team'
        });
    };

    return TeamRating;
};