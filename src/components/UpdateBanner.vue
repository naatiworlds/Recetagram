<template>
  <div v-if="showUpdateBanner" class="update-banner">
    <div class="update-content">
      <div class="update-icon">
        <i class="fas fa-sync-alt"></i>
      </div>
      <div class="update-text">
        <h4>¡Nueva versión disponible!</h4>
        <p>Hay una actualización disponible con mejoras y nuevas funciones.</p>
      </div>
      <div class="update-actions">
        <button @click="updateApp" class="update-button" :disabled="isUpdating">
          <i v-if="isUpdating" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-download"></i>
          {{ isUpdating ? 'Actualizando...' : 'Actualizar' }}
        </button>
        <button @click="dismissUpdate" class="dismiss-button">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useUpdateStore } from '../stores/update'

export default {
  name: 'UpdateBanner',
  
  data() {
    return {
      updateStore: useUpdateStore(),
      isUpdating: false
    }
  },

  computed: {
    showUpdateBanner() {
      return this.updateStore.showUpdateBanner
    }
  },

  methods: {
    async updateApp() {
      this.isUpdating = true
      try {
        await this.updateStore.updateApp()
        this.updateStore.hideUpdateBanner()
      } catch (error) {
        console.error('Error al actualizar la app:', error)
      } finally {
        this.isUpdating = false
      }
    },

    dismissUpdate() {
      this.updateStore.hideUpdateBanner()
    }
  }
}
</script>

<style scoped>
.update-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  z-index: 10000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease-out;
}

.update-content {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  max-width: 1200px;
  margin: 0 auto;
  gap: 15px;
}

.update-icon {
  font-size: 24px;
  color: #fff;
  animation: rotate 2s linear infinite;
}

.update-text {
  flex: 1;
}

.update-text h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.update-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.update-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.update-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.update-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.update-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dismiss-button {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.dismiss-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .update-content {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .update-actions {
    width: 100%;
    justify-content: center;
  }
  
  .update-text h4 {
    font-size: 15px;
  }
  
  .update-text p {
    font-size: 13px;
  }
}
</style>
