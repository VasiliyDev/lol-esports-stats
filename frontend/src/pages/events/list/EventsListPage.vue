<script setup lang="ts">
import { eventApi } from "../../../api/events";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/vue-query";
import { computed, ref } from "vue";

// Query to fetch all events
const { data: events, refetch: refetchEvents } = useQuery({
  queryKey: ['events'],
  queryFn: eventApi.getAllEvents,
  placeholderData: keepPreviousData,
  enabled: computed(() => true),
  refetchOnMount: false
});

// Form input refs
const eventLink = ref('');
const eventName = ref('');
const apiError = ref('');

// Filter options
const filterOption = ref('all'); // 'all', 'parsed', 'not-parsed'

// Filtered events computed property
const filteredEvents = computed(() => {
  if (!events.value || !Array.isArray(events.value)) return [];
  let result;
  switch (filterOption.value) {
    case 'parsed':
      result = events.value.filter(event => event.parsed);
      break;
    case 'not-parsed':
      result = events.value.filter(event => !event.parsed);
      break;
    default:
      result =  events.value;
      break;
  }
  return result;
});

// Mutation for adding a new event
const { mutateAsync: addNewEvent, isPending: isAddingEvent } = useMutation({
  mutationFn: () => eventApi.createEvent({ link: eventLink.value, name: eventName.value }),
  onSuccess: (info) => {
    console.log(info, 'Event added successfully');
    // Clear form inputs
    eventLink.value = '';
    eventName.value = '';
    apiError.value = '';
    // Refresh events list
    refetchEvents();
  },
  onError: (error) => {
    apiError.value = error;
    console.error('Error adding event:', error);
  }
});

// Mutation for starting parsing
const { mutateAsync: startParsing, isPending: isParsing } = useMutation({
  mutationFn: () => eventApi.startParsing(),
  onSuccess: (info) => {
    console.log(info, 'Parsing started successfully');
    refetchEvents();
  },
  onError: (error) => {
    apiError.value = error;
    console.error('Error starting parsing:', error);
  }
});

// Format date function for better readability
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

// Function to handle form submission
const handleSubmit = async () => {
  if (!eventLink.value || !eventName.value) {
    apiError.value = 'Both link and name are required';
    return;
  }
  await addNewEvent();
};
</script>

<template>
  <div class="events-container">
    <h1 class="events-title">Tournament Events Management</h1>

    <!-- Action buttons -->
    <div class="action-buttons">
      <button
          @click="startParsing"
          class="action-button parse-button"
          :disabled="isParsing"
      >
        {{ isParsing ? 'Parsing...' : 'Start Parsing' }}
      </button>

      <!-- Filter controls -->
      <div class="filter-controls">
        <span class="filter-label">Filter:</span>
        <div class="filter-options">
          <label class="filter-option">
            <input type="radio" v-model="filterOption" value="all">
            All
          </label>
          <label class="filter-option">
            <input type="radio" v-model="filterOption" value="parsed">
            Parsed
          </label>
          <label class="filter-option">
            <input type="radio" v-model="filterOption" value="not-parsed">
            Not Parsed
          </label>
        </div>
      </div>
    </div>

    <!-- Events list -->
    <div class="events-section">
      <h2 class="section-title">Events List</h2>
      <div v-if="!events" class="loading-message">Loading events...</div>
      <div v-else-if="!Array.isArray(events)" class="error-message">Error loading events</div>
      <div v-else-if="filteredEvents?.length === 0" class="empty-message">
        No events match the current filter
      </div>
      <div v-else-if="filteredEvents" class="events-list">

        <div v-for="event in filteredEvents" class="event-card" >
          <div class="event-header">
            <h3 class="event-name">{{ event.name }}</h3>
            <span class="event-status" :class="{ 'status-parsed': event.parsed, 'status-not-parsed': !event.parsed }">
              {{ event.parsed ? 'Parsed' : 'Not Parsed' }}
            </span>
          </div>
          <div class="event-details">
            <div class="event-detail">
              <strong>ID:</strong> {{ event.id }}
            </div>
            <div class="event-detail">
              <strong>Link:</strong>
              <a :href="event.link" target="_blank" class="event-link">{{ event.link }}</a>
            </div>
            <div class="event-detail">
              <strong>Parsed at:</strong> {{ formatDate(event.parsed_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add new event form -->
    <div class="form-section">
      <h2 class="section-title">Add New Event</h2>
      <form @submit.prevent="handleSubmit" class="event-form">
        <div class="form-group">
          <label for="event-link" class="form-label">Tournament Link</label>
          <input
              id="event-link"
              v-model="eventLink"
              class="form-input"
              placeholder="https://gol.gg/tournament/..."
              :disabled="isAddingEvent"
          >
        </div>

        <div class="form-group">
          <label for="event-name" class="form-label">Tournament Name</label>
          <input
              id="event-name"
              v-model="eventName"
              class="form-input"
              placeholder="LEC 2025 Winter Playoffs"
              :disabled="isAddingEvent"
          >
        </div>

        <button
            type="submit"
            class="action-button add-button"
            :disabled="isAddingEvent"
        >
          {{ isAddingEvent ? 'Adding...' : 'Add Event' }}
        </button>

        <div v-if="apiError" class="error-message">
          {{ typeof apiError === 'string' ? apiError : 'An error occurred' }}
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.events-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.events-title {
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
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.parse-button {
  background-color: #4caf50;
  color: white;
}

.parse-button:hover:not(:disabled) {
  background-color: #45a049;
}

.add-button {
  background-color: #2196f3;
  color: white;
}

.add-button:hover:not(:disabled) {
  background-color: #0b7dda;
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

.events-section, .form-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.events-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.event-card {
  background-color: white;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s;
  border-left: 5px solid #ccc;
}

.event-card:hover {
  transform: translateY(-3px);
}

.event-card.parsed {
  border-left-color: #4caf50;
}

.event-card:not(.parsed) {
  border-left-color: #ff9800;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.event-name {
  font-size: 16px;
  margin: 0;
  color: #333;
}

.event-status {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: bold;
}

.status-parsed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-not-parsed {
  background-color: #fff3e0;
  color: #ef6c00;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-detail {
  font-size: 14px;
  line-height: 1.4;
  display:flex;
  gap:5px;
}

.event-link {
  color: #2196f3;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  display: inline-block;
}

.event-link:hover {
  text-decoration: underline;
}

.event-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  font-weight: bold;
  color: #555;
}

.form-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 1px #2196f3;
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
</style>
