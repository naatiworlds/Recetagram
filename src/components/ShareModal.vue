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

      <section class="share-tutorial">
        <div class="tutorial-header">
          <i class="fas fa-circle-info"></i>
          <h4>Mini tutorial</h4>
        </div>

        <ol class="tutorial-steps">
          <li>Elige la red social que quieras usar.</li>
          <li>Si es WhatsApp, Telegram o email, se abrirá tu app o enlace.</li>
          <li>Si usas el botón de compartir con el sistema, Android o iPhone te mostrarán sus opciones.</li>
        </ol>

        <p class="tutorial-note">
          Tip: para compartir en Instagram, busca la aplicación en compartir en instagram.
        </p>
      </section>

      <div class="share-options">
        <button v-if="canUseNativeShare" @click="shareNatively" class="share-option native-share-option">
          <div class="option-icon native">
            <i class="fas fa-share-alt"></i>
          </div>
          <span>Compartir con el sistema</span>
        </button>

        <button v-if="canUseNativeShare && isMobileDevice" @click="shareToInstagram" class="share-option instagram-share-option">
          <div class="option-icon instagram">
            <i class="fab fa-instagram"></i>
          </div>
          <span>Compartir en Instagram</span>
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
    isMobileDevice() {
      if (typeof navigator === 'undefined') return false

      const mobilePattern = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
      const hasTouchSupport = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

      return mobilePattern.test(navigator.userAgent || '') && hasTouchSupport
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

    async shareToInstagram() {
      if (!this.canUseNativeShare) {
        this.notificationStore.show('Tu navegador no permite compartir en Instagram', 'warning')
        return
      }

      try {
        const payload = {
          title: this.shareData.title,
          text: this.shareText,
          url: this.shareData.url,
        }

        if (this.shareData.imageUrl) {
          const response = await fetch(this.shareData.imageUrl)
          const blob = await response.blob()
          const fileName = `${(this.shareData.title || 'receta').replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.jpg`
          const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' })

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ ...payload, files: [file] })
            this.closeModal()
            return
          }
        }

        await navigator.share(payload)
        this.closeModal()
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.error('Error al compartir en Instagram:', error)
          this.notificationStore.show('No se pudo abrir Instagram desde el menú del sistema', 'error')
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

.share-tutorial {
  margin: 12px 16px 8px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
}

.tutorial-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.tutorial-header i {
  color: var(--text-color-important);
}

.tutorial-header h4 {
  margin: 0;
  color: var(--text-color-important);
  font-size: 15px;
}

.tutorial-steps {
  margin: 0;
  padding-left: 18px;
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.5;
}

.tutorial-steps li + li {
  margin-top: 6px;
}

.tutorial-note {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--text-color);
  opacity: 0.9;
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

.option-icon.native {
  background: var(--primary-color);
  color: white;
}

.option-icon.instagram {
  background: linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5);
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
