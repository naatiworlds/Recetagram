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

function decodeHtmlEntities(value) {
  const source = normalizeString(value)
  if (!source) return ''

  const textarea = document.createElement('textarea')
  textarea.innerHTML = source
  return normalizeString(textarea.value)
}

function pickFirstNonEmpty(values = []) {
  for (const value of values) {
    const normalized = normalizeString(value)
    if (normalized) return normalized
  }
  return ''
}

function extractFirstUrl(value) {
  const normalized = decodeHtmlEntities(value)
  if (!normalized) return ''

  const match = normalized.match(/https?:\/\/[^\s"'<>]+/i)
  return match ? match[0] : ''
}

function isGenericPlatformTitle(value) {
  const normalized = normalizeString(value).toLowerCase()
  return ['instagram', 'facebook', 'x', 'twitter', 'tiktok', 'linkedin', 'youtube'].includes(normalized)
}

function isGenericPlatformDescription(value) {
  const normalized = normalizeString(value).toLowerCase()
  return (
    normalized.includes('create an account or log in') ||
    normalized.includes('sign up for') ||
    normalized.includes('share what you') ||
    normalized.includes('inicia sesión') ||
    normalized.includes('crear una cuenta')
  )
}

function sanitizeSharedTitle(value) {
  const decoded = decodeHtmlEntities(value).replace(/\s+/g, ' ').trim()
  if (!decoded || isGenericPlatformTitle(decoded)) return ''
  return decoded.slice(0, 90)
}

function sanitizeSharedDescription(value, sourceUrl = '') {
  const decoded = decodeHtmlEntities(value).replace(/\s+/g, ' ').trim()
  if (!decoded || isGenericPlatformDescription(decoded)) return ''

  let cleaned = decoded
    .replace(/^\d+[\d.,]*\s+likes?,\s*\d+[\d.,]*\s+comments?\s*-\s*[^:]+:\s*/i, '')
    .replace(/^\d+[\d.,]*\s+likes?\s*-\s*[^:]+:\s*/i, '')
    .replace(/^\d+[\d.,]*\s+comments?\s*-\s*[^:]+:\s*/i, '')
    .trim()

  const normalizedUrl = normalizeString(sourceUrl)
  if (normalizedUrl) {
    cleaned = cleaned.replaceAll(normalizedUrl, '').trim()
  }

  return cleaned
}

function extractDomainLabel(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
    return hostname.split('.')[0] || 'otra plataforma'
  } catch {
    return 'otra plataforma'
  }
}

function buildDefaultTitle(url) {
  const domain = extractDomainLabel(url)
  if (!url) return 'Publicación compartida'
  return `Publicación desde ${domain}`
}

function buildDefaultDescription(url) {
  const domain = extractDomainLabel(url)
  if (!url) return 'Contenido compartido desde otra plataforma. Añade más detalles antes de publicar.'
  return `Contenido importado desde ${domain}. Revisa y completa la información antes de publicar.`
}

function parseShareQuery(route) {
  const query = route?.query || {}
  const title = sanitizeSharedTitle(pickFirstNonEmpty([query.title, query.subject, query.name]))
  const text = decodeHtmlEntities(pickFirstNonEmpty([query.text, query.description, query.body, query.quote]))
  const explicitUrl = pickFirstNonEmpty([query.url, query.link, query.href, query.u])
  const fallbackUrl = extractFirstUrl(text || Object.values(query).join(' '))
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
    const parsedShared = parseShareQuery(this.$route)
    const preview = await this.resolveSharedPreview(parsedShared)
    const normalizedText = this.normalizeSharedText(parsedShared.text, parsedShared.url)

    this.sharedData = {
      title: parsedShared.title || preview.title || buildDefaultTitle(parsedShared.url),
      text: normalizedText,
      url: parsedShared.url,
      description: normalizedText ? '' : (preview.description || buildDefaultDescription(parsedShared.url)),
      imageUrl: preview.imageUrl,
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

        const normalizedTitle = sanitizeSharedTitle(data?.title)
        const normalizedDescription = sanitizeSharedDescription(data?.description, sharedUrl)
        const isStoryWithGenericMeta =
          /https?:\/\/(?:www\.)?instagram\.com\/stories\//i.test(sharedUrl) &&
          !normalizedTitle &&
          !normalizedDescription

        let imageUrl = decodeHtmlEntities(data?.image)
        if (isStoryWithGenericMeta && /instagram\.com/i.test(imageUrl)) {
          imageUrl = ''
        }

        return {
          imageUrl,
          title: normalizedTitle,
          description: normalizedDescription,
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
