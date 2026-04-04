<template>
  <main class="share-target-page">
    <Crear v-if="isReady" :initial-shared-data="sharedData" @close="handleClose" />
  </main>
</template>

<script>
import Crear from '../components/Crear.vue'

function normalizeString(value) {
  return String(value || '').trim()
}

function extractFirstUrl(value) {
  const normalized = normalizeString(value)
  if (!normalized) return ''

  const match = normalized.match(/https?:\/\/[^\s]+/i)
  return match ? match[0] : ''
}

function parseShareQuery(route) {
  const query = route?.query || {}
  const title = normalizeString(query.title)
  const text = normalizeString(query.text || query.description)
  const explicitUrl = normalizeString(query.url || query.link)
  const fallbackUrl = extractFirstUrl(text)
  const url = explicitUrl || fallbackUrl

  return {
    title,
    text,
    url,
    description: '',
    imageUrl: '',
  }
}

export default {
  name: 'ShareTarget',
  components: {
    Crear,
  },
  data() {
    return {
      isReady: false,
      sharedData: {
        title: '',
        text: '',
        url: '',
        description: '',
        imageUrl: '',
      },
    }
  },
  async created() {
    this.sharedData = parseShareQuery(this.$route)
    const preview = await this.resolveSharedPreview(this.sharedData)

    this.sharedData.imageUrl = preview.imageUrl

    if (!this.sharedData.title && preview.title) {
      this.sharedData.title = preview.title
    }

    const normalizedText = this.normalizeSharedText(this.sharedData.text, this.sharedData.url)
    this.sharedData.text = normalizedText

    if (!normalizedText && preview.description) {
      this.sharedData.description = preview.description
    }

    this.isReady = true
  },
  methods: {
    normalizeSharedText(rawText, rawUrl) {
      const text = String(rawText || '').trim()
      const url = String(rawUrl || '').trim()

      if (!text) return ''
      if (this.isUrlOnly(text)) return ''
      if (url && text === url) return ''
      return text
    },

    isUrlOnly(value) {
      return /^https?:\/\/[^\s]+$/i.test(String(value || '').trim())
    },

    async resolveSharedPreview(sharedData) {
      const fromText = this.extractImageUrl(sharedData?.text)
      if (fromText) {
        return { imageUrl: fromText, title: '', description: '' }
      }

      const fromUrl = this.extractImageUrl(sharedData?.url)
      if (fromUrl) {
        return { imageUrl: fromUrl, title: '', description: '' }
      }

      const sharedUrl = String(sharedData?.url || '').trim()
      if (!sharedUrl) return { imageUrl: '', title: '', description: '' }

      try {
        const endpoint = `/.netlify/functions/share-preview?url=${encodeURIComponent(sharedUrl)}`
        const response = await fetch(endpoint)
        if (!response.ok) return { imageUrl: '', title: '', description: '' }
        const data = await response.json()
        return {
          imageUrl: String(data?.image || ''),
          title: String(data?.title || '').trim(),
          description: String(data?.description || '').trim(),
        }
      } catch (error) {
        console.warn('[ShareTarget] No se pudo resolver imagen compartida', error)
        return { imageUrl: '', title: '', description: '' }
      }
    },

    extractImageUrl(rawValue) {
      const value = String(rawValue || '')
      if (!value) return ''

      const imageUrlMatch = value.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|webp|gif)(?:\?[^\s"'<>]*)?/i)
      return imageUrlMatch ? imageUrlMatch[0] : ''
    },

    handleClose() {
      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
.share-target-page {
  min-height: 100vh;
}
</style>
