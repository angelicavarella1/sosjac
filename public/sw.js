// public/sw.js

self.addEventListener('install', event => {
  console.log('[SW] Instalado com sucesso!');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Ativado com sucesso!');
  return self.clients.claim();
});

// 👇 RECEBE NOTIFICAÇÕES PUSH
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || 'SOSJAC';
  const options = {
    body: data.body || 'Você tem uma atualização importante.',
    icon: '/logo.png',
    badge: '/logo192.png',
    data: {
      url: data.url || '/dashboard'
    },
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 👇 ABRE O APP QUANDO CLICAR NA NOTIFICAÇÃO
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      const url = event.notification.data.url;
      for (let client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});