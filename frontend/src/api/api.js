const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const CORS_PROXY = 'https://corsproxy.io/?';

export const fetchLoLEsportsTeamGpr = async(startDate = '2024-01-01', endDate = '2024-09-15', language = 'en-GB', step = 10) => {
    try {
        // Create the variables and extensions objects
        const variables = {
            hl: language,
            step: step,
            startDate: startDate,
            endDate: endDate
        };

        const extensions = {
            persistedQuery: {
                version: 1,
                sha256Hash: '75c2ea78f643c30fa59b2a664668f8fe399fb57625595fc271316141fa3c282d'
            }
        };

        // Important! The error suggests we need to use POST with Apollo-specific headers
        // instead of trying to use GET with URL parameters

        // The target URL (without query parameters)
        const targetUrl = 'https://lolesports.com/api/gql';

        // The proxied URL
        const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;

        console.log('Fetching via CORS proxy with Apollo headers:', proxiedUrl);

        const response = await fetch(proxiedUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Important non-CSRF content type
                'Accept': 'application/json',
                'x-apollo-operation-name': 'GetTeamGpr', // Required header from error
                'apollo-require-preflight': 'true'      // Required header from error
            },
            body: JSON.stringify({
                operationName: 'GetTeamGpr',
                variables: variables,
                extensions: extensions
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
        }

        const data = await response.json();
        console.log('Successfully fetched data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching LoL Esports data:', error);
        throw error;
    }
};

export const api = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}/${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        // Handle 204 No Content response
        if (response.status === 204) {
            return null;
        }

        // Handle non-ok responses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}
