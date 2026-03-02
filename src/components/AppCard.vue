<template>
  <div class="app-card" :class="{ prerelease: app.isPrerelease }" @click="emit('click', app)">
    <div class="app-icon">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <rect width="24" height="24" rx="4"/>
        <path d="M7 4v16M12 4v16M17 4v16" fill="#fff" opacity="0.5"/>
      </svg>
    </div>

    <div class="app-info">
      <div class="app-header">
        <h3 class="app-name">{{ app.name }}</h3>
        <span v-if="app.isPrerelease" class="prerelease-badge">Beta</span>
      </div>
      <p class="app-version">v{{ app.version }}</p>
      <p class="app-date">{{ formatDate(app.publishedAt) }}</p>
      <p class="app-description">{{ truncatedDescription }}</p>

      <div class="app-footer">
        <span v-if="app.apkSize" class="app-size">{{ formatSize(app.apkSize) }}</span>
        <span v-else class="app-size no-apk">No APK</span>
        <InstallButton :app="app" @click.stop />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InstallButton from './InstallButton.vue'
import type { AppInfo } from '../composables/useGitHub'

interface Props {
  app: AppInfo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [app: AppInfo]
}>()

const truncatedDescription = computed(() => {
  const maxLength = 100
  if (props.app.description.length <= maxLength) {
    return props.app.description
  }
  return props.app.description.slice(0, maxLength) + '...'
})

function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.app-card {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #4CAF50;
}

.app-card.prerelease {
  border-color: #FF9800;
}

.app-icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.app-icon svg {
  width: 32px;
  height: 32px;
}

.app-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.prerelease-badge {
  padding: 0.125rem 0.5rem;
  background: #FFF3E0;
  color: #E65100;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
}

.app-version {
  font-size: 0.875rem;
  color: #4CAF50;
  font-weight: 500;
  margin: 0;
}

.app-date {
  font-size: 0.75rem;
  color: #757575;
  margin: 0;
}

.app-description {
  font-size: 0.875rem;
  color: #616161;
  line-height: 1.4;
  margin: 0.25rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.app-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.75rem;
}

.app-size {
  font-size: 0.75rem;
  color: #757575;
  font-weight: 500;
}

.app-size.no-apk {
  color: #f44336;
}

@media (max-width: 640px) {
  .app-card {
    padding: 1rem;
  }

  .app-icon {
    width: 48px;
    height: 48px;
  }

  .app-icon svg {
    width: 24px;
    height: 24px;
  }

  .app-name {
    font-size: 1rem;
  }

  .app-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .app-size {
    text-align: center;
  }
}
</style>
