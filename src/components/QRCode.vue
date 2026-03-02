<template>
  <div class="qr-container">
    <div class="qr-header">
      <h3>Scan to download on mobile</h3>
      <button class="close-btn" @click="showFull = !showFull">
        {{ showFull ? 'Hide' : 'Show' }}
      </button>
    </div>

    <transition name="fade">
      <div v-if="showFull" class="qr-wrapper">
        <img :src="qrUrl" alt="QR Code" class="qr-img">
        <p class="qr-url">{{ shortUrl }}</p>
        <button class="copy-btn" @click="copyUrl">
          {{ copied ? 'Copied!' : 'Copy Link' }}
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  url: string
  title?: string
}

const props = defineProps<Props>()

const showFull = ref(false)
const copied = ref(false)

const shortUrl = computed(() => {
  try {
    const urlObj = new URL(props.url)
    return `${urlObj.hostname}${urlObj.pathname}`
  } catch {
    return props.url
  }
})

// Use QR Server API - no library needed
const qrUrl = computed(() => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(props.url)}`
})

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(props.url)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = props.url
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<style scoped>
.qr-container {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 1rem;
}

.qr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.qr-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.close-btn {
  padding: 0.25rem 0.75rem;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #616161;
  cursor: pointer;
}

.close-btn:hover {
  background: #f0f0f0;
}

.qr-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.qr-img {
  width: 200px;
  height: 200px;
  border-radius: 8px;
}

.qr-url {
  font-size: 0.75rem;
  color: #616161;
  margin: 0;
  word-break: break-all;
  text-align: center;
}

.copy-btn {
  padding: 0.5rem 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.copy-btn:hover {
  background: #45a049;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
