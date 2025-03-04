import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: []
  }),

  actions: {
    showNotification(message, type = 'info', duration = 3000) {
      const id = Date.now()
      
      this.notifications.push({
        id,
        message,
        type
      })

      setTimeout(() => {
        this.hideNotification(id)
      }, duration)
    },

    hideNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    }
  }
})
