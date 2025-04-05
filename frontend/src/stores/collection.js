import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {collectionApi} from "@/api/collections.js";
import {useQueryClient} from "@tanstack/vue-query";


export const useCollectionStore = defineStore('collection', () => {
    // State
    const queryClient = useQueryClient()
    const activeCollectionId = ref()
    const activeCollectionName = ref()
    const activeCollectionNewItems = ref([])
    const activeCollectionItems = ref([])
    // Getters

    const isActiveCollection = computed(() => {
        return activeCollectionId.value || activeCollectionId.value === 0;

    })

    const isNewCollection = computed(() => {
        return activeCollectionId.value === 0;
    })


    const getActiveCollectionName = computed(() => {
        return activeCollectionName.value
    })

    const getActiveCollectionItems = computed(() => {
        return activeCollectionItems.value
    })

    const getActiveCollectionNewItems = computed(() => {
        return activeCollectionNewItems.value
    })


    const setActiveCollectionName = (name = 'New collection') => {
        activeCollectionName.value = name;
    }

    const createCollection = () => {
        setActiveCollectionName()
        activeCollectionId.value = 0;
    }


    const addGameToActiveCollection = (game) => {
        console.log('Trying to add to active collection')
        if (activeCollectionNewItems.value.some(el => el?.id === game?.id)) return;
        if (activeCollectionItems.value.some(el => el?.id === game?.id)) return;

        if (activeCollectionId.value === undefined) {
            console.log('Trying to create new collection')
            createCollection()

        }
        activeCollectionNewItems.value.push(game);
        console.log('New items list', activeCollectionNewItems.value)
    }
    const clearActiveCollection = () => {
        activeCollectionName.value = undefined
        activeCollectionId.value = undefined
        activeCollectionItems.value = []
        activeCollectionNewItems.value = []
    }

    const deleteOldGame = async(id) => {
        const result = await collectionApi.removeGameFromCollection(activeCollectionId.value, id);
        queryClient.invalidateQueries({ queryKey: ['collections'] })
        return fetchCollection()

    }

    const deleteNewGame = (id) => {
        activeCollectionNewItems.value = activeCollectionNewItems.value.filter(el => el.id !== id)
    }


    const fetchCollection = async () => {
        const result = await collectionApi.getCollectionById(activeCollectionId.value);
        activeCollectionName.value = result.name;
        console.log(result)
        activeCollectionItems.value = result.games.map(el => {
            return {
                ...el
            }
        });
        activeCollectionNewItems.value = []
    }


    const saveCollection = async () => {
        if (isNewCollection.value) {
            const activeCollection = await collectionApi.createCollection({
                name: activeCollectionName.value,
                items: activeCollectionNewItems.value.map(el => el.id)
            })
            activeCollectionId.value = activeCollection.collection.id

        } else {
            await collectionApi.renameCollection(activeCollectionId.value, activeCollectionName.value)
            await collectionApi.addGamesToCollection(activeCollectionId.value, activeCollectionNewItems.value.map(el => el.id))
        }
        queryClient.invalidateQueries({ queryKey: ['collections'] })
        await fetchCollection()


    }
    const getCollectionById = async (id) => {
        activeCollectionId.value = id;
        await fetchCollection()

    }

    const allGamesInCollection = computed(()=>{
        return [
            ...activeCollectionItems.value,
            ...activeCollectionNewItems.value
        ]
    })

    const isGameInCollection = (id) => {
        return allGamesInCollection.value.some(el=> el.id === id)
    }


    return {
        isActiveCollection,
        isNewCollection,
        addGameToActiveCollection,
        getActiveCollectionItems,
        getActiveCollectionNewItems,
        getActiveCollectionName,
        isGameInCollection,
        setActiveCollectionName,
        clearActiveCollection,
        deleteOldGame,
        deleteNewGame,
        saveCollection,
        getCollectionById


    }

})
