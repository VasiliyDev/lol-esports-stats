const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const League = sequelize.define('League', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        region: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'regions',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        },
        priority: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        lol_id: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'leagues', // Explicitly set the table name
        schema: 'public',
        timestamps: false,
        underscored: true,
    });

    League.associate = (models) => {
        // Many Leagues belong to one Region
        League.belongsTo(models.Region, {
            foreignKey: 'region',
            as: 'regionData'
        });
        League.hasMany(models.Tournament, {
            foreignKey: 'league',
            as: 'tournaments',
            onDelete: 'CASCADE'
        });
    };


    return League;
};
