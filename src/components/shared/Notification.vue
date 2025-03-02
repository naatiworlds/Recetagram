<template>
  <transition name="notification">
    <div v-if="notificationStore.isVisible" 
         :class="['notification', `notification-${notificationStore.type}`]">
      {{ notificationStore.message }}
    </div>
  </transition>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 2rem;
  border-radius: 4px;
  color: var(--text-color);
  z-index: 1000;
}

.notification-success {
  background-color: var(--primary-color);
}

.notification-error {
  background-color: var(--contrast-color);
}

.notification-info {
  background-color: var(--secundary-color);
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
