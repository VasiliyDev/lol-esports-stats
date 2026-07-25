<script setup lang="ts">
import {gameApi} from "../../../api/games";
import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import GameList from "@/pages/games/components/GameList.vue";
// Query to fetch all games
const { data: games } = useQuery({
  queryKey: ['games'],
  queryFn: gameApi.getAllGames,
  placeholderData: keepPreviousData,
  enabled: computed(() => true),
  refetchOnMount: true
})

// Filter states
const filterTeam = ref('')
const filterChampion = ref('')

// Filtered games computed property
const filteredGames = computed(() => {
  if (!games.value || !Array.isArray(games.value)) return [];

  return games.value.filter(game => {
    // Filter by team if specified
    const teamMatch = !filterTeam.value ||
        game.team1.toLowerCase().includes(filterTeam.value.toLowerCase()) ||
        game.team2.toLowerCase().includes(filterTeam.value.toLowerCase());

    // Filter by champion if specified
    const championMatch = !filterChampion.value ||
        [game.pick1, game.pick2, game.pick3, game.pick4, game.pick5,
          game.pick6, game.pick7, game.pick8, game.pick9, game.pick10]
            .some(pick => pick && pick.toLowerCase().includes(filterChampion.value.toLowerCase()));

    return teamMatch && championMatch;
  });
});



</script>

<template>
  <div class="games-table-container">
    <h1>Games List</h1>
    <GameList :games="filteredGames"/>
    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <label>Filter by Team:</label>
        <input v-model="filterTeam" placeholder="Enter team name">
      </div>

      <div class="filter-group">
        <label>Filter by Champion:</label>
        <input v-model="filterChampion" placeholder="Enter champion name">
      </div>
    </div>

    <!-- Games Table -->

  </div>
</template>

<style scoped>
.games-table-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}


</style>
