// Update to your game.js model
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Game = sequelize.define('Game', {
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
        match_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'matches',
                key: 'id'
            }
        },
        game_number: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true
        },
        blue_team_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'teams',
                key: 'id'
            }
        },
        red_team_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'teams',
                key: 'id'
            }
        },
        winner_team_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'teams',
                key: 'id'
            }
        },
        patch_version: {
            type: DataTypes.STRING,
            allowNull: true
        },
        game_duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Game duration in seconds'
        },
        game_start_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Timestamp when the game started'
        }
    }, {
        tableName: 'games',
        schema: 'public',
        timestamps: false,
        underscored: true,
        indexes: [
            {
                name: 'games_match_id_idx',
                fields: ['match_id']
            }
        ]
    });

    Game.associate = (models) => {
        Game.belongsTo(models.Match, {
            foreignKey: 'match_id',
            as: 'match'
        });
        Game.belongsTo(models.Team, {
            foreignKey: 'blue_team_id',
            as: 'blueTeam'
        });
        Game.belongsTo(models.Team, {
            foreignKey: 'red_team_id',
            as: 'redTeam'
        });
        Game.belongsTo(models.Team, {
            foreignKey: 'winner_team_id',
            as: 'winnerTeam'
        });
        Game.hasMany(models.VOD, {
            foreignKey: 'game_id',
            as: 'vods'
        });
        Game.hasMany(models.GamePlayer, {
            foreignKey: 'game_id',
            as: 'gamePlayers'
        });
    };

    return Game;
};
