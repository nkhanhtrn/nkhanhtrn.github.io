import { ref, computed } from 'vue'
import type { Ref } from 'vue'

export interface GitHubAsset {
  name: string
  size: number
  browser_download_url: string
  content_type: string
}

export interface GitHubRelease {
  id: number
  tag_name: string
  name: string
  body: string
  published_at: string
  html_url: string
  assets: GitHubAsset[]
  prerelease: boolean
  draft: boolean
}

export interface AppInfo {
  id: number
  name: string
  version: string
  description: string
  publishedAt: string
  htmlUrl: string
  apkUrl: string | null
  apkSize: number | null
  apkName: string | null
  isPrerelease: boolean
  icon?: string
}

const RELEASES_CACHE_KEY = 'appstore_releases_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useGitHub() {
  const releases: Ref<GitHubRelease[]> = ref([])
  const loading = ref(false)
  const error: Ref<string | null> = ref(null)

  const owner = import.meta.env.VITE_GITHUB_OWNER || ''
  const repo = import.meta.env.VITE_GITHUB_REPO || ''
  const token = import.meta.env.VITE_GITHUB_TOKEN || ''

  const apiUrl = computed(() => {
    if (!owner || !repo) {
      return null
    }
    return `https://api.github.com/repos/${owner}/${repo}/releases`
  })

  const headers = computed(() => {
    const h: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    }
    if (token) {
      h['Authorization'] = `token ${token}`
    }
    return h
  })

  async function fetchReleases(forceRefresh = false): Promise<void> {
    if (!apiUrl.value) {
      error.value = 'GitHub owner and repo not configured. Set VITE_GITHUB_OWNER and VITE_GITHUB_REPO environment variables.'
      return
    }

    // Check cache first
    if (!forceRefresh) {
      const cached = getCachedReleases()
      if (cached) {
        releases.value = cached
        return
      }
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(apiUrl.value, {
        headers: headers.value
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found or no releases available')
        } else if (response.status === 403) {
          throw new Error('API rate limit exceeded. Add VITE_GITHUB_TOKEN for higher limits.')
        }
        throw new Error(`GitHub API error: ${response.statusText}`)
      }

      const data: GitHubRelease[] = await response.json()

      // Filter out drafts
      releases.value = data.filter(r => !r.draft)

      // Cache the results
      cacheReleases(releases.value)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch releases'
      console.error('Error fetching releases:', e)
    } finally {
      loading.value = false
    }
  }

  function getCachedReleases(): GitHubRelease[] | null {
    try {
      const cached = localStorage.getItem(RELEASES_CACHE_KEY)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp

      if (age > CACHE_DURATION) {
        localStorage.removeItem(RELEASES_CACHE_KEY)
        return null
      }

      return data
    } catch {
      return null
    }
  }

  function cacheReleases(data: GitHubRelease[]): void {
    try {
      localStorage.setItem(RELEASES_CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (e) {
      console.warn('Failed to cache releases:', e)
    }
  }

  const apps = computed<AppInfo[]>(() => {
    return releases.value.map(release => {
      const apkAsset = release.assets.find(a =>
        a.name.endsWith('.apk') || a.content_type === 'application/vnd.android.package-archive'
      )

      // Extract app name from release name or tag
      let appName = release.name || release.tag_name
      // Remove version suffix if present (e.g., "MyApp v1.0.0" -> "MyApp")
      appName = appName.replace(/[\s_-]?v?\d+\.\d+[\d.]*(?:[\s_-]?.*)?$/i, '') || appName

      return {
        id: release.id,
        name: appName.trim(),
        version: release.tag_name.replace(/^v/i, ''),
        description: release.body || 'No description available.',
        publishedAt: release.published_at,
        htmlUrl: release.html_url,
        apkUrl: apkAsset?.browser_download_url || null,
        apkSize: apkAsset?.size || null,
        apkName: apkAsset?.name || null,
        isPrerelease: release.prerelease,
        icon: undefined // Could be set from release assets if image files exist
      }
    })
  })

  const latestRelease = computed(() => {
    const published = releases.value.filter(r => !r.prerelease)
    return published.sort((a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )[0]
  })

  function formatSize(bytes: number | null): string {
    if (!bytes) return 'Unknown'
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

  async function downloadApk(app: AppInfo): Promise<void> {
    if (!app.apkUrl) {
      throw new Error('No APK file available for this app')
    }

    // Create a direct link and click it
    const link = document.createElement('a')
    link.href = app.apkUrl
    link.download = app.apkName || `${app.name}-${app.version}.apk`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    releases,
    apps,
    latestRelease,
    loading,
    error,
    fetchReleases,
    formatSize,
    formatDate,
    downloadApk
  }
}
