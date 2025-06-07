import { createPinia } from 'pinia';
import { createApp } from 'vue';
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

app.use(pinia);

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

// Si el navegador soporta Service Workers, registrar uno
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('Service Worker registrado con éxito:', registration);

      // Configurar Firebase Messaging
      const messaging = getMessaging(firebaseApp);

      // Solicitar permiso para notificaciones y obtener el token FCM
      getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY })
        .then((currentToken) => {
          if (currentToken && typeof currentToken === 'string') {
            console.log('Token FCM obtenido:', currentToken);

            // Enviar el token al backend utilizando la función de api.js
            apiService
              .sendTokenNotification(currentToken)
              .then(() => {
                console.log('Token FCM enviado al backend con éxito.');
              })
              .catch((err) => {
                console.error('Error al enviar el token al backend:', err);
              });
          } else {
            console.log('No se obtuvo un token válido. Solicita permiso.');
          }
        })
        .catch((err) => {
          console.error('Error al obtener token FCM:', err);
        });

      // Escuchar mensajes en primer plano
      onMessage(messaging, (payload) => {
        console.log('Mensaje en primer plano:', payload);
        const notificationStore = useNotificationStore();
        notificationStore.show(
          `${payload.notification.title}: ${payload.notification.body}`,
          'info'
        );
      });
    })
    .catch((err) => {
      console.error('Error al registrar el Service Worker:', err);
    });
}

export default app;
