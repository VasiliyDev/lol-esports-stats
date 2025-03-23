import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import {collectionApi} from "@/api/collections.js";


export const useCollectionStore = defineStore('collection', () => {
    // State
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
        if (activeCollectionNewItems.value.some(el => el?.id === game?.id)) return;
        if (activeCollectionItems.value.some(el => el?.id === game?.id)) return;

        if (activeCollectionId.value === undefined) {
            createCollection()

        }
        activeCollectionNewItems.value.push(game);
        console.log(activeCollectionId.value)
        console.log(activeCollectionNewItems)
    }
    const clearActiveCollection = () => {
        activeCollectionName.value = undefined
        activeCollectionId.value = undefined
        activeCollectionItems.value = []
        activeCollectionNewItems.value = []
    }

    const deleteOldGame = async(id) => {
        const result = await collectionApi.removeGameFromCollection(activeCollectionId.value, id);
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
        await fetchCollection()


    }
    const getCollectionById = async (id) => {
        activeCollectionId.value = id;
        await fetchCollection()

    }


    return {
        isActiveCollection,
        isNewCollection,
        addGameToActiveCollection,
        getActiveCollectionItems,
        getActiveCollectionNewItems,
        getActiveCollectionName,
        setActiveCollectionName,
        clearActiveCollection,
        deleteOldGame,
        deleteNewGame,
        saveCollection,
        getCollectionById


    }

})
