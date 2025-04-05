<script setup>


import {toRefs} from "vue";

const props = defineProps({
  games: {
    type: Array,
    required: true
  }
})
const {games} = toRefs(props)

const emits = defineEmits(['delete'])


const getTeam1Picks = (game) => {
  return game.gamePlayers.filter(el=>el.participant_id <= 5)
}

const getTeam2Picks = (game) => {
  return game.gamePlayers.filter(el=> el.participant_id >= 6)
}


</script>

<template>
  <div class="table-wrapper">
    <table v-if="Array.isArray(games) && games.length > 0">
      <thead>
      <tr>
        <th>Champions T1</th>
        <th>Champions T2</th>
        <th>Buttons</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="game in games" :key="game.id">
        <td>

          <div class="champion-grid"  :class="{ 'winner-team': game.winner }">
            <div v-for="(pick, index) in getTeam1Picks(game)" :key="`t1-${index}`" class="champion-icon">
              <div>
                <img v-if="pick" :src="`https://gol.gg/_img/champions_icon/${pick.champion.name}.png`" :alt="pick" :title="`${pick.champion.name} / ${pick.player.name}`" width="40" height="40">
                <div v-else class="empty-pick"></div>
                <div>{{ pick.category }}</div>
              </div>
            </div>
          </div>
        </td>
        <td>
          <div class="champion-grid" :class="{ 'winner-team': !game.winner }">
            <div v-for="(pick, index) in getTeam2Picks(game)" :key="`t2-${index}`" class="champion-icon">
              <div>
                <img v-if="pick" :src="`https://gol.gg/_img/champions_icon/${pick.champion.name}.png`" :alt="pick" :title="`${pick.champion.name} / ${pick.player.name}`" width="40" height="40">
                <div v-else class="empty-pick"></div>
                <div>{{ pick.category }}</div>
              </div>
            </div>
          </div>
        </td>
        <td>
          <div class="controls d-flex ac">
            <a v-if="game.link" :href="game.link" target="_blank" class="game-link">Watch</a>
            <span v-else class="no-link">N/A</span>
            <button class="action-button" @click="emits('delete', game)">
              Delete
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
  padding: 3px;
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
  gap: 2px;
  justify-content: center;
}

.champion-icon {
  width: 40px;
  height: auto;
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

  background-color: #4CAF50;
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
