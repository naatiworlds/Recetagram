import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { useNotificationStore } from './stores/notification'
import { useUserStore } from './stores/user'
import { apiService } from './services/api'

// Crear la app y pinia
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const initializeApp = async () => {
  const userStore = useUserStore()
  await userStore.initializeAuth()

  // Ahora que la auth está lista, montar router y app
  app.use(router)
  app.mount('#app')
}

initializeApp()

// Manejo global de errores
app.config.errorHandler = (error, vm, info) => {
  console.error('Error global:', error)
  console.error('Info:', info)

  const notificationStore = useNotificationStore()
  notificationStore.show(
    'Ha ocurrido un error inesperado',
    'error'
  )
}

export default app
