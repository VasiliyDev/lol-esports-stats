import { api } from './api.js'

export const championsApi = {
    // Get all games
    getAllChampions: () => {
        return api('champions');
    },
    getAllCategories: () => {
        return api('champions/categories');
    },
    setChampionCategory:(champion,category)=>{
        return api(`champions/${champion}/category`, {
            method: 'PUT',
            body: JSON.stringify({category:category}),
        });
    }
}