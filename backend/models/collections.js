// collections.js model
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Collection = sequelize.define('Collection', {
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
        tableName: 'collections',
        schema: 'pg_default',
        timestamps: false,
        underscored: true,
    });

    Collection.associate = (models) => {
        // Many-to-many relationship with Games through CollectionGameRelation
        Collection.belongsToMany(models.Game, {
            through: models.CollectionGameRelation,
            foreignKey: 'collection_id',
            otherKey: 'game_id',
            as: 'games'
        });
    };

    return Collection;
};
