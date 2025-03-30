// models/vod.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const VOD = sequelize.define('VOD', {
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
        parameter: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'vods',
        schema: 'public',
        timestamps: false,
        underscored: true
    });

    VOD.associate = (models) => {
        VOD.belongsTo(models.Game, {
            foreignKey: 'game_id',
            as: 'game'
        });
    };

    return VOD;
};
