<template>
  <div v-if="isVisible" class="share-modal-overlay" @click="closeModal">
    <div class="share-modal" @click.stop>
      <div class="share-header">
        <h3>Compartir</h3>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="share-preview">
        <img :src="shareData.imageUrl" :alt="shareData.title" class="preview-image" />
        <div class="preview-info">
          <h4>{{ shareData.title }}</h4>
          <p>{{ truncateText(shareData.description, 80) }}</p>
        </div>
      </div>

      <div class="share-options">
        <button v-if="canUseNativeShare" @click="shareNatively" class="share-option native-share-option">
          <div class="option-icon native">
            <i class="fas fa-share-alt"></i>
          </div>
          <span>Compartir con el sistema</span>
        </button>

        <button v-if="canUseInstagramShare && isMobileDevice" @click="shareToInstagramStory" class="share-option instagram-share-option">
          <div class="option-icon instagram">
            <i class="fab fa-instagram"></i>
          </div>
          <span>Instagram Story</span>
        </button>

        <button @click="copyLink" class="share-option">
          <div class="option-icon">
            <i class="fas fa-link"></i>
          </div>
          <span>Copiar enlace</span>
        </button>

        <a :href="whatsappUrl" target="_blank" class="share-option" @click="trackShare('whatsapp')">
          <div class="option-icon whatsapp">
            <i class="fab fa-whatsapp"></i>
          </div>
          <span>WhatsApp</span>
        </a>

        <a :href="facebookUrl" target="_blank" class="share-option" @click="trackShare('facebook')">
          <div class="option-icon facebook">
            <i class="fab fa-facebook"></i>
          </div>
          <span>Facebook</span>
        </a>

        <a :href="twitterUrl" target="_blank" class="share-option" @click="trackShare('twitter')">
          <div class="option-icon twitter">
            <i class="fab fa-twitter"></i>
          </div>
          <span>Twitter</span>
        </a>

        <a :href="telegramUrl" target="_blank" class="share-option" @click="trackShare('telegram')">
          <div class="option-icon telegram">
            <i class="fab fa-telegram"></i>
          </div>
          <span>Telegram</span>
        </a>

        <a :href="`mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareData.url)}`" class="share-option" @click="trackShare('email')">
          <div class="option-icon email">
            <i class="fas fa-envelope"></i>
          </div>
          <span>Email</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { useNotificationStore } from '../stores/notification'

export default {
  name: 'ShareModal',
  
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    shareData: {
      type: Object,
      default: () => ({
        url: '',
        title: '',
        description: '',
        imageUrl: ''
      })
    }
  },

  computed: {
    notificationStore() {
      return useNotificationStore()
    },
    canUseNativeShare() {
      return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
    },
    canUseInstagramShare() {
      return this.canUseNativeShare && typeof navigator.canShare === 'function'
    },
    isMobileDevice() {
      if (typeof navigator === 'undefined') return false

      const mobilePattern = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
      const hasTouchSupport = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

      return mobilePattern.test(navigator.userAgent || '') && hasTouchSupport
    },
    instagramSourceApplication() {
      return import.meta.env.VITE_INSTAGRAM_SOURCE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID || ''
    },
    shareText() {
      return `${this.shareData.description || ''}\n\nReceta: ${this.shareData.title}`
    },
    whatsappUrl() {
      return `https://wa.me/?text=${encodeURIComponent(this.shareText + '\n\n' + this.shareData.url)}`
    },
    facebookUrl() {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareData.url)}`
    },
    twitterUrl() {
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.shareText)}&url=${encodeURIComponent(this.shareData.url)}`
    },
    telegramUrl() {
      return `https://t.me/share/url?url=${encodeURIComponent(this.shareData.url)}&text=${encodeURIComponent(this.shareText)}`
    }
  },

  methods: {
    closeModal() {
      this.$emit('close')
    },

    async shareNatively() {
      if (!this.canUseNativeShare) {
        this.notificationStore.show('Tu navegador no permite el menú nativo de compartir', 'warning')
        return
      }

      try {
        await navigator.share({
          title: this.shareData.title,
          text: this.shareText,
          url: this.shareData.url
        })
        this.closeModal()
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.error('Error al abrir el menú nativo de compartir:', error)
          this.notificationStore.show('No se pudo abrir el menú nativo de compartir', 'error')
        }
      }
    },

    async shareToInstagramStory() {
      if (!this.canUseInstagramShare) {
        this.notificationStore.show('Tu navegador no soporta compartir contenido para Instagram Story', 'warning')
        return
      }

      try {
        if (this.shareData.imageUrl) {
          const response = await fetch(this.shareData.imageUrl)
          const blob = await response.blob()
          if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
            const clipboardType = blob.type || 'image/jpeg'
            await navigator.clipboard.write([
              new ClipboardItem({
                [clipboardType]: blob,
              }),
            ])
          }
        }

        const sourceApplication = this.instagramSourceApplication
        const storyUrl = sourceApplication
          ? `instagram-stories://share?source_application=${encodeURIComponent(sourceApplication)}`
          : 'instagram-stories://share'

        window.location.href = storyUrl
        setTimeout(() => {
          this.notificationStore.show(
            'Si Instagram no se abrió, usa el menú nativo del sistema como alternativa.',
            'warning'
          )
        }, 1200)
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.error('Error al compartir en Instagram:', error)
          this.notificationStore.show('No se pudo abrir Instagram Story', 'error')
        }
      }
    },
    
    async copyLink() {
      try {
        await navigator.clipboard.writeText(this.shareData.url)
        this.notificationStore.show('Enlace copiado al portapapeles', 'success')
        this.closeModal()
      } catch (error) {
        this.notificationStore.show('No se pudo copiar el enlace', 'error')
      }
    },

    truncateText(text, maxLength) {
      if (!text || text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },

    trackShare(platform) {
      console.log(`Compartido en ${platform}`)
      // Aquí podrías agregar analytics si lo deseas
    }
  }
}
</script>

<style scoped>
.share-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.share-modal {
  background: var(--sombra-color);
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.share-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color-important);
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-color-important);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.share-preview {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.preview-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.preview-info {
  flex: 1;
  min-width: 0;
}

.preview-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color-important);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-info p {
  margin: 0;
  font-size: 14px;
  color: var(--text-color);
  line-height: 1.4;
}

.share-options {
  padding: 8px 0;
}

.share-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none;
  color: var(--text-color-important);
  font-size: 15px;
}

.native-share-option {
  width: 100%;
}

.share-option:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.option-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color-important);
}

.option-icon.whatsapp {
  background: #25D366;
  color: white;
}

.option-icon.facebook {
  background: #1877F2;
  color: white;
}

.option-icon.twitter {
  background: #1DA1F2;
  color: white;
}

.option-icon.telegram {
  background: #0088cc;
  color: white;
}

.option-icon.email {
  background: #EA4335;
  color: white;
}

.option-icon.instagram {
  background: linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5);
  color: white;
}

.option-icon.native {
  background: var(--primary-color);
  color: white;
}

.instagram-share-option {
  width: 100%;
}

/* Scrollbar personalizado */
.share-modal::-webkit-scrollbar {
  width: 8px;
}

.share-modal::-webkit-scrollbar-track {
  background: transparent;
}

.share-modal::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.share-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .share-modal {
    max-width: 100%;
    width: 100%;
    border-radius: 16px 16px 0 0;
    position: absolute;
    bottom: 0;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
}
</style>
