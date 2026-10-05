/**
 * Akwaba Chat — Service Worker PWA
 * Gestion du cache hors-ligne et activation de l'installation sur Android, iOS & Desktop
 */

const CACHE_NAME = "akwaba-chat-v1";
const OFFLINE_URL = "/";

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/apple-touch-icon.png",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-192x192.png",
  "/icons/icon-maskable-512x512.png",
  "/assets/mascot-walking.png",
  "/assets/mascot-running.png",
  "/assets/mascot-searching.png",
  "/assets/mascot-success.png",
  "/assets/mascot-error.png",
];

// 1. Installation : mise en cache des assets statiques de base
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn("[SW] Certains assets n'ont pas pu être pré-cachés:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activation : nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. Stratégie réseau :
// - API (/api/*) : toujours réseau direct (jamais de cache pour les réponses d'IA en streaming)
// - Assets statiques / images : Stale-While-Revalidate ou Cache-First
// - Navigation : Réseau en priorité avec fallback sur cache
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ne pas intercepter les requêtes non-GET ou les routes d'API/streaming
  if (event.request.method !== "GET" || url.pathname.startsWith("/api/")) {
    return;
  }

  // Pour les pages web (navigation)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(OFFLINE_URL);
        return cached || new Response("Vous êtes hors-ligne. Veuillez vous reconnecter.", {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      })
    );
    return;
  }

  // Pour les images et assets statiques
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Stratégie Stale-While-Revalidate par défaut
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
