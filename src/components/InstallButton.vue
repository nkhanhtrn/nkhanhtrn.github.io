<template>
  <button
    class="install-btn"
    :class="{ downloading, disabled }"
    :disabled="disabled || downloading"
    @click="handleDownload"
  >
    <svg v-if="!downloading" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
    </svg>
    <svg v-else class="icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32"/>
    </svg>
    <span>{{ btnText }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AppInfo } from '../composables/useGitHub'

interface Props {
  app: AppInfo
}

const props = defineProps<Props>()

const downloading = ref(false)
const disabled = computed(() => !props.app.apkUrl)

const btnText = computed(() => {
  if (disabled.value) return 'Not Available'
  if (downloading.value) return 'Downloading...'
  return 'Download APK'
})

async function handleDownload() {
  if (disabled.value || downloading.value) return

  downloading.value = true

  try {
    // Use the downloadApk function from useGitHub
    if (props.app.apkUrl) {
      const link = document.createElement('a')
      link.href = props.app.apkUrl
      link.download = props.app.apkName || `${props.app.name}-${props.app.version}.apk`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Also open in new tab for better mobile experience
      window.open(props.app.apkUrl, '_blank')
    }
  } catch (error) {
    console.error('Download failed:', error)
    alert('Download failed. Please try again.')
  } finally {
    // Reset after a delay
    setTimeout(() => {
      downloading.value = false
    }, 2000)
  }
}
</script>

<style scoped>
.install-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(76, 175, 80, 0.3);
}

.install-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(76, 175, 80, 0.4);
}

.install-btn:active:not(:disabled) {
  transform: translateY(0);
}

.install-btn.disabled {
  background: #9e9e9e;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.6;
}

.install-btn.downloading {
  background: #2196F3;
}

.icon {
  width: 20px;
  height: 20px;
}

.icon.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
    stroke-dashoffset: 32;
  }
  to {
    transform: rotate(360deg);
    stroke-dashoffset: 0;
  }
}
</style>
