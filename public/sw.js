// Nombre del caché - Cambiar la versión cuando hay actualizaciones
const CACHE_NAME = "recetagram-cache-v5";

// Archivos a cachear
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/install.js"
];  

// Instalación del Service Worker y cacheo de recursos
self.addEventListener("install", (event) => {
  // Service Worker installing
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
  // cache opened
      return cache.addAll(urlsToCache);
    }).catch((error) => { 
      console.error("Error al cachear archivos: ", error);
      // Continuar aunque falle el cache
      return Promise.resolve();
    })
  );
  // Forzar activación inmediata
  self.skipWaiting();
});

// Activación y limpieza de cachés antiguos
self.addEventListener("activate", (event) => {
  // Service Worker activating
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            // removing old cache
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Tomar control inmediato
  self.clients.claim();
});

// Escuchar mensajes del cliente para activar actualizaciones
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Intercepción de solicitudes (modo offline básico)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devolver desde cache si está disponible, sino hacer fetch
      return response || fetch(event.request).catch(() => {
        // Si falla el fetch, devolver página offline si es una navegación
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});


// Comentario de actualización