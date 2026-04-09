import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createHead } from '@vueuse/head';
import App from './App.vue';
import router from './router';

import { useNotificationStore } from './stores/notification';
import { useUserStore } from './stores/user';
import { apiService } from './services/api';
import { playNotificationSound } from './utils/notificationSound';

// Importar Firebase y FCM
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

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

const hasFirebaseMessagingConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId
].every((value) => Boolean(String(value || '').trim()));

let firebaseApp = null;
let messaging = null;

if (hasFirebaseMessagingConfig) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  console.warn('[FCM] configuración Firebase incompleta, FCM desactivado en este entorno');
}

// Crear la app y Pinia
const app = createApp(App);
const pinia = createPinia();
const head = createHead();

app.use(pinia);
app.use(head);

const initializeVueApp = async () => {
  const userStore = useUserStore();
  const isAuthenticated = await userStore.initializeAuth();

  // Ahora que la auth está lista, montar router y app
  app.use(router);
  app.mount('#app');

  if (isAuthenticated) {
    setupFcmNotifications();
  }
};

initializeVueApp();

async function setupFcmNotifications() {
  if (!firebaseApp || !('serviceWorker' in navigator) || typeof Notification === 'undefined') {
    return;
  }

  try {
    if (!(await isSupported())) {
      console.warn('[FCM] este navegador no soporta Firebase Messaging');
      return;
    }

    if (!messaging) {
      messaging = getMessaging(firebaseApp);
    }

    const registration = await navigator.serviceWorker.ready;

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      return;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('[FCM] falta VITE_FIREBASE_VAPID_KEY');
      return;
    }

    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration
    });

    if (currentToken) {
      await apiService.sendTokenNotification(currentToken);
    }
  } catch (error) {
    console.error('[FCM] error configurando token', error);
  }
}

async function setupForegroundMessaging() {
  if (!firebaseApp) {
    return;
  }

  try {
    if (!(await isSupported())) {
      return;
    }

    if (!messaging) {
      messaging = getMessaging(firebaseApp);
    }

    onMessage(messaging, (payload) => {
      const title = payload?.notification?.title || 'Recetagram';
      const body = payload?.notification?.body || 'Nueva actualización disponible';

      const notificationPayload = {
        title,
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data: {
          url: payload?.data?.url || payload?.fcmOptions?.link || payload?.notification?.click_action || '/'
        }
      }

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((registration) => {
            if (registration?.active) {
              registration.active.postMessage({
                type: 'SHOW_NOTIFICATION',
                payload: notificationPayload
              })
            } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification(title, {
                body,
                icon: '/icons/icon-192.png'
              })
              playNotificationSound()
            }
          })
          .catch(() => {
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification(title, {
                body,
                icon: '/icons/icon-192.png'
              })
            }
            playNotificationSound()
          })
      } else {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/icons/icon-192.png'
          })
        }
        playNotificationSound()
      }
    });
  } catch (error) {
    console.warn('[FCM] no se pudo inicializar foreground messaging', error);
  }
}

setupForegroundMessaging();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event?.data?.type === 'SOUND_NOTIFICATION') {
      playNotificationSound()
    }
  })
}

// Manejo global de errores
app.config.errorHandler = (error, vm, info) => {
  console.error('Error global:', error);
  console.error('Info:', info);

  const notificationStore = useNotificationStore();
  notificationStore.show('Ha ocurrido un error inesperado', 'error');
};



export default app;
