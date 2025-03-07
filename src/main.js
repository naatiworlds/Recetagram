import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import router from './router'
import { loadTheme } from "./utils/changeTheme"; // Importa la función
import { setupTheme } from './utils/changeLightDark.js';
import axios from 'axios'
import { useAuthStore } from './stores/auth'

console.log('[Main] Iniciando aplicación');
loadTheme(); 

// Configuración base de axios
console.log('[Main] Configurando axios');
axios.defaults.baseURL = "http://localhost:8000" 
axios.defaults.headers.common['Accept'] = 'application/json'

// Verificar si hay token y configurarlo globalmente
const token = localStorage.getItem('token');
console.log('[Main] Token en localStorage:', token ? 'Presente' : 'No encontrado');
if (token) {
  console.log('[Main] Configurando token global en axios');
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializar el store de autenticación antes de montar la aplicación
console.log('[Main] Inicializando store de autenticación');
const authStore = useAuthStore()
authStore.initializeAuth()

// Verificar estado de autenticación después de inicializar
console.log('[Main] Estado de autenticación después de inicializar:', 
  authStore.isAuthenticated ? 'Autenticado' : 'No autenticado');
console.log('[Main] Usuario actual:', authStore.user ? authStore.user.name : 'Ninguno');

app.mount('#app')
console.log('[Main] Aplicación montada');
