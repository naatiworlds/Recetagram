import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import router from './router/index.js'  // Asegúrate de que la ruta sea correcta
import { loadTheme } from "./utils/changeTheme"; // Importa la función
import { setupTheme } from './utils/changeLightDark.js';
import axios from 'axios'
import { useAuthStore } from './stores/auth'

loadTheme(); 

axios.defaults.baseURL = "http://localhost:8000" // Reemplaza con tu URL base real
axios.defaults.headers.common['Accept'] = 'application/json'

// Configurar axios con el token si existe
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Inicializar auth store antes de montar la aplicación
const authStore = useAuthStore()
authStore.initializeAuth()

app.use(router)

app.mount('#app')
