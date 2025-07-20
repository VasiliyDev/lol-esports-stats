// src/api/classificationApi.js

import { api } from './api.js'

/**
 * Classification API functions
 */
export const classificationApi = {
    // ================== CLASSIFICATIONS ==================
    
    // Get all classifications (with parameters as sub field)
    getAllClassifications: async () => {
        const response = await api('classifications');
        return response.data;
    },

    // Get a single classification by ID
    getClassificationById: async (id) => {
        const response = await api(`classifications/${id}`);
        return response.data;
    },

    // Get full info of classification (with champions and their stats)
    getClassificationFullInfo: async (id) => {
        const response = await api(`classifications/${id}/full`);
        return response.data;
    },

    // Create a new classification
    createClassification: async (classificationData) => {
        const response = await api('classifications', {
            method: 'POST',
            body: JSON.stringify(classificationData),
        });
        return response.data;
    },

    // Rename a classification
    renameClassification: async (id, name) => {
        const response = await api(`classifications/${id}/rename`, {
            method: 'PUT',
            body: JSON.stringify({ name }),
        });
        return response.data;
    },

    // Delete a classification
    deleteClassification: async (id) => {
        const response = await api(`classifications/${id}`, {
            method: 'DELETE',
        });
        return response.data;
    },

    // ================== CLASSIFICATION PARAMETERS ==================

    // Get all classification parameters
    getAllClassificationParameters: async () => {
        const response = await api('classifications/parameters');
        return response.data;
    },

    // Get classification parameters by classification ID
    getClassificationParametersByClassificationId: async (classificationId) => {
        const response = await api(`classifications/${classificationId}/parameters`);
        return response.data;
    },

    // Get a classification parameter by ID
    getClassificationParameterById: async (id) => {
        const response = await api(`classifications/parameters/${id}`);
        return response.data;
    },

    // Create a new classification parameter
    createClassificationParameter: async (parameterData) => {
        const response = await api('classifications/parameters', {
            method: 'POST',
            body: JSON.stringify(parameterData),
        });
        return response.data;
    },

    // Update a classification parameter
    updateClassificationParameter: async (id, parameterData) => {
        const response = await api(`classifications/parameters/${id}`, {
            method: 'PUT',
            body: JSON.stringify(parameterData),
        });
        return response.data;
    },

    // Delete a classification parameter
    deleteClassificationParameter: async (id) => {
        const response = await api(`classifications/parameters/${id}`, {
            method: 'DELETE',
        });
        return response.data;
    },

    // ================== CHAMPION PARAMETER VALUES ==================

    // Update classification champion parameters (bulk update)
    updateClassificationChampionParameters: async (updateData) => {
        const response = await api('classifications/champion-parameters', {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
        return response.data;
    },
};

/**
 * TanStack Query hooks for Classifications
 */
export const classificationQueryKeys = {
    all: ['classifications'],
    lists: () => [...classificationQueryKeys.all, 'list'],
    list: (filters) => [...classificationQueryKeys.lists(), { filters }],
    details: () => [...classificationQueryKeys.all, 'detail'],
    detail: (id) => [...classificationQueryKeys.details(), id],
    fullInfo: (id) => [...classificationQueryKeys.all, 'fullInfo', id],
    
    // Parameters
    parameters: ['classification-parameters'],
    parametersList: () => [...classificationQueryKeys.parameters, 'list'],
    parametersDetail: (id) => [...classificationQueryKeys.parameters, 'detail', id],
    parametersByClassification: (classificationId) => [...classificationQueryKeys.parameters, 'byClassification', classificationId],
    
    // Champion parameter values
    championParameters: ['champion-parameters'],
    championParametersByClassification: (classificationId) => [...classificationQueryKeys.championParameters, 'byClassification', classificationId],
};

// Helper functions for working with classification data

/**
 * Transform champions data for easier frontend use
 * @param {Array} champions - Champions with classification_stats
 * @param {Array} parameters - Classification parameters
 * @returns {Array} Transformed champions data
 */
export const transformChampionsData = (champions, parameters) => {
    return champions.map(champion => ({
        ...champion,
        parameterValues: parameters.map(param => ({
            parameter_id: param.id,
            parameter_name: param.name,
            value: champion.classification_stats[param.name] || 0
        }))
    }));
};

/**
 * Prepare data for bulk update API call
 * @param {number} classificationId - Classification ID
 * @param {Array} championsData - Array of champions with their parameter values
 * @returns {Object} Data formatted for API call
 */
export const prepareBulkUpdateData = (classificationId, championsData) => {
    return {
        classification_id: classificationId,
        champions: championsData.map(champion => ({
            champion_id: champion.champion_id || champion.id,
            parameters: champion.parameters || {}
        }))
    };
};

/**
 * Create parameter object from parameter values array
 * @param {Array} parameterValues - Array of {parameter_id, value} objects
 * @returns {Object} Parameters object with parameter_id as key and value as value
 */
export const createParametersObject = (parameterValues) => {
    const parameters = {};
    parameterValues.forEach(pv => {
        parameters[pv.parameter_id] = pv.value;
    });
    return parameters;
};

// This file exports classificationApi and queryKeys
// Import these in your Vue components and use with TanStack Query
// Example usage in a component:
//
// import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
// import { classificationApi, classificationQueryKeys } from '@/api/classificationApi';
//
// // Get all classifications
// const classificationsQuery = useQuery({
//   queryKey: classificationQueryKeys.lists(),
//   queryFn: classificationApi.getAllClassifications
// });
//
// // Get classification full info with champions
// const classificationFullInfoQuery = useQuery({
//   queryKey: classificationQueryKeys.fullInfo(classificationId),
//   queryFn: () => classificationApi.getClassificationFullInfo(classificationId)
// });
//
// // Update champion parameters mutation
// const updateChampionParametersMutation = useMutation({
//   mutationFn: classificationApi.updateClassificationChampionParameters,
//   onSuccess: () => {
//     queryClient.invalidateQueries({ queryKey: classificationQueryKeys.fullInfo(classificationId) });
//   }
// });
//
// // Example of bulk update
// const handleBulkUpdate = async () => {
//   const updateData = prepareBulkUpdateData(classificationId, championsWithUpdatedValues);
//   await updateChampionParametersMutation.mutateAsync(updateData);
// };