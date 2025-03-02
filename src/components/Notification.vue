<template>
  <Transition name="notification">
    <div v-if="notificationStore.show" 
         :class="['notification', notificationStore.type]">
      <i :class="getIconClass"></i>
      {{ notificationStore.message }}
      <button class="close-btn" @click="notificationStore.hideNotification">×</button>
    </div>
  </Transition>
</template>

<script>
import { useNotificationStore } from '../stores/notification'

export default {
  name: 'Notification',
  data() {
    return {
      notificationStore: useNotificationStore()
    }
  },
  computed: {
    getIconClass() {
      switch (this.notificationStore.type) {
        case 'error':
          return 'fas fa-exclamation-circle'
        case 'success':
          return 'fas fa-check-circle'
        case 'info':
        default:
          return 'fas fa-info-circle'
      }
    }
  }
}
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 40px 15px 15px;
  border-radius: 8px;
  color: white;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  max-width: 500px;
}

.error {
  background-color: #ff4444;
}

.info {
  background-color: var(--primary-color);
}

.success {
  background-color: #4CAF50;
}

.close-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.close-btn:hover {
  opacity: 1;
}

i {
  font-size: 1.2em;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
