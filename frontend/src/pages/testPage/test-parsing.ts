import { api } from '@/api/api'

export const parsingApi = {
    // Get all games
    startParsing: () => {
        return api(`parsing`, {
            method: 'GET'
        });
    },
    clearParsing: () => {
        return api(`parsing/clear`, {
            method: 'GET'
        });
    },
}
