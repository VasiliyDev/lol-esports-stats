// src/api/eventApi.js

import {api } from './api.js'



/**
 * Event API functions
 */
export const eventApi = {
    // Get all events
    getAllEvents: async () => {
        return  await api('events');


    },

    // Get a single event by ID
    getEventById: (id) => {
        return api(`events/${id}`);
    },

    // Create a new event
    createEvent: async (eventData) => {
        return await api('events', {
            method: 'POST',
            body: JSON.stringify(eventData),
        });
    },

    // Update an existing event
    updateEvent: (id, eventData) => {
        return api(`events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(eventData),
        });
    },

    // Delete an event
    deleteEvent: (id) => {
        return api(`events/${id}`, {
            method: 'DELETE',
        });
    },

    // Get unparsed events
    getUnparsedEvents: () => {
        return api('events/unparsed');
    },

    // Mark an event as parsed
    markEventAsParsed: (id) => {
        return api(`events/${id}/mark-parsed`, {
            method: 'PUT',
        });
    },
    startParsing: async () => {
        return await api(`events/start-parsing`, {method:'POST'})
}
};

/**
 * TanStack Query hooks for Events
 */
export const eventQueryKeys = {
    all: ['events'],
    lists: () => [...eventQueryKeys.all, 'list'],
    list: (filters) => [...eventQueryKeys.lists(), { filters }],
    details: () => [...eventQueryKeys.all, 'detail'],
    detail: (id) => [...eventQueryKeys.details(), id],
    unparsed: () => [...eventQueryKeys.all, 'unparsed'],
};

// This file exports eventApi and queryKeys
// Import these in your Vue components and use with TanStack Query
// Example usage in a component:
//
// import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
// import { eventApi, eventQueryKeys } from '@/api/eventApi';
//
// const eventsQuery = useQuery({
//   queryKey: eventQueryKeys.lists(),
//   queryFn: eventApi.getAllEvents
// });
