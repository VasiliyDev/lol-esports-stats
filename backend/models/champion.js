// models/Champion.js
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    const Champion = sequelize.define('Champion', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        category: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'categories',
                key: 'id'
            }
        }
    }, {
        tableName: 'champions',
        schema: 'public',
        timestamps: false,
        underscored: true,
    });

    Champion.associate = (models) => {


        Champion.hasMany(models.GamePlayer, {
            foreignKey: 'champion_id',
            as: 'gamePlayers'
        });

        Champion.hasMany(models.FrameChampionPlayerGold, {
            foreignKey: 'champion_id',
            as: 'championsGold'
        });

    };

    return Champion;
};