const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Category = sequelize.define('Category', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'categories', // Explicitly set the table name
        schema: 'public',
        timestamps: false,
        underscored: true,
    });

    Category.associate = (models) => {
        // One Category has many Champions
        Category.hasMany(models.Champion, {
            foreignKey: 'category',
            as: 'champions'
        });
    };

    return Category;
};
