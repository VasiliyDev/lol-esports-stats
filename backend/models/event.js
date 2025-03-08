// models/event.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Event = sequelize.define('Event', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // equivalent to serial4 in PostgreSQL
            allowNull: false
        },
        parsed: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        parsed_at: {
            type: DataTypes.DATE, // equivalent to timestamp in PostgreSQL
            allowNull: true
        },
        link: {
            type: DataTypes.STRING, // equivalent to varchar in PostgreSQL
            allowNull: true,
            defaultValue: null
        },
        name: {
            type: DataTypes.STRING, // equivalent to varchar in PostgreSQL
            allowNull: true,
            defaultValue: null
        }
    }, {
        tableName: 'events', // Explicitly set the table name
        schema: 'public', // Schema name from your screenshot
        timestamps: false, // Disable createdAt and updatedAt fields since they're not in the original table
        underscored: true, // Use snake_case for column names
    });

    // Define associations here if needed
    Event.associate = (models) => {
        // One-to-Many: One Event has many Games
        Event.hasMany(models.Game, {
            foreignKey: 'event', // The column in Game that references this Event
            as: 'games'          // Alias for accessing related Games
        });
    };
    return Event;
};
