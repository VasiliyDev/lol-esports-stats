const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Collection = sequelize.define('Collection', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'collections',
        schema: 'public',
        timestamps: true,
        underscored: true,
    });

    Collection.associate = (models) => {
        Collection.belongsToMany(models.Game, {
            through: models.CollectionGameRelation,
            as: 'games',
            foreignKey: 'collection_id',
            otherKey: 'game_id',
        });
    };

    return Collection;
};