import { defineStore } from 'pinia'
import apiService from '@/services/api.js'

export const useUserNotificationStore = defineStore('userNotification', {
  state: () => ({
    notifications: []
  }),
  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length
  },
  actions: {
    async fetchNotifications() {
      try {
        const response = await apiService.getNotifications()
        if (response.data.status === 'success') {
          this.notifications = response.data.data
        }
      } catch (error) {
        console.error('Error al cargar las notificaciones', error)
      }
    },

    async markAllAsRead() {
      try {
        await apiService.markAllNotificationsAsRead()
        this.notifications = this.notifications.map(n => ({
          ...n,
          read: true,
          read_at: new Date().toISOString()
        }))
      } catch (error) {
        console.error('Error al marcar notificaciones como leídas:', error)
      }
    }
  }
})
