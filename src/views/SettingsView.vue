<template>
  <div class="settings-view">
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </router-link>
        <h1>Settings</h1>
      </div>
    </header>

    <main class="main">
      <section class="section">
        <h2>GitHub Configuration</h2>
        <p class="section-desc">
          Configure which GitHub repository to fetch releases from.
          These settings are stored locally on your device.
        </p>

        <form @submit.prevent="saveConfig" class="config-form">
          <div class="form-group">
            <label for="owner">Repository Owner</label>
            <input
              id="owner"
              v-model="form.owner"
              type="text"
              placeholder="e.g., facebook"
              required
            />
            <span class="help">The username or organization that owns the repository</span>
          </div>

          <div class="form-group">
            <label for="repo">Repository Name</label>
            <input
              id="repo"
              v-model="form.repo"
              type="text"
              placeholder="e.g., react-native"
              required
            />
            <span class="help">The name of the repository (not the full URL)</span>
          </div>

          <div class="form-group">
            <label for="token">GitHub Token (Optional)</label>
            <input
              id="token"
              v-model="form.token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
            />
            <span class="help">
              Required only if you hit rate limits. Create a token with
              <code>public_repo</code> scope at GitHub Settings → Developer Settings
            </span>
          </div>

          <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Configuration' }}
            </button>
            <button type="button" class="reset-btn" @click="resetConfig">
              Reset to Defaults
            </button>
          </div>
        </form>

        <div v-if="saveStatus" class="status" :class="saveStatus.type">
          {{ saveStatus.message }}
        </div>
      </section>

      <section class="section">
        <h2>Current Configuration</h2>
        <div class="current-config">
          <div class="config-item">
            <span class="label">API Endpoint:</span>
            <span class="value">{{ currentEndpoint || 'Not configured' }}</span>
          </div>
          <div class="config-item">
            <span class="label">Releases URL:</span>
            <a
              v-if="form.owner && form.repo"
              :href="releasesUrl"
              target="_blank"
              rel="noopener"
              class="value link"
            >
              {{ releasesUrl }}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
            </a>
            <span v-else class="value">Not configured</span>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>About</h2>
        <div class="about">
          <p>
            This PWA fetches Android apps from GitHub Releases.
            Simply create releases with APK files to distribute your apps.
          </p>
          <div class="app-info">
            <span>App Store PWA v1.0.0</span>
            <span>•</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener"
            >
              Source Code
            </a>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const STORAGE_KEY = 'appstore_github_config'

interface Config {
  owner: string
  repo: string
  token: string
}

interface Status {
  type: 'success' | 'error'
  message: string
}

const router = useRouter()

const form = ref<Config>({
  owner: '',
  repo: '',
  token: ''
})

const saving = ref(false)
const saveStatus = ref<Status | null>(null)

const currentEndpoint = computed(() => {
  if (!form.value.owner || !form.value.repo) return ''
  return `/repos/${form.value.owner}/${form.value.repo}/releases`
})

const releasesUrl = computed(() => {
  if (!form.value.owner || !form.value.repo) return ''
  return `https://github.com/${form.value.owner}/${form.value.repo}/releases`
})

function loadConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const config = JSON.parse(stored) as Config
      form.value = config
    }
  } catch (error) {
    console.error('Failed to load config:', error)
  }
}

async function saveConfig() {
  saving.value = true
  saveStatus.value = null

  try {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form.value))

    // Save to sessionStorage for immediate use
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form.value))

    // Clear any cached releases to force refresh
    localStorage.removeItem('appstore_releases_cache')

    saveStatus.value = {
      type: 'success',
      message: 'Configuration saved! Reloading...'
    }

    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    saveStatus.value = {
      type: 'error',
      message: 'Failed to save configuration. Please try again.'
    }
  } finally {
    saving.value = false
  }
}

function resetConfig() {
  if (confirm('Reset configuration to defaults?')) {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    form.value = { owner: '', repo: '', token: '' }
    saveStatus.value = {
      type: 'success',
      message: 'Configuration reset. Reloading...'
    }
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.settings-view {
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
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #616161;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #4CAF50;
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.header h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.main {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.section {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.section-desc {
  color: #616161;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #424242;
  font-size: 0.875rem;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #4CAF50;
}

.form-group .help {
  font-size: 0.75rem;
  color: #757575;
}

.form-group code {
  background: #f5f5f5;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: monospace;
  color: #e65100;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.save-btn,
.reset-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background: #4CAF50;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #45a049;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reset-btn {
  background: transparent;
  color: #f44336;
  border: 2px solid #f44336;
}

.reset-btn:hover {
  background: #ffebee;
}

.status {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
}

.status.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.status.error {
  background: #ffebee;
  color: #c62828;
}

.current-config {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.config-item .label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #757575;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.config-item .value {
  font-family: monospace;
  color: #424242;
  word-break: break-all;
}

.config-item .value.link {
  color: #4CAF50;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
}

.config-item .value.link:hover {
  text-decoration: underline;
}

.config-item .value.link svg {
  width: 16px;
  height: 16px;
}

.about p {
  color: #616161;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.app-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #757575;
}

.app-info a {
  color: #4CAF50;
  text-decoration: none;
}

.app-info a:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .main {
    padding: 1rem;
  }

  .section {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .save-btn,
  .reset-btn {
    width: 100%;
  }
}
</style>
