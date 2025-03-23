<script setup>
import { ref, onMounted } from 'vue';
import LolEsportsAPI from './lolesports-api';

// Initialize API
const api = new LolEsportsAPI();


// Reactive state
const result = ref({});
const isLoading = ref(false);
const activeEndpoint = ref('getLeagues');

// Test API endpoints
async function testEndpoint(endpoint, params = []) {
  isLoading.value = true;
  try {
    result.value = await api[endpoint](...params);
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    result.value = { error: error.message };
  } finally {
    isLoading.value = false;
  }
}

// Function to create timestamp for a specific game time point
function createGameTimestamp(firstFrameTime, millisFromStart) {
  const baseTime = new Date(firstFrameTime);
  const targetTime = new Date(baseTime.getTime() + millisFromStart);
  return targetTime.toISOString();
}

// Input fields for parameters
const leagueId = ref('');
const tournamentId = ref('');
const matchId = ref('');
const gameId = ref('');
const gameTimestamp = ref('');
const firstFrameTime = ref('');
const millisFromStart = ref('');
const participantIds = ref('');

// Calculate timestamp based on firstFrameTime and millisFromStart
function calculateTimestamp() {
  if (firstFrameTime.value && millisFromStart.value) {
    try {
      const timestamp = createGameTimestamp(firstFrameTime.value, parseInt(millisFromStart.value));
      gameTimestamp.value = timestamp;
    } catch (error) {
      console.error('Error calculating timestamp:', error);
    }
  }
}
</script>

<template>
  <div class="api-tester">
    <h1>LoL Esports API Tester</h1>

    <div class="endpoint-selector">
      <label for="endpoint">Select API Endpoint:</label>
      <select id="endpoint" v-model="activeEndpoint">
        <option value="getLeagues">getLeagues()</option>
        <option value="getTournamentsForLeague">getTournamentsForLeague(leagueId)</option>
        <option value="getCompletedEvents">getCompletedEvents(tournamentId)</option>
        <option value="getEventDetails">getEventDetails(matchId)</option>
        <option value="getLive">getLive()</option>
        <option value="getStandings">getStandings(tournamentId)</option>
        <option value="getWindow">getWindow(gameId, timestamp)</option>
        <option value="getMatchTimeline">getMatchTimeline(gameId, participantIds)</option>
        <option value="getSchedule">getSchedule(tournamentId)</option>
      </select>
    </div>

    <div class="params-container">
      <!-- Parameter inputs based on selected endpoint -->
      <div v-if="activeEndpoint === 'getTournamentsForLeague'" class="param-group">
        <label for="leagueId">League ID:</label>
        <input id="leagueId" v-model="leagueId" placeholder="e.g. 98767991299243165" />
      </div>

      <div v-if="['getCompletedEvents', 'getStandings', 'getSchedule'].includes(activeEndpoint)" class="param-group">
        <label for="tournamentId">Tournament ID:</label>
        <input id="tournamentId" v-model="tournamentId" placeholder="e.g. 105873920167580486" />
      </div>

      <div v-if="activeEndpoint === 'getEventDetails'" class="param-group">
        <label for="matchId">Match ID:</label>
        <input id="matchId" v-model="matchId" placeholder="e.g. 103462439438682788" />
      </div>

      <div v-if="activeEndpoint === 'getWindow'" class="param-group">
        <label for="gameId">Game ID:</label>
        <input id="gameId" v-model="gameId" placeholder="e.g. 103462439438682788" />

        <div class="sub-params">
          <h4>Game Timestamp Options</h4>
          <div class="two-columns">
            <div>
              <label for="gameTimestamp">Direct Timestamp:</label>
              <input id="gameTimestamp" v-model="gameTimestamp" placeholder="e.g. 2024-09-12T08:22:31.652Z" />
            </div>
            <p class="or">OR</p>
            <div>
              <div class="timestamp-calculator">
                <label for="firstFrameTime">First Frame Time:</label>
                <input id="firstFrameTime" v-model="firstFrameTime" placeholder="e.g. 2024-09-12T11:46:18.567Z" />

                <label for="millisFromStart">Millis From Start:</label>
                <input id="millisFromStart" v-model="millisFromStart" type="number" placeholder="e.g. 5702000" />

                <button class="secondary-button" @click="calculateTimestamp">Calculate Timestamp</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeEndpoint === 'getMatchTimeline'" class="param-group">
        <label for="timelineGameId">Game ID:</label>
        <input id="timelineGameId" v-model="gameId" placeholder="e.g. 103462439438682788" />

        <label for="participantIds">Participant IDs (optional, comma separated):</label>
        <input id="participantIds" v-model="participantIds" placeholder="e.g. 1,2,5,8" />
        <div class="helper-note">
          Leave empty to get data for all participants. Use comma separated numbers to filter specific players.
        </div>
      </div>
    </div>

    <button
        class="test-button"
        @click="testEndpoint(
          activeEndpoint,
          activeEndpoint === 'getTournamentsForLeague' ? [leagueId] :
          activeEndpoint === 'getCompletedEvents' || activeEndpoint === 'getStandings' || activeEndpoint === 'getSchedule' ? [tournamentId] :
          activeEndpoint === 'getEventDetails' ? [matchId] :
          activeEndpoint === 'getWindow' ? [gameId, gameTimestamp] :
          activeEndpoint === 'getMatchTimeline' ? [gameId, participantIds ? participantIds.split(',').map(id => id.trim()) : []] :
          []
        )"
        :disabled="isLoading"
    >
      Test Endpoint
    </button>

    <div class="result-container">
      <h2>API Response</h2>
      <div v-if="isLoading" class="loading">Loading...</div>
      <pre v-else>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>

    <div class="helper-tips">
      <h3>Tips:</h3>
      <ul>
        <li>Start with <code>getLeagues()</code> to get all available league IDs</li>
        <li>Use a league ID to get tournaments with <code>getTournamentsForLeague(leagueId)</code></li>
        <li>Get match details with <code>getEventDetails(matchId)</code></li>
        <li>Check live matches with <code>getLive()</code></li>
        <li>Use <code>getWindow(gameId, timestamp)</code> to get game state at a specific time</li>
        <li>Use <code>getMatchTimeline(gameId)</code> to get detailed game events chronologically</li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.api-tester {
  font-family: Arial, sans-serif;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;

  h1 {
    color: #0a0e27;
    text-align: center;
    margin-bottom: 30px;
  }

  .endpoint-selector {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
    }

    select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: monospace;
    }
  }

  .params-container {
    margin-bottom: 20px;

    .param-group {
      margin-bottom: 15px;

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
      }

      input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: monospace;
        margin-bottom: 10px;
      }

      .helper-note {
        font-size: 12px;
        color: #666;
        margin-top: -5px;
        margin-bottom: 10px;
      }
    }

    .sub-params {
      border-left: 3px solid #ddd;
      padding-left: 15px;
      margin: 10px 0 15px;

      h4 {
        margin-top: 0;
        margin-bottom: 10px;
        color: #0a0e27;
      }
    }

    .two-columns {
      display: flex;
      align-items: center;

      > div {
        flex: 1;
      }

      .or {
        padding: 0 15px;
        font-weight: bold;
        color: #666;
      }
    }
  }

  .test-button {
    display: block;
    width: 100%;
    padding: 12px;
    background-color: #0a0e27;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    margin-bottom: 20px;

    &:hover {
      background-color: #1e2756;
    }

    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }

  .secondary-button {
    display: block;
    padding: 8px 12px;
    background-color: #5c6bc0;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    margin-top: 10px;

    &:hover {
      background-color: #3f51b5;
    }
  }

  .result-container {
    margin-top: 30px;

    h2 {
      margin-bottom: 15px;
      color: #0a0e27;
    }

    pre {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      overflow: auto;
      max-height: 500px;
      font-family: monospace;
      font-size: 14px;
      line-height: 1.5;
      border: 1px solid #ddd;
    }

    .loading {
      text-align: center;
      padding: 20px;
      font-style: italic;
      color: #666;
    }
  }

  .helper-tips {
    margin-top: 30px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 4px;
    border-left: 4px solid #0a0e27;

    h3 {
      margin-top: 0;
      color: #0a0e27;
    }

    ul {
      margin-bottom: 0;

      li {
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      code {
        background-color: #eee;
        padding: 2px 5px;
        border-radius: 3px;
        font-family: monospace;
      }
    }
  }
}
</style>
