import { ref } from 'vue';

const filter = ref(null);

export const useCollections = () =>{
    const setFilter = (newFilter) => {
        filter.value = newFilter;
    };

    return {
        filter,
        setFilter,
    };
}
