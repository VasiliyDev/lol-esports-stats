// models/tournament.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Tournament = sequelize.define('Tournament', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        lol_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            index: true
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            index: true
        },
        league: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'leagues',
                key: 'id'
            }
        }
    }, {
        tableName: 'tournaments',
        schema: 'public',
        timestamps: false,
        underscored: true,
        indexes: [
            // Composite index for date range queries
            {
                name: 'tournaments_date_range_idx',
                fields: ['start_date', 'end_date']
            }
        ]
    });

    Tournament.associate = (models) => {
        // Tournament belongs to a League
        Tournament.belongsTo(models.League, {
            foreignKey: 'league',
            as: 'leagueData'
        });
        Tournament.hasMany(models.Match, {
            foreignKey: 'tournament_id',
            as: 'matches',
            onDelete: 'CASCADE'
        });
    };

    return Tournament;
};
