// models/FramesChampionsGold.js
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    const FramesChampionsGold = sequelize.define('FrameChampionPlayerGold', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        frame_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'frames', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        position_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        gold_amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        champion_id: {
            type: DataTypes.INTEGER,
            allowNull: true,  // SET NULL on delete requires nullable
            references: { model: 'champions', key: 'id' },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        },
        player_id: {
            type: DataTypes.INTEGER,
            allowNull: true,  // SET NULL on delete requires nullable
            references: { model: 'players', key: 'id' },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        },
    }, {
        tableName: 'frames_champions_gold',
        timestamps: false,
        underscored: true,
    });

    FramesChampionsGold.associate = (models) => {
        FramesChampionsGold.belongsTo(models.Frame, {
            foreignKey: 'frame_id',
            as: 'frame',
        });
        FramesChampionsGold.belongsTo(models.Champion, {
            foreignKey: 'champion_id',
            as: 'champion',
        });
        FramesChampionsGold.belongsTo(models.Player, {
            foreignKey: 'player_id',
            as: 'player',
        });
    };

    return FramesChampionsGold;
};