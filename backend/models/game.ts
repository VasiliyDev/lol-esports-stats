const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Game = sequelize.define('Game', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        lol_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        match_id: {
            type: DataTypes.INTEGER,
            references: { model: 'matches', key: 'id' },
        },
        game_number: DataTypes.INTEGER,
        state: DataTypes.STRING,
        blue_team_id: {
            type: DataTypes.INTEGER,
            references: { model: 'teams', key: 'id' },
        },
        red_team_id: {
            type: DataTypes.INTEGER,
            references: { model: 'teams', key: 'id' },
        },
        winner_team_id: {
            type: DataTypes.INTEGER,
            references: { model: 'teams', key: 'id' },
        },
        patch_version: DataTypes.STRING,

        // Properly defined game_start_date and game_finish_date
        game_start_date: {
            type: DataTypes.DATE,
            allowNull: true,  // usually true, can be false if you're certain
        },

        game_finish_date: {
            type: DataTypes.DATE,
            allowNull: true,  // usually true as game may not yet be finished
        }

    }, {
        tableName: 'games',
        schema: 'public',
        timestamps: false,
        underscored: true,

        // Add indexes for improving query performance on important date fields
        indexes: [
            {
                name: 'idx_games_game_start_date',
                fields: ['game_start_date']
            },
            {
                name: 'idx_games_game_finish_date',
                fields: ['game_finish_date']
            }
        ]
    });

    Game.associate = (models) => {
        // belongsTo relations
        Game.belongsTo(models.Match, {
            foreignKey: 'match_id',
            as: 'match',
        });

        Game.belongsTo(models.Team, {
            as: 'blueTeam',
            foreignKey: 'blue_team_id'
        });
        Game.belongsTo(models.Team, {
            as: 'redTeam',
            foreignKey: 'red_team_id'
        });
        Game.belongsTo(models.Team, {
            as: 'winnerTeam',
            foreignKey: 'winner_team_id'
        });

        // hasMany relations (cascade delete with Sequelize hooks)
        Game.hasMany(models.VOD, {
            foreignKey: 'game_id',
            as: 'vods',
            onDelete: 'CASCADE',
            hooks: true,
        });

        Game.hasMany(models.GamePlayer, {
            foreignKey: 'game_id',
            as: 'gamePlayers',
            onDelete: 'CASCADE',
            hooks: true,
        });

        Game.hasMany(models.Frame, {
            foreignKey: 'game_id',
            as: 'framesPlayer',
            onDelete: 'CASCADE',
            hooks: true,
        });

    };

    return Game;
};