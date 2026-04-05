<template>
  <div v-if="isOpen" class="notifications-modal">
    <div class="notifications-content">
      <div class="notifications-header">
        <h3>Notificaciones</h3>
        <div class="header-actions">
          <div class="tooltip">
            <button v-if="store.hasUnreadNotifications" class="mark-all-read" @click="handleMarkAllAsRead">
              <i class="fa-solid fa-eye"></i>
            </button>
            <span class="tooltiptext">Marcar todo como leído</span>
          </div>
          <button class="close-button" @click="$emit('close')">&times;</button>
        </div>
      </div>

      <div class="notifications-list">
        <div v-if="!store.notifications || store.notifications.length === 0" class="no-notifications">
          No hay notificaciones
        </div>
        <template v-else>
          <div v-for="notification in store.sortedNotifications" :key="notification.id"
            :class="['notification-item', { unread: !notification.read }]"
            @click="handleNotificationClick(notification)">
            <div class="notification-content">
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatTime(notification.created_at) }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { useInteractionNotificationStore } from '../stores/interactionNotifications'

export default {
  name: 'NotificationModal',

  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },

  setup() {
    const store = useInteractionNotificationStore()
    return { store }
  },

  mounted() {
    console.log('NotificationModal mounted, store:', this.store);
    console.log('Notifications:', this.store.notifications);
  },

  watch: {
    'store.notifications': {
      handler(newVal) {
        console.log('Notifications updated:', newVal);
      },
      deep: true
    },
    isOpen(newVal) {
      if (newVal) {
        console.log('Modal opened, notifications:', this.store.notifications);
      }
    }
  },

  methods: {
    async handleNotificationClick(notification) {
      if (!notification.read) {
        await this.store.markAsRead(notification.id)
      }
      // Aquí puedes añadir navegación al contenido relacionado si es necesario
    },

    async handleMarkAllAsRead() {
      await this.store.markAllAsRead()
    },

    formatTime(timestamp) {
      if (!timestamp) return 'Fecha no disponible'

      try {
        const date = new Date(timestamp)
        if (isNaN(date.getTime())) return 'Fecha no disponible'

        const now = new Date()
        const diff = now - date

        if (diff < 60000) return 'Hace un momento'
        if (diff < 3600000) {
          const minutes = Math.floor(diff / 60000)
          return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
        }
        if (diff < 86400000) {
          const hours = Math.floor(diff / 3600000)
          return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
        }
        if (diff < 604800000) {
          const days = Math.floor(diff / 86400000)
          return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
        }

        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch (error) {
        console.error('Error formatting date:', error)
        return 'Fecha no disponible'
      }
    }
  }
}
</script>

<style scoped>
.notifications-modal {
  position: fixed;
  top: 60px;
  right: 20px;
  background: var(--complementary-color);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
  max-height: 400px;
  z-index: 1000;
  overflow: hidden;
}

.notifications-content {
  display: flex;
  flex-direction: column;
  max-height: 400px;
}

.notifications-header {
  padding: 15px;
  background: var(--primary-color);
  color: var(--text-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.header-actions button {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 18px;
  cursor: pointer;
  margin-left: 10px;
}

.close-button {
  font-size: 24px;
  line-height: 1;
}

.notifications-list {
  padding: 10px;
  overflow-y: auto;
  background-color: var(--complementary-color);
  flex-grow: 1;
}

.notification-item {
  padding: 10px;
  border-bottom: 1px solid var(--sombra-color);
  cursor: pointer;
  transition: background 0.3s;
}

.notification-item:hover {
  background-color: var(--primary-color);
}

.notification-item.unread {
  background-color: var(--secundary-color);
  font-weight: bold;
}

.notification-item.unread:hover {
  background-color: var(--sombra-color);
}

.notification-content {
  display: flex;
  flex-direction: column;
}

.notification-message {
  font-size: 14px;
}

.notification-time {
  font-size: 12px;
  color: #777;
  margin-top: 5px;
}

.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  visibility: hidden;
  opacity: 0;
  width: 140px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  text-align: center;
  border-radius: 4px;
  padding: 5px 8px;
  position: absolute;
  z-index: 1001;
  top: 125%;
  left: 40%;
  transform: translateX(-65%);
  transition: opacity 0.3s;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
</style>