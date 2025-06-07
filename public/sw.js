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


