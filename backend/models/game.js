const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Game = sequelize.define('Game', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        lol_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        match_id: {
            type: DataTypes.INTEGER,
            references: { model: 'matches', key: 'id' },
        },
        game_number: DataTypes.INTEGER,
        state: DataTypes.STRING,
        blue_team_id: {
            type: DataTypes.INTEGER,
            references: { model: 'teams', key: 'id' },
        },
        red_team_id: {
            type: DataTypes.INTEGER,
            references: { model: 'teams', key: 'id' },
        },
        winner_team_id: {
            type: DataTypes.INTEGER,
            references: { model: 'teams', key: 'id' },
        },
        patch_version: DataTypes.STRING,
        game_duration: DataTypes.INTEGER,
        game_start_date: DataTypes.DATE,
    }, {
        tableName: 'games',
        schema: 'public',
        timestamps: false,
        underscored: true,
    });

    Game.associate = (models) => {
        Game.belongsTo(models.Match, {
            foreignKey: 'match_id',
            as: 'match',
        });

        Game.belongsTo(models.Team, { as: 'blueTeam', foreignKey: 'blue_team_id' });
        Game.belongsTo(models.Team, { as: 'redTeam', foreignKey: 'red_team_id' });
        Game.belongsTo(models.Team, { as: 'winnerTeam', foreignKey: 'winner_team_id' });

        Game.hasMany(models.VOD, {
            foreignKey: 'game_id',
            as: 'vods',
        });

        Game.hasMany(models.GamePlayer, {
            foreignKey: 'game_id',
            as: 'gamePlayers',
        });

        Game.belongsToMany(models.Collection, {
            through: models.CollectionGameRelation,
            as: 'collections',
            foreignKey: 'game_id',
            otherKey: 'collection_id',
        });
    };

    return Game;
};