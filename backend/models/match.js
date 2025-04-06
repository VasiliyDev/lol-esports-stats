const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Match = sequelize.define('Match', {
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
        tournament_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tournaments',
                key: 'id'
            }
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: true
        },
        block_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        match_type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        strategy_type: {
            type: DataTypes.STRING,
            allowNull: true
        },
        strategy_count: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'matches',
        schema: 'public',
        timestamps: false,
        underscored: true,

        indexes: [
            {
                name: 'matches_tournament_id_idx',
                fields: ['tournament_id']
            },

            // Clearly add explicit index for the start_time field
            {
                name: 'matches_start_time_idx',
                fields: ['start_time']
            }
        ]
    });

    Match.associate = (models) => {
        Match.belongsTo(models.Tournament, {
            foreignKey: 'tournament_id',
            as: 'tournament'
        });
        Match.hasMany(models.Game, {
            foreignKey: 'match_id',
            as: 'games'
        });
        Match.hasMany(models.TeamMatch, {
            foreignKey: 'match_id',
            as: 'teamMatches'
        });
        Match.belongsToMany(models.Team, {
            through: models.TeamMatch,
            foreignKey: 'match_id',
            otherKey: 'team_id',
            as: 'teams'
        });
    };

    return Match;
};