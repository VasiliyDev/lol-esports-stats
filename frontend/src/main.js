import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import {createPinia} from "pinia";


const app = createApp(App)
const pinia = createPinia()
// Configure Vue Query with default options
app.use(VueQueryPlugin, {
    queryClientConfig: {
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false, // Don't refetch when window gets focus
                retry: 1, // Only retry failed queries once
                staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
            },
        },
    },
})

app.use(router)
app.use(pinia)
app.mount('#app')
