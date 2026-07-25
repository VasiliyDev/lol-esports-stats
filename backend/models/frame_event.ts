// models/frameEvent.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const FrameEvent = sequelize.define('FrameEvent', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        frame_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'frames',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        team_side: {
            type: DataTypes.ENUM('blue', 'red'),
            allowNull: false
        },
        event_type: {
            type: DataTypes.ENUM('inhibitor', 'dragon', 'baron', 'tower'),
            allowNull: false
        },
        change_value: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '1 for gain, -1 for loss'
        },
        dragon_type: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Type of dragon when event_type is dragon (cloud, ocean, mountain, infernal, elder)'
        }
    }, {
        tableName: 'frame_events',
        timestamps: true,
        underscored: true // Added this to match your Frame model's style
    });

    FrameEvent.associate = (models) => {
        FrameEvent.belongsTo(models.Frame, {
            foreignKey: 'frame_id',
            as: 'frame',
            onDelete: 'CASCADE'
        });
    };

    return FrameEvent;
};