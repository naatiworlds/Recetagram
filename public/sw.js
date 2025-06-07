// Nombre del caché
const CACHE_NAME = "tpv-cache-v1";

// Archivos a cachear
const urlsToCache = [
  "/",
  "/index.html",
  "/src/main.jsx",
  "/css/index.css",
  "/images/logo.png",
  // Agrega más rutas si lo necesitas
];

// Instalación del Service Worker y cacheo de recursos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Archivos cacheados");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación y limpieza de cachés antiguos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Cache antiguo eliminado:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Intercepción de solicitudes (modo offline básico)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registrado con éxito:', registration);

      // Configurar Firebase Messaging
      const messaging = getMessaging(firebaseApp);

      // Solicitar permiso para notificaciones y obtener el token FCM
      getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY })
        .then((currentToken) => {
          if (currentToken) {
            console.log('Token FCM:', currentToken);
            apiService.sendTokenNotification(currentToken);
          } else {
            console.log('No se obtuvo token, solicita permiso.');
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


