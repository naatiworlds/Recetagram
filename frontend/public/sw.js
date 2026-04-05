// Nombre del caché - Cambiar la versión cuando hay actualizaciones
const CACHE_NAME = "recetagram-cache-v12";

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

  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const payload = event.data.payload || {};
    const title = payload.title || "Recetagram";
    const options = {
      body: payload.body || "Tienes una nueva notificación",
      icon: payload.icon || "/icons/icon-192.png",
      badge: payload.badge || "/icons/icon-192.png",
      data: payload.data || { url: "/" }
    };

    event.waitUntil((async () => {
      await self.registration.showNotification(title, options);
      const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clientsList.forEach((client) => {
        client.postMessage({ type: 'SOUND_NOTIFICATION' });
      });
    })());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';

  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsList) {
      if ('focus' in client) {
        await client.focus();
        if ('navigate' in client) {
          client.navigate(url);
        }
        return;
      }
    }
    if (self.clients.openWindow) {
      await self.clients.openWindow(url);
    }
  })());
});

// Intercepción de solicitudes (modo offline básico)
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.method === "POST" && requestUrl.pathname === "/share-target") {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const title = String(formData.get("title") || "");
          const text = String(formData.get("text") || "");
          const url = String(formData.get("url") || "");

          const redirectUrl = new URL("/share-target", self.location.origin);
          if (title) redirectUrl.searchParams.set("title", title);
          if (text) redirectUrl.searchParams.set("text", text);
          if (url) redirectUrl.searchParams.set("url", url);

          return Response.redirect(redirectUrl.toString(), 303);
        } catch (error) {
          console.error("Error procesando share_target:", error);
          return Response.redirect("/share-target", 303);
        }
      })()
    );
    return;
  }

  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devolver desde cache si está disponible, sino hacer fetch
      return response || fetch(event.request).catch(() => {
        // Si falla el fetch, devolver página offline si es una navegación
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }

        return new Response('', { status: 504, statusText: 'Gateway Timeout' });
      });
    })
  );
});
