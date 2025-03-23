<script setup>
import { useQuery, useMutation } from "@tanstack/vue-query";
import { ref, computed } from "vue";
import { collectionApi } from "@/api/collections.js";
import {useCollectionStore} from "@/stores/collection.js"; // Assuming you have this API


const collectionsStore = useCollectionStore()
// Router for navigation


// Query to fetch all collections
const { data: collections, refetch: refetchCollections } = useQuery({
  queryKey: ['collections'],
  queryFn: collectionApi.getAllCollections,
  refetchOnMount: true
});


// Filter options
const filterOption = ref('all'); // 'all', 'empty', 'with-games'

// Filtered collections computed property
const filteredCollections = computed(() => {
  if (!collections.value || !Array.isArray(collections.value)) return [];

  let result;
  switch (filterOption.value) {
    case 'empty':
      result = collections.value.filter(collection =>
          !collection.games || collection.games.length === 0
      );
      break;
    case 'with-games':
      result = collections.value.filter(collection =>
          collection.games && collection.games.length > 0
      );
      break;
    default:
      result = collections.value;
      break;
  }
  return result;
});

// Mutation for deleting a collection
const { mutateAsync: deleteCollection, isPending: isDeletingCollection } = useMutation({
  mutationFn: (id) => collectionApi.deleteCollection(id),
  onSuccess: () => {
    refetchCollections();
  },
  onError: (error) => {
    console.error('Error deleting collection:', error);
  }
});

// Function to handle form submission


// Function to open a collection
const openCollection = async (id) => {
 await collectionsStore.getCollectionById(id)
};


</script>

<template>
  <div class="collections-container">
    <h1 class="collections-title">Game Collections Management</h1>

    <!-- Action buttons and filters -->
    <div class="action-buttons">
      <div></div> <!-- Empty div for layout balance -->

      <!-- Filter controls -->
      <div class="filter-controls">
        <span class="filter-label">Filter:</span>
        <div class="filter-options">
          <label class="filter-option">
            <input type="radio" v-model="filterOption" value="all">
            All
          </label>
          <label class="filter-option">
            <input type="radio" v-model="filterOption" value="with-games">
            With Games
          </label>
          <label class="filter-option">
            <input type="radio" v-model="filterOption" value="empty">
            Empty
          </label>
        </div>
      </div>
    </div>

    <!-- Collections list -->
    <div class="collections-section">
      <h2 class="section-title">Collections List</h2>
      <div v-if="!collections" class="loading-message">Loading collections...</div>
      <div v-else-if="!Array.isArray(collections)" class="error-message">Error loading collections</div>
      <div v-else-if="filteredCollections.length === 0" class="empty-message">
        No collections match the current filter
      </div>
      <div v-else class="table-wrapper">
        <table>
          <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Games Count</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="collection in filteredCollections" :key="collection.id">
            <td>{{ collection.id }}</td>
            <td>{{ collection.name }}</td>
            <td>{{ collection.games ? collection.games.length : 0 }}</td>
            <td>
              <div class="controls d-flex ac">
                <button
                    class="action-button open-button"
                    @click="openCollection(collection.id)"
                >
                  Open
                </button>
                <button
                    class="action-button delete-button"
                    @click="deleteCollection(collection.id)"
                    :disabled="isDeletingCollection"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add new collection form -->
  </div>
</template>

<style scoped>
.collections-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.collections-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 15px;
  color: #555;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.action-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-right: 5px;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.open-button {
  background-color: #3498db;
  color: white;
}

.open-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
}

.delete-button:hover:not(:disabled) {
  background-color: #c0392b;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-weight: bold;
  color: #555;
}

.filter-options {
  display: flex;
  gap: 15px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.collections-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.loading-message, .empty-message {
  text-align: center;
  padding: 20px;
  color: #757575;
  font-style: italic;
}

.error-message {
  color: #d32f2f;
  background-color: #ffebee;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 14px;
}

.d-flex {
  display: flex;
}

.ac {
  align-items: center;
}

.controls {
  gap: 4px;
}
</style>
