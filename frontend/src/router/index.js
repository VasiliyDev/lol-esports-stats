import { createRouter, createWebHistory } from 'vue-router'

// Import your view components
import EventsListPage from "../pages/events/list/EventsListPage.vue";
import GamesListPage from "../pages/games/list/GamesListPage.vue";
// Import other views as needed

const routes = [
    {
        path: '/',
        name: 'events',
        component: EventsListPage
    },
    {
        path: '/events',
        name: 'events',
        component: EventsListPage
    },
    {
        path: '/games',
        name: 'games',
        component: GamesListPage
    }
    // Add more routes as needed
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
