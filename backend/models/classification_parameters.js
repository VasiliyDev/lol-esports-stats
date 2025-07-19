const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ClassificationParameters = sequelize.define('ClassificationParameters', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        classification_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'classification_list',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'classification_parameters',
        schema: 'public',
        timestamps: false,
        underscored: true,

        indexes: [
            {
                name: 'idx_classification_parameters_classification_id',
                fields: ['classification_id']
            },
            {
                name: 'idx_classification_parameters_name',
                fields: ['name']
            },
            {
                name: 'idx_classification_parameters_classification_name',
                fields: ['classification_id', 'name'] // compound index for queries by classification and name
            }
        ]
    });

    ClassificationParameters.associate = (models) => {
        ClassificationParameters.belongsTo(models.ClassificationList, {
            foreignKey: 'classification_id',
            as: 'classification'
        });

        ClassificationParameters.hasMany(models.ClassificationChampionParameterValue, {
            foreignKey: 'parameter_id',
            as: 'championValues',
            onDelete: 'CASCADE'
        });
    };

    return ClassificationParameters;
};