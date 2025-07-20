import { createRouter, createWebHistory } from 'vue-router'

// Import your view components
import EventsListPage from "../pages/events/list/EventsListPage.vue";
import GamesListPage from "../pages/games/list/GamesListPage.vue";
import ChampionList from "../pages/champions/ChampionList.vue";
import CollectionPage from "@/pages/collections/CollectionPage.vue";
import CollectionsList from "@/pages/collections/CollectionsList.vue"
import TestPage from "@/pages/testPage/TestPage.vue";
import SingleGame from "@/pages/games/components/SingleGame.vue";
import ClassificationList from "@/pages/classifications/ClassificationList.vue";
import ClassificationPage from "@/pages/classifications/ClassificationPage.vue";

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
    },
    {
        path: '/games/:id',
        component: SingleGame,
        props: true
    },
    {
        path: '/champions',
        name: 'champions',
        component: ChampionList
    },
    {
        path: '/collection',
        name: 'collection',
        component: CollectionPage
    },
    {
        path: '/collections',
        name: 'collections',
        component: CollectionsList,
    },
    {
        path: '/test',
        name: "test",
        component: TestPage
    },
    {
        path: '/classifications',
        name: 'ClassificationsList',
        component: ClassificationList
    },
    {
        path: '/classifications/:id',
        name: 'ClassificationDetail',
        component: ClassificationPage
    }

    // Add more routes as needed
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
