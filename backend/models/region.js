const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Region = sequelize.define('Region', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'regions', // Explicitly set the table name
        schema: 'public',
        timestamps: false,
        underscored: true,
    });

    Region.associate = (models) => {
        // One Region has many Leagues
        Region.hasMany(models.League, {
            foreignKey: 'region',
            as: 'leagues',
            onDelete: 'CASCADE'
        });
    };

    return Region;
};
