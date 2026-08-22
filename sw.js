const CACHE_NAME = 'educ-rdc-v1';
const urlsToCache = [
  './',
  './index.html',
  './logoo.png',
  './president.jpg',
  './ministre.jpg',
  './directeur.jpg',
  './histoire.jpeg'
];

// Installation du Service Worker et mise en cache des fichiers essentiels
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes réseau (fonctionnement hors-ligne)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourne le fichier du cache s'il existe, sinon va le chercher sur le réseau
        return response || fetch(event.request);
      })
  );
});

// ==========================================
// AJOUT : Gestion des notifications push
// ==========================================
self.addEventListener('push', (event) => {
  const titre = "EDUC National - RDC";
  const options = {
    body: event.data ? event.data.text() : "C'est l'heure d'étudier votre cours de Nouvelle Citoyenneté !",
    icon: './logoo.png',
    badge: './logoo.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(titre, options)
  );
});

// Gestion du clic sur la notification (ouvre l'application)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
