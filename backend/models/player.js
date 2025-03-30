// models/player.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Player = sequelize.define('Player', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        esports_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'players',
        schema: 'public',
        timestamps: true,
        underscored: true
    });

    Player.associate = (models) => {
        Player.hasMany(models.GamePlayer, {
            foreignKey: 'player_id',
            as: 'gamePlayers'
        });
    };

    return Player;
};
