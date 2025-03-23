<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import CollectionSidebar from "./components/CollectionSidebar.vue";

const route = useRoute();
const activeRoute = ref(route.name);
</script>

<template>
  <div class="app-container">
    <nav class="app-nav">
      <div class="nav-logo">Tournament Tracker</div>
      <div class="nav-links">
        <router-link
            :to="`/games`"
            class="nav-link"
            :class="{ active: route.path.includes('/games') }"
        >
          Games
        </router-link>
        <router-link
            :to="`/champions`"
            class="nav-link"
            :class="{ active: route.path.includes('/champions') }"
        >
          Champions
        </router-link>
        <router-link
            :to="`/events`"
            class="nav-link"
            :class="{ active: route.path.includes('/events') }"
        >
          Events
        </router-link>
      </div>
    </nav>

    <main class="app-content">
      <router-view />
      <CollectionSidebar/>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width:100svh;
}

.app-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #2c3e50;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-logo {
  font-size: 20px;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #a8b6c5;
  text-decoration: none;
  font-weight: 500;
  padding: 10px 15px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  color: white;
  background-color: rgba(255, 255, 255, 0.15);
}

.app-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  display:flex;
}

@media (max-width: 600px) {
  .app-nav {
    flex-direction: column;
    height: auto;
    padding: 15px;
  }

  .nav-logo {
    margin-bottom: 10px;
  }

  .nav-links {
    width: 100%;
    justify-content: space-around;
  }
}
</style>
