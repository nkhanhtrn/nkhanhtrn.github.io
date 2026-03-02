<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

onMounted(() => {
  // Load config from sessionStorage to useGitHub composable
  const STORAGE_KEY = 'appstore_github_config'
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      const config = JSON.parse(stored)
      // Set environment variables for the current session
      if (config.owner) {
        ;(import.meta.env as any).VITE_GITHUB_OWNER = config.owner
      }
      if (config.repo) {
        ;(import.meta.env as any).VITE_GITHUB_REPO = config.repo
      }
      if (config.token) {
        ;(import.meta.env as any).VITE_GITHUB_TOKEN = config.token
      }
    }
  } catch {
    // Ignore errors
  }
})
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  color: #1a1a1a;
  background: #f5f5f5;
  line-height: 1.5;
}

#app {
  min-height: 100vh;
}

a {
  color: #4CAF50;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  font-family: inherit;
}
</style>
