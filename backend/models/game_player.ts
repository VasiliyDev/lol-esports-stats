const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const GamePlayer = sequelize.define('GamePlayer', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        game_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'games',
                key: 'id'
            }
        },
        player_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'players',
                key: 'id'
            }
        },
        champion_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'champions',
                key: 'id'
            }
        },
        team_side: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['blue', 'red']]
            }
        },
        position: {
            type: DataTypes.STRING,
            allowNull: false
        },
        participant_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'game_players',
        schema: 'public',
        timestamps: false,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['game_id', 'player_id']
            },
            {
                name: 'game_players_game_id_idx',
                fields: ['game_id']
            },
            {
                name: 'game_players_player_id_idx',
                fields: ['player_id']
            },
            {
                name: 'game_players_champion_id_idx',
                fields: ['champion_id']
            }
        ]
    });

    GamePlayer.associate = (models) => {
        GamePlayer.belongsTo(models.Game, {
            foreignKey: 'game_id',
            as: 'game'
        });
        GamePlayer.belongsTo(models.Player, {
            foreignKey: 'player_id',
            as: 'player'
        });
        GamePlayer.belongsTo(models.Champion, {
            foreignKey: 'champion_id',
            as: 'champion'
        });
    };

    return GamePlayer;
};
