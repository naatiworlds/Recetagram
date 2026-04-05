import { defineStore } from 'pinia'

export const useUpdateStore = defineStore('update', {
  state: () => ({
    showUpdateBanner: false,
    updateAvailable: false,
    registration: null,
    version: '1.0.0',
    updateIntervalId: null,
    listenerInitialized: false
  }),

  actions: {
    setUpdateAvailable(registration) {
      this.updateAvailable = true
      this.registration = registration
      this.showUpdateBanner = true
      this.applyUpdateSilently()
    },

    hideUpdateBanner() {
      this.showUpdateBanner = false
    },

    async updateApp() {
      if (!this.registration || !this.registration.waiting) {
        this.showUpdateBanner = false
        return false
      }

      // Enviar mensaje al service worker para que se active
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Recargar la página para aplicar la actualización
      window.location.reload()
      return true
    },

    applyUpdateSilently() {
      if (this.registration?.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    },

    // Método para verificar actualizaciones manualmente
    async checkForUpdates() {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            this.registration = registration

            await registration.update().catch(() => {})

            if (registration.waiting && navigator.serviceWorker.controller) {
              this.setUpdateAvailable(registration)
            }

            // Verificar si hay una nueva versión
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Hay una nueva versión disponible
                    this.setUpdateAvailable(registration)
                  }
                })
              }
            })
          }
        } catch (error) {
          console.error('Error verificando actualizaciones:', error)
        }
      }
    },

    // Inicializar el sistema de actualizaciones
    initUpdateChecker() {
      if ('serviceWorker' in navigator) {
        if (this.listenerInitialized) {
          return
        }
        this.listenerInitialized = true

        // Escuchar cambios en el service worker
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // El service worker ha cambiado, recargar la página
          window.location.reload()
        })

        window.addEventListener('focus', () => this.checkForUpdates())
        window.addEventListener('online', () => this.checkForUpdates())
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            this.checkForUpdates()
          }
        })

        if (!this.updateIntervalId) {
          this.updateIntervalId = window.setInterval(() => {
            this.checkForUpdates()
          }, 5 * 60 * 1000)
        }

        // Verificar actualizaciones al cargar la página
        this.checkForUpdates()
      }
    }
  }
})
