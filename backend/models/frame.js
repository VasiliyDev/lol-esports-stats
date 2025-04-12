const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Frame = sequelize.define('Frame', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        game_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'games',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'frames',
        timestamps: false,
        underscored: true,

        // Add a clear and efficient index to timestamp here
        indexes: [
            {
                name: 'idx_frames_timestamp',
                fields: ['timestamp']
            },
            {
                name: 'idx_frames_game_id_timestamp',
                fields: ['game_id', 'timestamp'] // compound index for frequent game-specific timestamp queries
            }
        ]
    });

    Frame.associate = models => {
        Frame.belongsTo(models.Game, {
            foreignKey: 'game_id',
            as: 'game'
        });

        Frame.hasMany(models.FrameChampionPlayerGold, {
            foreignKey: 'frame_id',
            as: 'championsGold',
            onDelete: 'CASCADE',
            hooks: true
        });
        Frame.hasMany(models.FrameEvent, {
            foreignKey: 'frame_id',
            as: 'frameEvents',
            onDelete: 'CASCADE'
        });
    };

    return Frame;
};