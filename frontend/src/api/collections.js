// src/api/collectionApi.js

import { api } from './api.js'

/**
 * Collection API functions
 */
export const collectionApi = {
    // Get all collections
    getAllCollections: async () => {
        return await api('collections');
    },

    // Get a single collection by ID
    getCollectionById: (id) => {
        return api(`collections/${id}`);
    },

    // Create a new collection
    createCollection: async (collectionData) => {
        console.log(collectionData)
        return await api('collections', {
            method: 'POST',
            body: JSON.stringify(collectionData),
        });
    },

    // Rename a collection
    renameCollection: (id, name) => {
        return api(`collections/${id}/rename`, {
            method: 'PUT',
            body: JSON.stringify({ name }),
        });
    },

    // Add games to a collection
    addGamesToCollection: (id, gameIds) => {
        return api(`collections/${id}/games`, {
            method: 'POST',
            body: JSON.stringify({ gameIds }),
        });
    },

    // Remove a game from a collection
    removeGameFromCollection: (collectionId, gameId) => {
        return api(`collections/${collectionId}/games/${gameId}`, {
            method: 'DELETE',
        });
    },

    // Delete a collection
    deleteCollection: (id) => {
        return api(`collections/${id}`, {
            method: 'DELETE',
        });
    },
};

/**
 * TanStack Query hooks for Collections
 */
export const collectionQueryKeys = {
    all: ['collections'],
    lists: () => [...collectionQueryKeys.all, 'list'],
    list: (filters) => [...collectionQueryKeys.lists(), { filters }],
    details: () => [...collectionQueryKeys.all, 'detail'],
    detail: (id) => [...collectionQueryKeys.details(), id],
};

// This file exports collectionApi and queryKeys
// Import these in your Vue components and use with TanStack Query
// Example usage in a component:
//
// import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
// import { collectionApi, collectionQueryKeys } from '@/api/collectionApi';
//
// const collectionsQuery = useQuery({
//   queryKey: collectionQueryKeys.lists(),
//   queryFn: collectionApi.getAllCollections
// });
