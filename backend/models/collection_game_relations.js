// models/collection_game_relation.js example with explicit relations
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CollectionGameRelation = sequelize.define('CollectionGameRelation', {
        collection_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: { model: 'collections', key: 'id' },
        },
        game_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: { model: 'games', key: 'id' },
        },
    }, {
        tableName: 'collection_game_relations',
        schema: 'public',
        timestamps: false,
        underscored: true,
    });

    CollectionGameRelation.associate = (models) => {
        CollectionGameRelation.belongsTo(models.Collection, {
            foreignKey: 'collection_id',
            as: 'collection'
        });

        CollectionGameRelation.belongsTo(models.Game, {
            foreignKey: 'game_id',
            as: 'game'
        });
    };

    return CollectionGameRelation;
};