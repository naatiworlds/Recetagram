import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: []
  }),

  actions: {
    show(message, type = 'info', duration = 3000) {
      const id = Date.now()
      
      this.notifications.push({
        id,
        message,
        type
      })

      setTimeout(() => {
        this.clear(id)
      }, duration)
    },

    clear(id) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    },
    handleTokenExpiration(message) {
      const userStore = useUserStore()
      
      // Mostrar notificación de expiración
      this.show(message, 'token_expiration')
      
      // Después de 10 segundos, cerrar sesión y mostrar notificación final
      setTimeout(() => {
        this.show('Sesión finalizada. Por favor, inicie sesión nuevamente.', 'warning')
      }, 10000)
    }
  }
})