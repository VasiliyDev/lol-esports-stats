const axios = require("axios");
const cheerio = require("cheerio");
const {serveGameInfo} = require("./gameService");

const BASE_URL = "https://gol.gg";
const TOURNAMENT_URL = "https://gol.gg/tournament/tournament-matchlist/LEC%202025%20Winter%20Playoffs/"; // Replace with actual tournament page URL

async function getMatchLinks(tournament_url) {
    try {
        const { data } = await axios.get(tournament_url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const $ = cheerio.load(data);
        let matches = [];

        // Find all match links and extract team names
        $("tbody tr").each((_, element) => {
            const matchLinkElement = $(element).find("td.text-left a");
            //console.log(matchLinkElement, 'match link')
            const matchLink = matchLinkElement.attr("href");
            //console.log(matchLink,'match link');

            if (matchLink) {
                const matchUrl = BASE_URL + matchLink.replace("../", "/");

                // Extract team names
                const team1 = $(element).find("td.text-right").text().trim();
                const team2 = $(element).find("td.text_victory, td.text_defeat").last().text().trim();

                matches.push({ matchUrl, team1, team2 });
            }
        });

        return matches;
    } catch (error) {
        console.error("Error fetching match links:", error);
        return [];
    }
}

async function getGameLinks(matchUrl) {
    try {
        const { data } = await axios.get(matchUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const $ = cheerio.load(data);
        let gameLinks = [];

        // Extract only "Game N" links
        $(".navbar-nav .game-menu-button a").each((_, element) => {
            const href = $(element).attr("href");
            const title = $(element).text().trim();
            if (title.match(/^Game \d+$/)) {
                gameLinks.push(BASE_URL + href.replace("../", "/"));
            }
        });

        return gameLinks;
    } catch (error) {
        console.error(`Error fetching game links for ${matchUrl}:`, error);
        return [];
    }
}

function extractWinnerLoser(html) {
    try {
        const $ = cheerio.load(html);

        let winner = null;
        let loser = null;

        // Extract blue team info
        const blueHeader = $(".blue-line-header");
        if (blueHeader.length) {
            const teamName = blueHeader.find("a").text().trim();
            const headerText = blueHeader.text().trim();

            if (headerText.includes("LOSS")) {
                loser = teamName;
            } else if (headerText.includes("WIN")) {
                winner = teamName;
            }
        }

        // Extract red team info
        const redHeader = $(".red-line-header");
        if (redHeader.length) {
            const teamName = redHeader.find("a").text().trim();
            const headerText = redHeader.text().trim();

            if (headerText.includes("WIN")) {
                winner = teamName;
            } else if (headerText.includes("LOSS")) {
                loser = teamName;
            }
        }

        return { winner, loser };
    } catch (error) {
        console.error("Error extracting winner and loser:", error);
        return { winner: null, loser: null };
    }
}

async function getGameData(gameUrl, team1, team2) {
    try {
        const { data } = await axios.get(gameUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const $ = cheerio.load(data);

        let team1Picks = [];
        let team2Picks = [];


        //get winner looser
        const { winner, loser } = extractWinnerLoser(data);
        // Extract tables for both teams
        const teamTables = $(".playersInfosLine");

        if (teamTables.length < 2) {
            console.error(`Error: Could not find both teams' tables for ${gameUrl}`);
            return { gameUrl, team1, team2, team1Picks, team2Picks };
        }

        // Team 1 (left side)
        teamTables.eq(0).find("tbody tr").each((_, element) => {
            const champion = $(element).find("td a img,champion_icon");
            const championName = champion.attr("alt");
            const championPicture = BASE_URL + String(champion.attr("src")).replace("../", "/");
            if (championName) team1Picks.push({championName:championName, championPicture: championPicture});
        });

        // Team 2 (right side)
        teamTables.eq(1).find("tbody tr").each((_, element) => {
            const champion = $(element).find("td a img,champion_icon");
            const championName = champion.attr("alt");
            const championPicture = BASE_URL + String(champion.attr("src")).replace("../", "/");
            if (championName) team2Picks.push({championName:championName, championPicture: championPicture});
        });

        return { gameUrl, team1, team2, team1Picks, team2Picks, winner ,loser };
    } catch (error) {
        console.error(`Error fetching data for ${gameUrl}:`, error);
        return { gameUrl, team1, team2, team1Picks: [], team2Picks: [] };
    }
}

async function main(tournament_url, event_id) {
    console.log("Fetching tournament matches...");
    const matches = await getMatchLinks(tournament_url);

    if (matches.length === 0) {
        console.error("No matches found!");
        return;
    }

    console.log(`Found ${matches.length} matches.`);
    for (const { matchUrl, team1, team2 } of matches) {
        console.log(`\nFetching games for match: ${team1} vs ${team2}`);
        const gameLinks = await getGameLinks(matchUrl);

        if (gameLinks.length === 0) {
            console.log(`No games found for match: ${matchUrl}`);
            continue;
        }

        for (const gameUrl of gameLinks) {
            console.log(`Fetching picks for: ${gameUrl}`);
            const result = await getGameData(gameUrl, team1, team2);
            await serveGameInfo(result, event_id)

        }
    }
    return true
}

module.exports = {
    main
};
