import { defineStore } from 'pinia'
import apiService from '@/services/api.js'
import { useNotificationStore } from './notification'
import { connectNotificationSocket, disconnectNotificationSocket } from '@/services/realtimeNotifications'
import { playNotificationSound } from '@/utils/notificationSound'

export const useUserNotificationStore = defineStore('userNotification', {
  state: () => ({
    notifications: [],
    socketConnected: false,
    socketUserId: null,
    lastSocketNotificationId: null
  }),
  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length
  },
  actions: {
    normalizeNotification(notification) {
      return {
        ...notification,
        read: Boolean(notification?.read),
        created_at: notification?.created_at || new Date().toISOString()
      }
    },

    prependNotification(notification) {
      const normalized = this.normalizeNotification(notification)

      if (normalized?.id && this.notifications.some(n => n.id === normalized.id)) {
        return
      }

      this.notifications = [normalized, ...this.notifications]
      this.lastSocketNotificationId = normalized?.id ?? null

      const notificationStore = useNotificationStore()
      notificationStore.show('Tienes una nueva notificación', 'info', 2500)

      this.triggerBrowserNotification(normalized)
    },

    async requestNotificationPermission() {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'unsupported'
      }

      if (Notification.permission === 'granted') {
        return 'granted'
      }

      if (Notification.permission === 'denied') {
        return 'denied'
      }

      try {
        return await Notification.requestPermission()
      } catch (error) {
        console.warn('[notifications] error solicitando permisos', error)
        return 'error'
      }
    },

    async triggerBrowserNotification(notification) {
      if (typeof window === 'undefined') return

      const permission = await this.requestNotificationPermission()
      if (permission !== 'granted') return

      const title = 'Recetagram'
      const body = notification?.message || 'Tienes una nueva notificación'

      const payload = {
        title,
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data: {
          url: '/'
        }
      }

      if (notification?.post_id) {
        payload.data.url = `/posts/${notification.post_id}`
      } else if (notification?.from_user_id) {
        payload.data.url = `/user/${notification.from_user_id}`
      }

      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready
          registration.active?.postMessage({
            type: 'SHOW_NOTIFICATION',
            payload
          })
        } catch (error) {
          console.warn('[notifications] no se pudo usar SW para notificación', error)
          new Notification(title, payload)
        }
      } else {
        new Notification(title, payload)
      }

      playNotificationSound()
    },

    async fetchNotifications() {
      try {
        const response = await apiService.getNotifications()
        if (response.data.status === 'success') {
          this.notifications = Array.isArray(response.data.data)
            ? response.data.data.map(this.normalizeNotification)
            : []
        }
      } catch (error) {
        console.error('Error al cargar las notificaciones', error)
      }
    },

    initRealtime(userId) {
      if (!userId) return

      if (this.socketUserId === userId && this.socketConnected) {
        return
      }

      this.socketUserId = userId
      const socket = connectNotificationSocket(userId, (payload) => {
        if (payload?.notification) {
          this.prependNotification(payload.notification)
          return
        }

        if (payload) {
          this.prependNotification(payload)
        }
      })

      this.socketConnected = Boolean(socket)
    },

    destroyRealtime() {
      disconnectNotificationSocket()
      this.socketConnected = false
      this.socketUserId = null
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
