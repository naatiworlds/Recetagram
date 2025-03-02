import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    message: '',
    type: 'info',
    show: false,
    timeout: null
  }),
  
  actions: {
    showNotification(message, type = 'info', duration = 5000) {
      // Limpiar timeout anterior si existe
      if (this.timeout) {
        clearTimeout(this.timeout)
      }

      this.message = message
      this.type = type
      this.show = true
      
      // Auto hide after duration
      if (duration > 0) {
        this.timeout = setTimeout(() => {
          this.hideNotification()
        }, duration)
      }
    },
    
    hideNotification() {
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.show = false
      this.message = ''
      this.timeout = null
    }
  }
})
