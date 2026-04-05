import { defineStore } from 'pinia'
import { API_BASE_URL } from '../utils/globalConstants'

export const useInteractionNotificationStore = defineStore('interactionNotifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
  }),

  getters: {
    hasUnreadNotifications: (state) => state.unreadCount > 0,
    sortedNotifications: (state) => {
      return [...state.notifications].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )
    }
  },

  actions: {
    async fetchNotifications() {
      try {
        console.log('Fetching notifications...');
        const response = await fetch(`${API_BASE_URL}/notifications`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        const result = await response.json()
        console.log('API Response:', result);
        
        if (result.status === 'success' && Array.isArray(result.data)) {
          console.log('Setting notifications:', result.data);
          this.notifications = result.data
          this.updateUnreadCount()
        } else {
          console.error('Invalid response format:', result);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
        this.notifications = []
      }
    },

    async markAsRead(notificationId) {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.ok) {
          const notification = this.notifications.find(n => n.id === notificationId)
          if (notification && !notification.read) {
            notification.read = true
            this.updateUnreadCount()
          }
        }
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    },

    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.read).length
    },

    markAllAsRead() {
      this.notifications.forEach(notification => {
        if (!notification.read) {
          this.markAsRead(notification.id)
        }
      })
    }
  }
})

