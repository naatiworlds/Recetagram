// Nombre del caché - Cambiar la versión cuando hay actualizaciones estructurales del SW
const CACHE_NAME = "recetagram-cache-v13";

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

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const freshResponse = await fetch(request);

    if (freshResponse && freshResponse.status === 200) {
      cache.put(request, freshResponse.clone());
    }

    return freshResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    if (request.mode === 'navigate') {
      const fallback = await cache.match('/index.html');
      if (fallback) return fallback;
    }

    return new Response('', { status: 504, statusText: 'Gateway Timeout' });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  return cachedResponse || networkPromise || new Response('', { status: 504, statusText: 'Gateway Timeout' });
}

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
      data: payload.data || { url: "/" },
      silent: false,
      requireInteraction: true,
      renotify: true
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

self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  event.waitUntil((async () => {
    try {
      const payload = event.data.json();
      const title = payload?.notification?.title || payload?.title || 'Recetagram';
      const body = payload?.notification?.body || payload?.body || 'Nueva actualización disponible';
      const url = payload?.data?.url || payload?.url || '/';

      await self.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        image: '/icons/icon-192.png',
        data: { url },
        tag: 'recetagram-notification',
        renotify: true,
        requireInteraction: false
      });

      await playNotificationSound();
    } catch (error) {
      await self.registration.showNotification('Recetagram', {
        body: 'Nueva actualización disponible',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data: { url: '/' },
        tag: 'recetagram-notification',
        renotify: true,
        requireInteraction: false
      });

      await playNotificationSound();
    }
  })());
});

async function playNotificationSound() {
  try {
    const AudioContext = self.AudioContext || self.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch (error) {
    console.warn('[SW] no se pudo reproducir sonido de notificacion', error);
  }
}

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

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  const isStaticAsset = requestUrl.pathname.startsWith('/assets/') || /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/i.test(requestUrl.pathname);

  if (isStaticAsset) {
    event.respondWith(staleWhileRevalidate(event.request));
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
