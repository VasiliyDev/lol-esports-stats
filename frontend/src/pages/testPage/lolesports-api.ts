// lolesports-api.js
export default class LolEsportsAPI {
    constructor() {
        this.headers = {
            "x-api-key": "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z" // Public API key
        };
        this.baseUrl = "https://esports-api.lolesports.com/persisted/gw";
        this.liveStatsUrl = "https://feed.lolesports.com/livestats/v1";
    }

    async getLeagues() {
        const response = await fetch(`${this.baseUrl}/getLeagues?hl=en-US`, {
            method: "GET",
            headers: this.headers
        });
        const data = await response.json();
        return data.data;
    }

    async getTournamentsForLeague(leagueId) {
        const response = await fetch(`${this.baseUrl}/getTournamentsForLeague?hl=en-US&leagueId=${leagueId}`, {
            method: "GET",
            headers: this.headers
        });
        const data = await response.json();
        return data.data;
    }

    async getCompletedEvents(tournamentId) {
        const response = await fetch(`${this.baseUrl}/getCompletedEvents?hl=en-US&tournamentId=${tournamentId}`, {
            method: "GET",
            headers: this.headers
        });
        const data = await response.json();
        return data.data;
    }

    async getEventDetails(matchId) {
        const response = await fetch(`${this.baseUrl}/getEventDetails?hl=en-US&id=${matchId}`, {
            method: "GET",
            headers: this.headers
        });
        const data = await response.json();
        return data.data;
    }

    async getLive() {
        const response = await fetch(`${this.baseUrl}/getLive?hl=en-US`, {
            method: "GET",
            headers: this.headers
        });
        const data = await response.json();
        return data.data;
    }

    async getStandings(tournamentId) {
        const response = await fetch(`${this.baseUrl}/getStandings?hl=en-US&tournamentId=${tournamentId}`, {
            method: "GET",
            headers: this.headers
        });
        const data = await response.json();
        return data.data;
    }

    async getWindow(gameId, startingTime = "") {
        // If no startingTime is provided, use current time minus 30 seconds to be safe
        let currentTime = startingTime;

        if (!startingTime) {
            const now = new Date();
            // Subtract 30 seconds to ensure we're beyond the 20-second restriction
            now.setTime(now.getTime() - 30 * 1000);
            // Round down to nearest 10 seconds
            now.setMilliseconds(0);
            now.setSeconds(Math.floor(now.getSeconds() / 10) * 10);
            currentTime = now.toISOString();
        }

        const params = currentTime ? `?startingTime=${currentTime}` : "";
        const response = await fetch(`${this.liveStatsUrl}/window/${gameId}${params}`, {
            method: "GET",
            headers: this.headers
        });
        return await response.json();
    }

    async getMatchTimeline(gameId) {
        const response = await fetch(`${this.liveStatsUrl}/details/${gameId}`, {
            method: "GET",
            headers: this.headers
        });
        return await response.json();
    }

    async getSchedule(tournamentId, pageToken = "") {
        const tokenParam = pageToken ? `&pageToken=${pageToken}` : "";
        const response = await fetch(`${this.baseUrl}/getSchedule?hl=en-US&tournamentId=${tournamentId}${tokenParam}`, {
            method: "GET",
            headers: this.headers
        });
        const data = await response.json();
        return data.data;
    }
    async getTeams(){
        const response = await fetch(`${this.baseUrl}/getTeams?hl=en-US`, {
            method: "GET",
            headers: this.headers
        });
        const data = await response.json();
        return data.data;

    }
}
