<template>
  <div class="notification-container">
    <div 
      v-for="notification in notifications" 
      :key="notification.id"
      class="notification"
      :class="notification.type"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { useNotificationStore } from '../stores/notification'

export default {
  name: 'Notification',
  setup() {
    const notificationStore = useNotificationStore()
    return {
      notifications: notificationStore.notifications
    }
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.notification {
  margin-bottom: 10px;
  padding: 15px 20px;
  border-radius: 4px;
  color: white;
  min-width: 300px;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.success {
  background-color: #4caf50;
}

.error {
  background-color: #f44336;
}

.warning {
  background-color: #ff9800;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
