import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createHead } from '@vueuse/head';
import App from './App.vue';
import router from './router';

import { useNotificationStore } from './stores/notification';
import { useUserStore } from './stores/user';
import { apiService } from './services/api';

// Importar Firebase y FCM
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Crear la app y Pinia
const app = createApp(App);
const pinia = createPinia();
const head = createHead();

app.use(pinia);
app.use(head);

const initializeVueApp = async () => {
  const userStore = useUserStore();
  await userStore.initializeAuth();

  // Ahora que la auth está lista, montar router y app
  app.use(router);
  app.mount('#app');
};

initializeVueApp();

// Manejo global de errores
app.config.errorHandler = (error, vm, info) => {
  console.error('Error global:', error);
  console.error('Info:', info);

  const notificationStore = useNotificationStore();
  notificationStore.show('Ha ocurrido un error inesperado', 'error');
};



export default app;
