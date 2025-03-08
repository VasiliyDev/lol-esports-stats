<script setup>
import {gameApi} from "../../../api/games.js";
import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import { computed, ref } from "vue";


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

// Get champion icon URL
const getChampionIcon = (championName) => {
  if (!championName) return '';
  // Replace with your actual icon logic
  return ;
}

// Organize picks into a 5x5 grid (team1: first 5, team2: second 5)
const getTeam1Picks = (game) => {
  return [game.champion1, game.champion2, game.champion3, game.champion4, game.champion5];
}

const getTeam2Picks = (game) => {
  return [game.champion6, game.champion7, game.champion8, game.champion9, game.champion10];
}
</script>

<template>
  <div class="games-table-container">
    <h1>Games List</h1>

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
    <div class="table-wrapper">
      <template v-if="games && Array.isArray(games)">
        <table v-if="filteredGames.length > 0">
          <thead>
          <tr>
            <th>Event</th>
            <th>Team 1</th>
            <th>Champions</th>
            <th>Team 2</th>
            <th>Champions</th>
            <th>Winner</th>
            <th>Link</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="game in filteredGames" :key="game.id">
            <td>{{ game.event }}</td>
            <td :class="{ 'winner-team': game.winner }">{{ game.team1 }}</td>
            <td>
              <div class="champion-grid">
                <div v-for="(pick, index) in getTeam1Picks(game)" :key="`t1-${index}`" class="champion-icon">
                  <img v-if="pick" :src="pick.image" :alt="pick" :title="pick.name" width="40" height="40">
                  <div v-else class="empty-pick"></div>
                </div>
              </div>
            </td>
            <td :class="{ 'winner-team': !game.winner }">{{ game.team2 }}</td>
            <td>
              <div class="champion-grid">
                <div v-for="(pick, index) in getTeam2Picks(game)" :key="`t2-${index}`" class="champion-icon">
                  <img v-if="pick" :src="pick.image" :alt="pick" :title="pick.name" width="40" height="40">
                  <div v-else class="empty-pick"></div>
                </div>
              </div>
            </td>
            <td>
              <div class="winner-indicator">
                {{ game.winner ? game.team1 : game.team2 }}
              </div>
            </td>
            <td>
              <a v-if="game.link" :href="game.link" target="_blank" class="game-link">Watch</a>
              <span v-else class="no-link">N/A</span>
            </td>
          </tr>
          </tbody>
        </table>
        <div v-else class="no-data">No games found matching your filters</div>
      </template>
      <div v-else class="loading">Loading games...</div>
    </div>
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

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
  vertical-align: middle;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

.champion-grid {
  display: grid;
  grid-template-columns: repeat(5, 40px);
  gap: 5px;
  justify-content: center;
}

.champion-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.champion-icon img {
  border-radius: 5px;
  object-fit: cover;
}

.empty-pick {
  width: 40px;
  height: 40px;
  background-color: #eee;
  border-radius: 5px;
}

.winner-team {
  font-weight: bold;
  color: #4CAF50;
}

.winner-indicator {
  font-weight: bold;
  padding: 5px;
  text-align: center;
  background-color: #4CAF50;
  color: white;
  border-radius: 4px;
}

.game-link {
  display: inline-block;
  padding: 6px 12px;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.game-link:hover {
  background-color: #2980b9;
}

.no-link {
  color: #999;
  font-style: italic;
}

.no-data, .loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #666;
}
</style>
