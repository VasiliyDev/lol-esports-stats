const models = require("../models");

async function findOrCreateChampion(champion, roleIndex) {
    const championName = champion.championName;
    const championPicture = champion.championPicture;
    try {
        // Try to find the champion with the given name and role
        const [champion, created] = await models.Champion.findOrCreate({
            where: {
                name: championName,
                role: roleIndex
            },
            defaults: {
                image: championPicture
            }
        });

        // Return the champion object (either found or newly created)
        return  champion.id;
    } catch (error) {
        console.error('Error finding or creating champion:', error);
        throw error;
    }
}

async function serveGameInfo(gameData, event_id, game_url) {
    let curPick = 1;
    const newGameData = {
        team1: gameData.team1,
        team2: gameData.team2,
        winner: gameData.winner === gameData.team2,
        link: gameData.gameUrl,
        event: event_id
    };

    // Use for...of loop for async operations instead of forEach
    for (const champion of gameData.team1Picks) {
        const id = await findOrCreateChampion(champion, gameData.team1Picks.indexOf(champion));
        newGameData['pick' + curPick] = id;
        curPick++;
    }

    for (const champion of gameData.team2Picks) {
        const id = await findOrCreateChampion(champion, gameData.team2Picks.indexOf(champion));
        newGameData['pick' + curPick] = id;
        curPick++;
    }


    const newGame = await models.Game.create(newGameData);
    return true;
}
module.exports = {
    serveGameInfo
}
