const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ClassificationChampionParameterValue = sequelize.define('ClassificationChampionParameterValue', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        parameter_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'classification_parameters',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        champion_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'champions',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        }
    }, {
        tableName: 'classification_champion_parameter_value',
        schema: 'public',
        timestamps: false,
        underscored: true,

        indexes: [
            {
                name: 'idx_classification_champion_parameter_id',
                fields: ['parameter_id']
            },
            {
                name: 'idx_classification_champion_champion_id',
                fields: ['champion_id']
            },
            {
                name: 'idx_classification_champion_parameter_champion',
                fields: ['parameter_id', 'champion_id'], // compound index for the most common queries
                unique: true // prevents duplicate assignments of same parameter to same champion
            },
            {
                name: 'idx_classification_champion_champion_parameter',
                fields: ['champion_id', 'parameter_id'] // reverse compound index for champion-centric queries
            }
        ]
    });

    ClassificationChampionParameterValue.associate = (models) => {
        ClassificationChampionParameterValue.belongsTo(models.ClassificationParameters, {
            foreignKey: 'parameter_id',
            as: 'parameter'
        });

        ClassificationChampionParameterValue.belongsTo(models.Champion, {
            foreignKey: 'champion_id',
            as: 'champion'
        });
    };

    return ClassificationChampionParameterValue;
};