// src/api/gameApi.js

import { api } from './api.js'

/**
 * Game API functions
 */
export const gameApi = {
    // Get all games
    getAllGames: () => {
        return api('games');
    },

    getSimilarGames: (filter)=>{
        return api(`games/similar`,{
            method:'POST',
            body: JSON.stringify({filter:filter})
        })
    },
    parseFramesByGameId: (gameId)=>{
        return api(`games/${gameId}/window`,{
            method:'GET'
        })
    },

    // Get a single game by ID
    getGameById: (id) => {
        return api(`games/${id}`);
    },

    // Create a new game
    createGame: (gameData) => {
        return api('games', {
            method: 'POST',
            body: JSON.stringify(gameData),
        });
    },

    // Update an existing game
    updateGame: (id, gameData) => {
        return api(`games/${id}`, {
            method: 'PUT',
            body: JSON.stringify(gameData),
        });
    },

    // Delete a game
    deleteGame: (id) => {
        return api(`games/${id}`, {
            method: 'DELETE',
        });
    },

    // Get games by team
    getGamesByTeam: (team) => {
        return api(`games/team/${team}`);
    },

    // Get games by winner status
    getGamesByWinner: (status) => {
        return api(`games/winner/${status}`);
    },

    // Get games by event
    getGamesByEvent: (event) => {
        return api(`games/event/${event}`);
    }
};

/**
 * TanStack Query hooks for Games
 */
export const gameQueryKeys = {
    all: ['games'],
    lists: () => [...gameQueryKeys.all, 'list'],
    list: (filters) => [...gameQueryKeys.lists(), { filters }],
    details: () => [...gameQueryKeys.all, 'detail'],
    detail: (id) => [...gameQueryKeys.details(), id],
    byTeam: (team) => [...gameQueryKeys.all, 'team', team],
    byWinner: (status) => [...gameQueryKeys.all, 'winner', status],
    byEvent: (event) => [...gameQueryKeys.all, 'event', event],
};

// This file exports gameApi and queryKeys
// Import these in your Vue components and use with TanStack Query
// Example usage in a component:
//
// import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
// import { gameApi, gameQueryKeys } from '@/api/gameApi';
//
// const gamesQuery = useQuery({
//   queryKey: gameQueryKeys.lists(),
//   queryFn: gameApi.getAllGames
// });
//
// // Get games by team example
// const teamGamesQuery = useQuery({
//   queryKey: gameQueryKeys.byTeam('TeamName'),
//   queryFn: () => gameApi.getGamesByTeam('TeamName')
// });
