// collection_game_relations.js model (junction table)
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CollectionGameRelation = sequelize.define('CollectionGameRelation', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        collection_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'collections',
                key: 'id'
            }
        },
        game_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'games',
                key: 'id'
            }
        }
    }, {
        tableName: 'collection_game_relations',
        schema: 'public',
        timestamps: false,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['collection_id', 'game_id']
            }
        ]
    });

    // CollectionGameRelation.associate = (models) => {
    //     // Define belongsTo relationships for both foreign keys
    //     CollectionGameRelation.belongsTo(models.Collection, {
    //         foreignKey: 'collection_id',
    //         onDelete: 'CASCADE'
    //     });
    //
    //     CollectionGameRelation.belongsTo(models.Game, {
    //         foreignKey: 'game_id',
    //         onDelete: 'CASCADE'
    //     });
    // };

    return CollectionGameRelation;
};
