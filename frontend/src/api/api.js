const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
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
