// models/game.js
const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    const Game = sequelize.define('Game', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // equivalent to serial4 in PostgreSQL
            allowNull: false
        },
        event: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            references: {
                model: 'events', // References the events table
                key: 'id'        // References the id column
            }
        },
        pick1: {
            type: DataTypes.INTEGER, // equivalent to int2 in PostgreSQL
            allowNull: false,
            references: {
                model: 'champions',
                key: 'id'
            }
        },
        pick2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'champions',
                key: 'id'
            }
        },
        pick3: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'champions',
                key: 'id'
            }
        },
        pick4: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'champions',
                key: 'id'
            }
        },
        pick5: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'champions',
                key: 'id'
            }
        },
        pick6: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'champions',
                key: 'id'
            }
        },
        pick7: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'champions',
                key: 'id'
            }
        },
        pick8: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'champions',
                key: 'id'
            }
        },
        pick9: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'champions',
                key: 'id'
            }
        },
        pick10: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'champions',
                key: 'id'
            }
        },
        link: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        winner: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        team1: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        team2: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        }
    }, {
        tableName: 'games', // Explicitly set the table name
        schema: 'public', // Schema name
        timestamps: false, // Disable createdAt and updatedAt fields
        underscored: true, // Use snake_case for column names
    });

    // Define associations here if needed
    Game.associate = (models) => {
        // Many-to-One: Many Games belong to one Event
        Game.belongsTo(models.Event, {
            foreignKey: 'event', // The column in Game model that references Event
            as: 'eventDetails'   // Alias for accessing the related Event
        });
        Game.belongsTo(models.Champion, {
            foreignKey: 'pick1',
            as: 'champion1'
        });

        Game.belongsTo(models.Champion, {
            foreignKey: 'pick2',
            as: 'champion2'
        });

        Game.belongsTo(models.Champion, {
            foreignKey: 'pick3',
            as: 'champion3'
        });

        Game.belongsTo(models.Champion, {
            foreignKey: 'pick4',
            as: 'champion4'
        });

        Game.belongsTo(models.Champion, {
            foreignKey: 'pick5',
            as: 'champion5'
        });

        Game.belongsTo(models.Champion, {
            foreignKey: 'pick6',
            as: 'champion6'
        });

        Game.belongsTo(models.Champion, {
            foreignKey: 'pick7',
            as: 'champion7'
        });

        Game.belongsTo(models.Champion, {
            foreignKey: 'pick8',
            as: 'champion8'
        });

        Game.belongsTo(models.Champion, {
            foreignKey: 'pick9',
            as: 'champion9'
        });

        Game.belongsTo(models.Champion, {
            foreignKey: 'pick10',
            as: 'champion10'
        });

        Game.belongsToMany(models.Collection, {
            through: models.CollectionGameRelation,
            foreignKey: 'game_id',
            otherKey: 'collection_id',
            as: 'collections'
        });


    };


    return Game;
};
