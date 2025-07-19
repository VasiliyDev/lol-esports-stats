const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ClassificationList = sequelize.define('ClassificationList', {
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
        tableName: 'classification_list',
        schema: 'public',
        timestamps: false,
        underscored: true,

        indexes: [
            {
                name: 'idx_classification_list_name',
                fields: ['name']
            }
        ]
    });

    ClassificationList.associate = (models) => {
        ClassificationList.hasMany(models.ClassificationParameters, {
            foreignKey: 'classification_id',
            as: 'parameters',
            onDelete: 'CASCADE'
        });
    };

    return ClassificationList;
};