<script setup lang="ts">
import {ref, onMounted, watch, computed} from 'vue';
import {keepPreviousData, useQuery} from "@tanstack/vue-query";
import {gameApi} from "../../../api/games";
import {Line} from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const {id: gameId} = defineProps<{
  id: number | string
}>();

// Use Vue Query to fetch game data
const {data: gameData} = useQuery({
  queryKey: ['game', gameId],
  queryFn: () => gameApi.getGameById(gameId),
  placeholderData: keepPreviousData,
  refetchOnMount: true
});

// Toggle for view mode (player or team)
const viewMode = ref('team'); // 'player' or 'team'

// Chart data and options
const chartData = ref({
  labels: [],
  datasets: []
});

const goldDiffChartData = ref({
  labels: [],
  datasets: []
});

const normalizedGodDiffWidth = ref(3);

const goldDiffNormalizedChartData = ref({
  labels: [],
  datasets: []
})

const goldDerivativeChartData = ref({
  labels:[],
  datasets: []
})

// NEW: Simplified gold diff chart data
const simplifiedGoldDiffChartData = ref({
  labels: [],
  datasets: []
});

// Format gold values
const formatGold = (value) => {
  return `${(value / 1000).toFixed(1)}k`;
};

// Chart options with formatter
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Player Gold Progression by Position'
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${formatGold(context.raw)} gold`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Gold Amount'
      },
      ticks: {
        callback: function (value) {
          return formatGold(value);
        }
      }
    },
    x: {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'Time (minutes)'
      },
      ticks: {
        callback: function(value) {
          const minutes = Math.floor(value / 60);
          const seconds = Math.floor(value % 60);
          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      }
    }
  }
};

const goldDiffOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Gold Difference (Blue - Red)'
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const sign = context.raw > 0 ? '+' : '';
          return `Difference: ${sign}${formatGold(context.raw)}`;
        }
      }
    }
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'Gold Difference'
      },
      ticks: {
        callback: function (value) {
          return formatGold(value);
        }
      }
    },
    x: {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'Time (minutes)'
      },
      ticks: {
        callback: function(value) {
          const minutes = Math.floor(value / 60);
          const seconds = Math.floor(value % 60);
          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      }
    }
  }
};

const goldDiffNormalizedOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Gold Difference Normalized (Blue - Red)'
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const sign = context.raw > 0 ? '+' : '';
          return `Difference: ${sign}${formatGold(context.raw)}`;
        }
      }
    }
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'Gold Difference Normalized'
      },
      ticks: {
        callback: function (value) {
          return formatGold(value);
        }
      }
    },
    x: {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'Time (minutes)'
      },
      ticks: {
        callback: function(value) {
          const minutes = Math.floor(value / 60);
          const seconds = Math.floor(value % 60);
          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      }
    }
  }
};

const goldDerivativeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Gold Difference Derivative (Blue - Red)'
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const sign = context.raw > 0 ? '+' : '';
          return `Difference: ${sign}${formatGold(context.raw)}`;
        }
      }
    }
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'Gold Derivative'
      },
      ticks: {
        callback: function (value) {
          return formatGold(value);
        }
      }
    },
    x: {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'Time (minutes)'
      },
      ticks: {
        callback: function(value) {
          const minutes = Math.floor(value / 60);
          const seconds = Math.floor(value % 60);
          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      }
    }
  }
};

// NEW: Options for simplified gold diff chart
const simplifiedGoldDiffOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Simplified Gold Difference (Blue - Red)'
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const sign = context.raw > 0 ? '+' : '';
          return `Difference: ${sign}${formatGold(context.raw)}`;
        }
      }
    }
  },
  scales: {
    y: {
      title: {
        display: true,
        text: 'Simplified Gold Difference'
      },
      ticks: {
        callback: function (value) {
          return formatGold(value);
        }
      }
    },
    x: {
      type: 'linear',
      position: 'bottom',
      title: {
        display: true,
        text: 'Time (minutes)'
      },
      ticks: {
        callback: function(value) {
          const minutes = Math.floor(value / 60);
          const seconds = Math.floor(value % 60);
          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      }
    }
  }
};

// Function to generate colors for players by position and team
const generatePlayerColor = (position) => {
  // Define color palettes for two teams (positions 1-5 for blue team and 6-10 for red team)
  const blueTeamColors = [
    'rgba(54, 162, 235, 0.8)',   // Blue team (Top)
    'rgba(54, 162, 235, 0.75)',  // Blue team (Jungle)
    'rgba(54, 162, 235, 0.7)',   // Blue team (Mid)
    'rgba(54, 162, 235, 0.65)',  // Blue team (Bottom)
    'rgba(54, 162, 235, 0.6)'    // Blue team (Support)
  ];

  const redTeamColors = [
    'rgba(255, 99, 132, 0.8)',   // Red team (Top)
    'rgba(255, 99, 132, 0.75)',  // Red team (Jungle)
    'rgba(255, 99, 132, 0.7)',   // Red team (Mid)
    'rgba(255, 99, 132, 0.65)',  // Red team (Bottom)
    'rgba(255, 99, 132, 0.6)'    // Red team (Support)
  ];

  return position <= 5 ?
      blueTeamColors[position - 1] :
      redTeamColors[position - 6];
};

// Team colors
const blueTeamColor = 'rgba(54, 162, 235, 0.8)';
const redTeamColor = 'rgba(255, 99, 132, 0.8)';

// Sort players by position function
const sortPlayersByPosition = (players) => {
  const positionOrder = {"top": 1, "jungle": 2, "mid": 3, "bottom": 4, "support": 5};
  return players.sort((a, b) => positionOrder[a.position] - positionOrder[b.position]);
};

// Compute players grouped by team
const blueTeamPlayers = computed(() => {
  if (!gameData.value) return [];
  const players = gameData.value.gamePlayers.filter(p => p.team_side === "blue");
  return sortPlayersByPosition(players);
});

const redTeamPlayers = computed(() => {
  if (!gameData.value) return [];
  const players = gameData.value.gamePlayers.filter(p => p.team_side === "red");
  return sortPlayersByPosition(players);
});

const calcAverageGoldNormalized = (array, index, width = normalizedGodDiffWidth.value) => {
  if (!array || array.length === 0) {
    return 0;
  }

  // Calculate the start and end indices for the range we want to average
  const startIndex = Math.max(0, index - width);
  const endIndex = Math.min(array.length - 1, index + width);

  let sum = 0;
  let count = 0;

  // Sum up the elements in the range
  for (let i = startIndex; i <= endIndex; i++) {

    if (array[i] !== undefined && !isNaN(array[i])) {
      sum += array[i];
      count++;
    }
  }

  // Avoid division by zero
  if (count === 0) {
    return 0;
  }

  return Math.round(sum / count);
};

// NEW: Function to create simplified gold diff data based on derivative state changes
const createSimplifiedGoldDiffData = (normalizedData, derivativeData, frameIds, frameTimeSeconds) => {
  if (!normalizedData || !normalizedData.length || !derivativeData || !derivativeData.length ||
      !frameIds || !frameIds.length || !frameTimeSeconds || !frameTimeSeconds.length) {
    console.warn("Missing data for simplification");
    return { labels: [], data: [], timeLabels: [] };
  }

  // Always include first and last points
  const simplifiedLabels = [frameIds[0]];
  const simplifiedData = [normalizedData[0]];
  const simplifiedTimeLabels = [frameTimeSeconds[0]];
  const simplifiedIndices = [0]; // Keep track of original indices

  // Function to determine the state of a derivative value
  const getState = (value) => {
    if (value > 0) return '+';
    if (value < 0) return '-';
    return '0';
  };

  let currentState = getState(derivativeData[0]);
  let lastIncludedIndex = 0;

  for (let i = 1; i < derivativeData.length - 1; i++) {
    const newState = getState(derivativeData[i]);

    // Check if state has changed
    if (newState !== currentState) {
      // Look ahead 10 points or until the end
      const lookAheadCount = Math.min(10, derivativeData.length - i - 1);
      let stateChangesCount = 0;

      for (let j = 0; j < lookAheadCount; j++) {
        if (getState(derivativeData[i + j]) === newState) {
          stateChangesCount++;
        }
      }

      // If the new state is predominant in the next few points, include this point
      if (stateChangesCount > lookAheadCount / 2) {
        simplifiedLabels.push(frameIds[i]);
        simplifiedData.push(normalizedData[i]);
        simplifiedTimeLabels.push(frameTimeSeconds[i]);
        simplifiedIndices.push(i);
        currentState = newState;
        lastIncludedIndex = i;
      }
    }
  }

  // Always include the last point if it's not already included
  if (lastIncludedIndex < normalizedData.length - 1) {
    const lastIndex = normalizedData.length - 1;
    simplifiedLabels.push(frameIds[lastIndex]);
    simplifiedData.push(normalizedData[lastIndex]);
    simplifiedTimeLabels.push(frameTimeSeconds[lastIndex]);
    simplifiedIndices.push(lastIndex);
  }

  console.log("Original data points:", normalizedData.length);
  console.log("Simplified data points:", simplifiedData.length);

  return {
    labels: simplifiedLabels,
    data: simplifiedData,
    timeLabels: simplifiedTimeLabels,
    indices: simplifiedIndices
  };
};

// Function to update chart data based on selected view mode
const updateChartData = (newData) => {
  try {
    console.log("Processing game data for view mode:", viewMode.value);

    // Check the structure of the data
    const frames = Array.isArray(newData.framesPlayer) ? newData.framesPlayer : [];
    if (frames.length === 0) {
      console.warn("No frames found in the data");
      return;
    }

    // Extract frame timestamps for labels and actual timestamps for scaling
    const firstTimestamp = new Date(frames[0].timestamp).getTime();
    const frameTimestamps = frames.map(frame => new Date(frame.timestamp).getTime());

    // Calculate actual seconds from game start for each frame (for proper time scaling)
    const frameTimeSeconds = frameTimestamps.map(timestamp =>
        Math.floor((timestamp - firstTimestamp) / 1000)
    );

    // Create human-readable labels
    const frameIds = frames.map(frame => {
      const currentTimestamp = new Date(frame.timestamp).getTime();
      const diffInSeconds = Math.floor((currentTimestamp - firstTimestamp) / 1000);
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      return minutes === 0 && seconds === 0 ?
          '00:00' :
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });

    if (viewMode.value === 'player') {
      // Create datasets for players grouped by team
      const datasets = [];

      // Blue team players (positions 1-5)
      blueTeamPlayers.value.forEach((player, index) => {
        const position = index + 1; // Positions 1-5 for blue team
        const playerName = `${player.player?.name}` || `Player ${position}`;

        datasets.push({
          label: `${newData.blueTeam.code} ${playerName}`,
          data: Array(frames.length).fill(null),
          borderColor: generatePlayerColor(position),
          backgroundColor: generatePlayerColor(position).replace('0.8', '0.2'),
          tension: 0.1,
          borderWidth: 1,
          pointRadius: 1
        });
      });

      // Red team players (positions 6-10)
      redTeamPlayers.value.forEach((player, index) => {
        const position = index + 6; // Positions 6-10 for red team
        const playerName = player.player?.name || `Player ${position}`;

        datasets.push({
          label: `${newData.redTeam.code} ${playerName}`,
          data: Array(frames.length).fill(null),
          borderColor: generatePlayerColor(position),
          backgroundColor: generatePlayerColor(position).replace('0.8', '0.2'),
          tension: 0.1,
          borderWidth: 1,
          pointRadius: 1
        });
      });

      // Fill in data for each frame
      frames.forEach((frame, frameIndex) => {
        if (Array.isArray(frame.championsGold)) {
          frame.championsGold.forEach(champion => {
            const playerIndex = champion.position_number - 1;
            if (playerIndex >= 0 && playerIndex < datasets.length) {
              datasets[playerIndex].data[frameIndex] = champion.gold_amount;
            }
          });
        }
      });

      // Update chart data with proper time scaling
      chartData.value = {
        labels: frameTimeSeconds,
        datasets: datasets
      };

      // Update chart title for player view
      chartOptions.plugins.title.text = 'Player Gold Progression';

    } else {
      // Team view - aggregate gold by team
      const blueTeamData = Array(frames.length).fill(0);
      const redTeamData = Array(frames.length).fill(0);
      const goldDiff = Array(frames.length).fill(0);
      const goldDiffNormalized = Array(frames.length).fill(0);
      const goldDerivative = Array(frames.length).fill(0);

      // Calculate total gold for each team per frame
      frames.forEach((frame, frameIndex) => {
        if (Array.isArray(frame.championsGold)) {
          frame.championsGold.forEach(champion => {
            const position = champion.position_number;
            if (position >= 1 && position <= 5) {
              // Blue team (positions 1-5)
              blueTeamData[frameIndex] += champion.gold_amount;
            } else if (position >= 6 && position <= 10) {
              // Red team (positions 6-10)
              redTeamData[frameIndex] += champion.gold_amount;
            }
          });

          // Calculate gold difference
          goldDiff[frameIndex] = blueTeamData[frameIndex] - redTeamData[frameIndex];
        }
      });

      goldDiff.forEach((gold, frameIndex) => {
        goldDiffNormalized[frameIndex] = calcAverageGoldNormalized(goldDiff, frameIndex, normalizedGodDiffWidth.value);
      })

      goldDiffNormalized.forEach((gold, frameIndex) => {
        if (frameIndex === 0) { goldDerivative[frameIndex] = 0; }
        else
          goldDerivative[frameIndex] = goldDiffNormalized[frameIndex] - goldDiffNormalized[frameIndex - 1]
      })

      // Create datasets for teams with proper time scaling
      chartData.value = {
        labels: frameTimeSeconds,
        datasets: [
          {
            label: `${newData.blueTeam.code} (${newData.blueTeam.name})`,
            data: blueTeamData,
            borderColor: blueTeamColor,
            backgroundColor: blueTeamColor.replace('0.8', '0.2'),
            tension: 0.1,
            borderWidth: 1,
            pointRadius: 1
          },
          {
            label: `${newData.redTeam.code} (${newData.redTeam.name})`,
            data: redTeamData,
            borderColor: redTeamColor,
            backgroundColor: redTeamColor.replace('0.8', '0.2'),
            tension: 0.1,
            borderWidth: 1,
            pointRadius: 1
          }
        ]
      };

      // Create gold difference chart data with proper time scaling
      goldDiffChartData.value = {
        labels: frameTimeSeconds,
        datasets: [
          {
            label: 'Gold Difference',
            data: goldDiff,
            borderColor: 'rgba(75, 192, 192, 0.8)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            borderWidth: 1,
            pointRadius: 1,
            fill: true
          }
        ]
      };

      goldDiffNormalizedChartData.value = {
        labels: frameTimeSeconds,
        datasets: [
          {
            label: 'Gold Difference Normalized',
            data: goldDiffNormalized,
            borderColor: 'rgba(75, 192, 192, 0.8)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            borderWidth: 1,
            pointRadius: 1,
            fill: true
          }
        ]
      };

      // Update chart title for team view
      chartOptions.plugins.title.text = 'Team Gold Progression';

      // Fix: Use frameTimeSeconds instead of frameIds for derivative chart
      goldDerivativeChartData.value = {
        labels: frameTimeSeconds,
        datasets: [
          {
            label: 'Gold Derivative',
            data: goldDerivative,
            borderColor: 'rgba(75, 192, 192, 0.8)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            borderWidth: 1,
            pointRadius: 1,
            fill: true
          }
        ]
      };

      // NEW: Create simplified gold diff chart data with proper time scaling
      const { data: simplifiedData, timeLabels: simplifiedTimeLabels } = createSimplifiedGoldDiffData(
          goldDiffNormalized,
          goldDerivative,
          frameIds,
          frameTimeSeconds
      );

      simplifiedGoldDiffChartData.value = {
        labels: simplifiedTimeLabels,
        datasets: [
          {
            label: 'Simplified Gold Difference',
            data: simplifiedData,
            borderColor: 'rgba(153, 102, 255, 0.8)', // Different color to distinguish from other charts
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            tension: 0.1,
            borderWidth: 2, // Slightly thicker line to emphasize key points
            pointRadius: 3, // Larger points to emphasize the key moments
            fill: true
          }
        ]
      };
    }
    console.log("Chart data updated:", goldDiffNormalizedChartData.value);

  } catch (error) {
    console.error("Error processing game data:", error);
  }
};

// MOVE WATCHERS AFTER FUNCTION DECLARATION
// Watch for changes in view mode and update chart
watch(viewMode, () => {
  if (gameData.value) {
    updateChartData(gameData.value);
  }
});

// Watch for changes in game data and update chart
watch(() => gameData.value, (newData) => {
  if (!newData) return;
  updateChartData(newData);
}, {immediate: true});

watch(() => normalizedGodDiffWidth.value, (newWidth) => {
  // Convert to number first if it's a string
  const numWidth = typeof newWidth === 'string' ? parseFloat(newWidth) : newWidth

  // Check if valid number after conversion
  if (numWidth === undefined || typeof numWidth !== 'number' || isNaN(numWidth) || numWidth < 0) return

  const roundedWidth = Math.round(numWidth)
  if (roundedWidth === 0) return
  if (numWidth !== roundedWidth) {
    normalizedGodDiffWidth.value = roundedWidth;
    return;
  }

  updateChartData(gameData.value);
})
</script>

<template>
  <div class="game-analysis">
    <!-- Your existing chart components go here -->
    

    <!-- Your existing Line chart components -->
    <div class="charts-container">
      <div class="chart-wrapper">
        <Line :data="chartData" :options="chartOptions" />
      </div>
      
      <div class="chart-wrapper">
        <Line :data="goldDiffChartData" :options="goldDiffOptions" />
      </div>
      
      <!-- ... other charts ... -->
    </div>
  </div>
</template>

<style scoped lang="scss">
.game-analysis {
  padding: 20px;
  width:100%;
}

.classification-section {
  width:100%;
  margin-bottom: 40px;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.chart-wrapper {
  height: 400px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>