<script setup>
import {onMounted,toRefs,ref} from "vue";
const props = defineProps({
  id: {
    type: Number,
    required: false,
    default: null
  },
})

const { data: categories} = useQuery({
  queryKey: ['champion-categories'],
  queryFn: championsApi.getAllCategories,
  placeholderData: ()=>[],
  refetchOnMount: false
});

const getCategoryName = id=>{
  return categories.value.find(el=>el.id===id)?.name;
}

const categoryFilter = ref({})
import {ROLES} from "@/data.js";
import {useCollections} from "../../../composables/collections.js";
import {storeToRefs} from "pinia";
import {useQuery} from "@tanstack/vue-query";
import {championsApi} from "@/api/champions.js";
import {gameApi} from "@/api/games.js";
import GameList from "@/pages/games/components/GameList.vue";
const collectionStore = useCollections();
const {filter} = storeToRefs(collectionStore);
onMounted(() => {
  if (filter.value?.categories) {
    categoryFilter.value = {...filter.value.categories}
  }
})
const name = ref('');
const games = ref([]);
const findGames = async ()=>{
  games.value = await gameApi.getSimilarGames(categoryFilter.value)
}
</script>

<template>
  <div>
    <div>
      FILTERS
    </div>
    <div class="filters d-flex jc">
        <div>
          <div>PICK1</div>
          <div class="filters__role d-flex"
               v-for="(name,id,i) in ROLES">
            <div>{{ name }}</div>
            <div>{{getCategoryName(categoryFilter['1']?.[i])}}</div>
            <div>{{categoryFilter['1']?.[i]}}</div>
          </div>
        </div>
        <div>
          <div>PICK2</div>
          <div class="filters__role d-flex"
               v-for="(name,id,i) in ROLES">
            <div>{{ name }}</div>
            <div>{{getCategoryName(categoryFilter['2']?.[i])}}</div>
            <div>{{categoryFilter['2']?.[i]}}</div>
          </div>
        </div>
    </div>
    <div class="controls d-flex">
      <button class="action-button" @click="findGames">
        Find games
      </button>
      <div class="d-flex fc">
        <input type="text" v-model="name">
        <button class="action-button">Create collection</button>
      </div>
    </div>
    <div class="games" v-if="games.length">
      <GameList :games="games"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.games{

}
.filters{
  text-align: left;
  gap:100px;
  &__role{
    &>div{
      min-width: 100px;
    }
    gap:6px;
  }
}
</style>