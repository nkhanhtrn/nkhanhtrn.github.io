import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import SettingsView from './views/SettingsView.vue'

import './assets/main.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    }
  ]
})

const app = createApp(App)

app.use(router)

app.mount('#app')
