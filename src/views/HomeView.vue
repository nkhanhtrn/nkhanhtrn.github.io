<template>
  <div class="home-view">
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect width="24" height="24" rx="6"/>
            <path d="M6 8h12M6 12h12M6 16h8" fill="#fff" opacity="0.9"/>
          </svg>
          <h1>App Store</h1>
        </div>
        <div class="header-actions">
          <a href="https://nkhanhtrn.github.io/chat/#/notebooks" class="shortcut-btn" target="_blank" rel="noopener" title="Notes">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </a>
          <a href="https://nkhanhtran.github.io/chat/#/books" class="shortcut-btn" target="_blank" rel="noopener" title="Reading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </a>
          <a href="https://nkhanhtrn.github.io/trading-journal/" class="shortcut-btn" target="_blank" rel="noopener" title="Trading Journal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </a>
          <button class="refresh-btn" @click="refresh" :disabled="loading">
            <svg :class="{ spin: loading }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
          <router-link to="/settings" class="settings-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243M9.879 16.243L5.636 20.486m12.728-12.728l-4.243 4.243M9.879 7.757L5.636 3.514"/>
            </svg>
          </router-link>
        </div>
      </div>
    </header>

    <main class="main">
      <!-- Loading State -->
      <div v-if="loading && apps.length === 0" class="state-container">
        <div class="spinner"></div>
        <p>Loading apps...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="state-container error">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
        <h2>Failed to load apps</h2>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="refresh">Try Again</button>
        <div class="config-hint">
          <p>Make sure to configure:</p>
          <code>VITE_GITHUB_OWNER</code>
          <code>VITE_GITHUB_REPO</code>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="apps.length === 0" class="state-container empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M12 8v8M8 12h8"/>
        </svg>
        <h2>No apps available</h2>
        <p>Create a GitHub release with an APK file to get started.</p>
        <a href="https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository" target="_blank" rel="noopener" class="learn-more">
          Learn about GitHub Releases
        </a>
      </div>

      <!-- Apps List -->
      <div v-else class="apps-container">
        <div class="filters">
          <button
            class="filter-btn"
            :class="{ active: filter === 'all' }"
            @click="filter = 'all'"
          >
            All ({{ filteredApps.length }})
          </button>
          <button
            class="filter-btn"
            :class="{ active: filter === 'stable' }"
            @click="filter = 'stable'"
          >
            Stable ({{ stableApps.length }})
          </button>
          <button
            class="filter-btn"
            :class="{ active: filter === 'beta' }"
            @click="filter = 'beta'"
          >
            Beta ({{ betaApps.length }})
          </button>
        </div>

        <div class="apps-list">
          <AppCard
            v-for="app in filteredApps"
            :key="app.id"
            :app="app"
            @click="showDetail(app)"
          />
        </div>
      </div>
    </main>

    <!-- App Detail Modal -->
    <AppDetail
      v-if="selectedApp"
      :app="selectedApp"
      @close="selectedApp = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGitHub } from '../composables/useGitHub'
import AppCard from '../components/AppCard.vue'
import AppDetail from '../components/AppDetail.vue'
import type { AppInfo } from '../composables/useGitHub'

const { apps, loading, error, fetchReleases } = useGitHub()

const filter = ref<'all' | 'stable' | 'beta'>('all')
const selectedApp = ref<AppInfo | null>(null)

const stableApps = computed(() => apps.value.filter(a => !a.isPrerelease))
const betaApps = computed(() => apps.value.filter(a => a.isPrerelease))

const filteredApps = computed(() => {
  switch (filter.value) {
    case 'stable':
      return stableApps.value
    case 'beta':
      return betaApps.value
    default:
      return apps.value
  }
})

async function refresh() {
  await fetchReleases(true)
}

function showDetail(app: AppInfo) {
  selectedApp.value = app
}

onMounted(() => {
  fetchReleases()
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo svg {
  width: 36px;
  height: 36px;
  color: #4CAF50;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.refresh-btn,
.settings-btn,
.shortcut-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f5f5f5;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #616161;
  text-decoration: none;
}

.refresh-btn:hover:not(:disabled),
.settings-btn:hover,
.shortcut-btn:hover {
  background: #e8e8e8;
  color: #1a1a1a;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn svg,
.settings-btn svg,
.shortcut-btn svg {
  width: 20px;
  height: 20px;
}

.refresh-btn svg.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #616161;
}

.state-container svg {
  width: 64px;
  height: 64px;
  margin-bottom: 1.5rem;
  color: #9e9e9e;
}

.state-container.error svg {
  color: #f44336;
}

.state-container.error h2 {
  color: #f44336;
}

.state-container h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #424242;
  margin: 0 0 0.5rem 0;
}

.state-container p {
  margin: 0 0 1.5rem 0;
  max-width: 400px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.retry-btn {
  padding: 0.75rem 2rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #45a049;
}

.config-hint {
  margin-top: 2rem;
  padding: 1rem;
  background: #fff3e0;
  border-radius: 8px;
}

.config-hint p {
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.config-hint code {
  display: block;
  padding: 0.25rem 0.5rem;
  background: #fff;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875rem;
  color: #e65100;
  margin: 0.25rem 0;
}

.learn-more {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 500;
}

.learn-more:hover {
  text-decoration: underline;
}

.apps-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.625rem 1.25rem;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 9999px;
  font-weight: 500;
  color: #616161;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #bdbdbd;
  color: #424242;
}

.filter-btn.active {
  background: #4CAF50;
  border-color: #4CAF50;
  color: white;
}

.apps-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

@media (max-width: 640px) {
  .header-content {
    padding: 0.75rem;
  }

  .logo h1 {
    font-size: 1.25rem;
  }

  .main {
    padding: 1rem;
  }

  .apps-list {
    grid-template-columns: 1fr;
  }

  .filters {
    justify-content: center;
  }

  .filter-btn {
    flex: 1;
    min-width: 80px;
    text-align: center;
  }
}
</style>
