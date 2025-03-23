<script setup>
import {useRouter} from "vue-router";
import {useCollections} from "../../../../composables/collections.js";
import {useCollectionStore} from "../../../stores/collection.js";
import {storeToRefs} from "pinia";

const props = defineProps({
  games: {
    type: Array,
    required: true
  }
})
const getTeam1Picks = (game) => {
  return [game.champion1, game.champion2, game.champion3, game.champion4, game.champion5];
}

const getTeam2Picks = (game) => {
  return [game.champion6, game.champion7, game.champion8, game.champion9, game.champion10];
}

const router = useRouter();
const collectionStore = useCollections();
const createCollection = game => {
  const picks = {
    1: getTeam1Picks(game).map(el => el.category),
    2: getTeam2Picks(game).map(el => el.category)
  }
  const filter = {
    categories: picks
  }
  collectionStore.setFilter(filter);
  router.push({name: 'collection'})
}

const collectionsStore = useCollectionStore()
const addGameToCollection = (game) =>{
  collectionsStore.addGameToActiveCollection(game)
}


</script>

<template>
  <div class="table-wrapper">
    <table v-if="games.length > 0">
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
      <tr v-for="game in games" :key="game.id">
        <td>{{ game.event }}</td>
        <td :class="{ 'winner-team': game.winner }">{{ game.team1 }}</td>
        <td>
          <div class="champion-grid">
            <div v-for="(pick, index) in getTeam1Picks(game)" :key="`t1-${index}`" class="champion-icon">
              <div>
                <img v-if="pick" :src="pick.image" :alt="pick" :title="pick.name" width="40" height="40">
                <div v-else class="empty-pick"></div>
                <div>{{ pick.category }}</div>
              </div>
            </div>
          </div>
        </td>
        <td :class="{ 'winner-team': !game.winner }">{{ game.team2 }}</td>
        <td>
          <div class="champion-grid">
            <div v-for="(pick, index) in getTeam2Picks(game)" :key="`t2-${index}`" class="champion-icon">
              <div>
                <img v-if="pick" :src="pick.image" :alt="pick" :title="pick.name" width="40" height="40">
                <div v-else class="empty-pick"></div>
                <div>{{ pick.category }}</div>
              </div>
            </div>
          </div>
        </td>
        <td>
          <div class="winner-indicator">
            {{ game.winner ? game.team1 : game.team2 }}
          </div>
        </td>
        <td>
          <div class="controls d-flex ac">
            <a v-if="game.link" :href="game.link" target="_blank" class="game-link">Watch</a>
            <span v-else class="no-link">N/A</span>
            <button class="action-button" @click="createCollection(game)">
              Create collection
            </button>
            <button @click="addGameToCollection(game)">
              Add to collection
            </button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.controls {
  gap: 4px;
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
