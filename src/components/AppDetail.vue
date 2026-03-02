<template>
  <div class="app-detail-overlay" @click="emit('close')">
    <div class="app-detail" @click.stop>
      <button class="close-btn" @click="emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <div class="app-header">
        <div class="app-icon-large">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect width="24" height="24" rx="4"/>
            <path d="M7 4v16M12 4v16M17 4v16" fill="#fff" opacity="0.5"/>
          </svg>
        </div>
        <div class="app-meta">
          <h1 class="app-title">{{ app.name }}</h1>
          <p class="app-version">Version {{ app.version }}</p>
          <div class="app-badges">
            <span v-if="app.isPrerelease" class="badge prerelease">Beta</span>
            <span class="badge release">{{ formatDate(app.publishedAt) }}</span>
          </div>
        </div>
      </div>

      <div class="app-actions">
        <InstallButton :app="app" />
        <a :href="app.htmlUrl" target="_blank" rel="noopener" class="github-link">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          View on GitHub
        </a>
      </div>

      <div class="app-body">
        <section class="section">
          <h2>Description</h2>
          <div class="description" v-html="formattedDescription"></div>
        </section>

        <section v-if="app.apkSize" class="section">
          <h2>Download Info</h2>
          <dl class="info-list">
            <div class="info-item">
              <dt>File Name</dt>
              <dd>{{ app.apkName || 'Unknown' }}</dd>
            </div>
            <div class="info-item">
              <dt>File Size</dt>
              <dd>{{ formatSize(app.apkSize) }}</dd>
            </div>
            <div class="info-item">
              <dt>Released</dt>
              <dd>{{ formatDate(app.publishedAt) }}</dd>
            </div>
          </dl>
        </section>

        <section class="section">
          <h2>Share</h2>
          <QRCode :url="shareUrl" :title="app.name" />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import InstallButton from './InstallButton.vue'
import QRCode from './QRCode.vue'
import type { AppInfo } from '../composables/useGitHub'

interface Props {
  app: AppInfo
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const shareUrl = computed(() => {
  return props.app.htmlUrl
})

const formattedDescription = computed(() => {
  if (!props.app.description || props.app.description === 'No description available.') {
    return '<p class="no-description">No description available for this release.</p>'
  }

  // Convert markdown-like syntax to HTML
  let html = props.app.description

  // Convert URLs to links
  html = html.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener">$1</a>'
  )

  // Convert line breaks
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')

  // Wrap in paragraph if not already
  if (!html.startsWith('<p>')) {
    html = '<p>' + html + '</p>'
  }

  return html
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
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.app-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.app-detail {
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  overflow-x: hidden;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.close-btn:hover {
  background: #e0e0e0;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.app-header {
  padding: 2rem 2rem 1.5rem;
  display: flex;
  gap: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.app-icon-large {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.app-icon-large svg {
  width: 40px;
  height: 40px;
}

.app-meta {
  flex: 1;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.25rem 0;
}

.app-version {
  font-size: 1rem;
  color: #4CAF50;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
}

.app-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.prerelease {
  background: #FFF3E0;
  color: #E65100;
}

.badge.release {
  background: #E8F5E9;
  color: #2E7D32;
}

.app-actions {
  padding: 1.5rem 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  border-bottom: 1px solid #f0f0f0;
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #24292e;
  color: white;
  border: none;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.github-link:hover {
  background: #1a1e22;
  transform: translateY(-2px);
}

.github-link svg {
  width: 20px;
  height: 20px;
}

.app-body {
  padding: 2rem;
}

.section {
  margin-bottom: 2rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
}

.description :deep(p) {
  margin: 0 0 1rem 0;
  line-height: 1.6;
  color: #424242;
}

.description :deep(p:last-child) {
  margin-bottom: 0;
}

.description :deep(a) {
  color: #4CAF50;
  text-decoration: none;
}

.description :deep(a:hover) {
  text-decoration: underline;
}

.description :deep(.no-description) {
  color: #9e9e9e;
  font-style: italic;
}

.info-list {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item dt {
  font-weight: 600;
  color: #616161;
}

.info-item dd {
  color: #424242;
  word-break: break-all;
}

@media (max-width: 640px) {
  .app-detail {
    max-height: 100vh;
    border-radius: 0;
  }

  .app-header {
    padding: 1.5rem;
  }

  .app-icon-large {
    width: 64px;
    height: 64px;
  }

  .app-icon-large svg {
    width: 32px;
    height: 32px;
  }

  .app-title {
    font-size: 1.25rem;
  }

  .app-actions {
    padding: 1rem 1.5rem;
    flex-direction: column;
  }

  .github-link {
    justify-content: center;
  }

  .app-body {
    padding: 1.5rem;
  }

  .info-item {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
</style>
