// models/team.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Team = sequelize.define('Team', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'teams',
        schema: 'public',
        timestamps: true,
        underscored: true
    });

    Team.associate = (models) => {
        Team.hasMany(models.TeamMatch, {
            foreignKey: 'team_id',
            as: 'matches'
        });
    };

    return Team;
};
