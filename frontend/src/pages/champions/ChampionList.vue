<script setup>
import {championsApi} from "../../api/champions.js";
import { keepPreviousData, useQuery,useQueryClient,useMutation } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import AppSelect from "../../ui/AppSelect.vue";

const { data: champions} = useQuery({
  queryKey: ['champions'],
  queryFn: championsApi.getAllChampions,
  placeholderData: keepPreviousData,
  refetchOnMount: false
});

const { data: categories} = useQuery({
  queryKey: ['champion-categories'],
  queryFn: championsApi.getAllCategories,
  placeholderData: ()=>[],
  refetchOnMount: false
});

const queryClient = useQueryClient();
const { mutate: setCategory } = useMutation({
  mutationFn: ({champId,categoryId}) => {
    return championsApi.setChampionCategory(champId,categoryId);
  },
  onMutate: async ({champId,categoryId}) => {
    const key = ['champions']
    await queryClient.cancelQueries({ queryKey:key });
    const prev = queryClient.getQueryData(key);
    if (prev) {
      queryClient.setQueryData(key, ()=>{
        return prev.map(el=>{
          if (el.id!==champId) return el;
          return {
            ...el,
            category:categoryId
          }
        })
      });
    }
  },
});

const championsToShow = computed(()=>{
  if (!champions.value) return [];
  return [...champions.value].sort((a,b)=>{
    return a.id>b.id?1:-1;
  })
})
import {ROLES} from "@/data.js";

const roleById = id=>{
  return ROLES[id];
}


</script>

<template>
<div class="d-flex jc ac">
  <table>
    <thead>
      <tr>
        <th>Champion</th>
        <th>Role</th>
        <th>Category</th>
      </tr>
    </thead>
    <tr v-for="champion in championsToShow" :key="champion.id">
      <td>{{champion.name}}</td>
      <td>{{roleById(champion.role)}}</td>
      <td>
        <AppSelect :selected="champion.category"
                   @select="id=>setCategory({champId:champion.id,categoryId:id})"
                   :option-list="categories.map(el=>({name:el.name,value:el.id}))"/>
      </td>
    </tr>
  </table>
</div>
</template>

<style scoped lang="scss">

</style>