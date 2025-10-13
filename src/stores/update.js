import { defineStore } from 'pinia'

export const useUpdateStore = defineStore('update', {
  state: () => ({
    showUpdateBanner: false,
    updateAvailable: false,
    registration: null,
    version: '1.0.0' // Versión actual de la app
  }),

  actions: {
    setUpdateAvailable(registration) {
      this.updateAvailable = true
      this.registration = registration
      this.showUpdateBanner = true
    },

    hideUpdateBanner() {
      this.showUpdateBanner = false
    },

    async updateApp() {
      if (!this.registration || !this.registration.waiting) {
        throw new Error('No hay actualización disponible')
      }

      // Enviar mensaje al service worker para que se active
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Recargar la página para aplicar la actualización
      window.location.reload()
    },

    // Método para verificar actualizaciones manualmente
    async checkForUpdates() {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
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
        // Escuchar cambios en el service worker
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // El service worker ha cambiado, recargar la página
          window.location.reload()
        })

        // Verificar actualizaciones al cargar la página
        this.checkForUpdates()
      }
    }
  }
})
