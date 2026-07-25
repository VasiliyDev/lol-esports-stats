const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Tournament = sequelize.define('Tournament', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        lol_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        league: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'leagues',
                key: 'id'
            }
        }
    }, {
        tableName: 'tournaments',
        schema: 'public',
        timestamps: false,
        underscored: true,

        indexes: [
            {
                name: 'tournaments_date_range_idx', // composite index
                fields: ['start_date', 'end_date']
            },
            {
                name: 'idx_tournaments_start_date', // explicitly index start_date clearly
                fields: ['start_date']
            },
            {
                name: 'idx_tournaments_end_date', // explicitly index end_date clearly
                fields: ['end_date']
            }
        ]
    });

    Tournament.associate = (models) => {
        Tournament.belongsTo(models.League, {
            foreignKey: 'league',
            as: 'leagueData'
        });
        Tournament.hasMany(models.Match, {
            foreignKey: 'tournament_id',
            as: 'matches',
            onDelete: 'CASCADE'
        });
    };

    return Tournament;
};