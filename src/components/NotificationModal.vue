<template>
  <div v-if="isOpen" class="notification-modal">
    <div class="notification-header">
      <h3>Notificaciones</h3>
      <div class="header-actions">
        <button @click="markAllAsRead" class="action-button" title="Marcar todas como leídas">
          <i class="fas fa-eye"></i>
        </button>
        <button @click="handleClose" class="close-button">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <div class="notification-list">
      <div v-if="loading" class="loading">Cargando notificaciones...</div>

      <div v-else-if="notifications.length === 0" class="no-notifications">
        No tienes notificaciones nuevas
      </div>

      <div
        v-else
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="{ 'unread': !notification.read }"
      >
        <div class="notification-icon">
          <i :class="getNotificationIcon(notification.type)"></i>
        </div>
        <div class="notification-content">
          <div class="notification-message">
            {{ getNotificationMessage(notification) }}
          </div>
          <small>{{ formatTimeAgo(notification.created_at) }}</small>
        </div>

        <div v-if="notification.type === 'follow_request'" class="follow-request-actions">
          <button
            @click="handleFollowRequest(notification.follow_id, true)"
            class="accept-button"
            title="Aceptar solicitud"
            :disabled="notification.follow && notification.follow.status !== 'pending'"
          >
            <i class="fas fa-check"></i>
          </button>
          <button
            @click="handleFollowRequest(notification.follow_id, false)"
            class="reject-button"
            title="Rechazar solicitud"
            :disabled="notification.follow && notification.follow.status !== 'pending'"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserNotificationStore } from '../stores/interactionNotifications' 
import { useNotificationStore } from '../stores/notification'

import { apiService } from '../services/api'

export default {
  name: 'NotificationModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      userNotifications: useUserNotificationStore(),
      notificationStore: useNotificationStore()
    }
  },
  computed: {
    notifications() {
      return this.userNotifications.notifications
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) this.fetchNotifications()
    }
  },
  created() {
    if (this.isOpen) this.fetchNotifications()
  },
  methods: {
    async fetchNotifications() {
      this.loading = true
      try {
        await this.userNotifications.fetchNotifications()
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        this.loading = false
      }
    },
    async markAllAsRead() {
      if (this.userNotifications.unreadCount === 0) {
        this.notificationStore.show('No hay notificaciones sin leer', 'info')
        return
      }

      try {
        this.loading = true
        // Acá podrías hacer una llamada al backend si querés marcar en DB
        this.userNotifications.markAllAsRead()
        this.notificationStore.show('Todas las notificaciones han sido marcadas como leídas', 'success')
      } catch (error) {
        console.error('Error al marcar notificaciones como leídas:', error)
        this.notificationStore.show('Error al marcar las notificaciones como leídas', 'error')
      } finally {
        this.loading = false
      }
    },
    async handleFollowRequest(followId, accept) {
      if (!followId) {
        this.notificationStore.show('Error: No se pudo encontrar la solicitud de seguimiento', 'error')
        return
      }

      try {
        this.loading = true
        let response = accept
          ? await apiService.acceptFollowRequest(followId)
          : await apiService.rejectFollowRequest(followId)

        if (response.data.status === 'success') {
          this.notificationStore.show(
            `Solicitud de seguimiento ${accept ? 'aceptada' : 'rechazada'}`,
            'success'
          )
          await this.fetchNotifications()
        }
      } catch (error) {
        console.error('Error en solicitud de seguimiento:', error)
        this.notificationStore.show(
          `Error al ${accept ? 'aceptar' : 'rechazar'} la solicitud`,
          'error'
        )
      } finally {
        this.loading = false
      }
    },
    handleClose() {
      this.$emit('close')
    },
    getNotificationIcon(type) {
      const icons = {
        like: 'fas fa-heart',
        comment: 'fas fa-comment',
        new_follower: 'fas fa-user-plus',
        system: 'fas fa-bell',
        follow_request: 'fas fa-user-plus',
        token_expiration: 'fas fa-key',
        unfollow: 'fas fa-user-times',
        default: 'fas fa-bell'
      }
      return icons[type] || icons.default
    },
    getActionText(type) {
      const actions = {
        like: 'ha dado like a tu post',
        comment: 'ha comentado en tu post',
        new_follower: 'ha comenzado a seguirte',
        follow_request: 'ha solicitado seguirte',
        follow_request_accepted: 'ha aceptado tu solicitud de seguimiento',
        unfollow: 'ha dejado de seguirte',
        token_expiration: 'Tu sesión expirará pronto',
        default: 'ha interactuado con tu contenido'
      }
      return actions[type] || actions.default
    },
    getNotificationMessage(notification) {
      return notification.message && notification.message.trim() !== ''
        ? notification.message
        : this.getActionText(notification.type)
    },
    formatTimeAgo(date) {
      const now = new Date()
      const notificationDate = new Date(date)
      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60))

      if (diffInMinutes < 1) return 'Ahora mismo'
      if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`

      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `Hace ${diffInHours} horas`

      return notificationDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}
</script>



<style scoped>
.notification-modal {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 500px;
  overflow-y: auto;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: var(--primary-color);
  border-radius: 8px 8px 0 0;
  position: sticky;
  top: 0;
}

.notification-header h3 {
  color: var(--text-color);
  margin: 0;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.action-button,
.close-button {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.action-button:hover,
.close-button:hover {
  opacity: 0.8;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: #FFF3D4;
}

.notification-item.unread {
  background-color: #FFF8E7;
}

.notification-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--contrast-color);
  border-radius: 50%;
  color: white;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.notification-content small {
  display: block;
  color: var(--text-color-muted);
  font-size: 12px;
  margin-top: 4px;
}

.loading, .no-notifications {
  padding: 20px;
  text-align: center;
  color: #666;
  background-color: white;
}

.follow-request-actions {
  display: flex;
  gap: 0.8rem;
  margin-left: auto;
}

.accept-button,
.reject-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.accept-button {
  background-color: #4CAF50;
  color: white;
}

.reject-button {
  background-color: #f44336;
  color: white;
}

.accept-button:hover {
  background-color: #45a049;
  transform: scale(1.1);
}

.reject-button:hover {
  background-color: #da190b;
  transform: scale(1.1);
}

/* Estilo para botones deshabilitados */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.notification-item i {
  font-size: 0.9rem;
}
</style>
