// models/champion.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Champion = sequelize.define('Champion', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // equivalent to serial4 in PostgreSQL
            allowNull: false
        },
        name: {
            type: DataTypes.STRING, // equivalent to varchar in PostgreSQL
            allowNull: true,
            defaultValue: ''
        },
        role: {
            type: DataTypes.INTEGER, // equivalent to int2 in PostgreSQL
            allowNull: false
        },
        image: {
            type: DataTypes.STRING, // equivalent to varchar in PostgreSQL
            allowNull: true,
            defaultValue: ''
        }
    }, {
        tableName: 'champions', // Explicitly set the table name
        schema: 'public', // Schema name
        timestamps: false, // Disable createdAt and updatedAt fields
        underscored: true, // Use snake_case for column names
    });

    // Define associations here if needed

    Champion.associate = (models) => {
        // One-to-Many: One Champion can be picked in many game positions
        Champion.hasMany(models.Game, {
            foreignKey: 'pick1',
            as: 'gamesAsPick1'
        });

        Champion.hasMany(models.Game, {
            foreignKey: 'pick2',
            as: 'gamesAsPick2'
        });

        Champion.hasMany(models.Game, {
            foreignKey: 'pick3',
            as: 'gamesAsPick3'
        });

        Champion.hasMany(models.Game, {
            foreignKey: 'pick4',
            as: 'gamesAsPick4'
        });

        Champion.hasMany(models.Game, {
            foreignKey: 'pick5',
            as: 'gamesAsPick5'
        });

        Champion.hasMany(models.Game, {
            foreignKey: 'pick6',
            as: 'gamesAsPick6'
        });

        Champion.hasMany(models.Game, {
            foreignKey: 'pick7',
            as: 'gamesAsPick7'
        });

        Champion.hasMany(models.Game, {
            foreignKey: 'pick8',
            as: 'gamesAsPick8'
        });

        Champion.hasMany(models.Game, {
            foreignKey: 'pick9',
            as: 'gamesAsPick9'
        });

        Champion.hasMany(models.Game, {
            foreignKey: 'pick10',
            as: 'gamesAsPick10'
        });
    };
    return Champion;
};
