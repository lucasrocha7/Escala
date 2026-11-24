// Service worker: guarda o aplicativo no celular para abrir mesmo sem internet.
// Estratégia: tenta a rede primeiro (para receber atualizações) e usa o cache se falhar.
importScripts('versao.js');
const CACHE = 'escala-' + self.ESCALA_VERSAO;
const BASICO = ['./', 'index.html', 'config.js', 'versao.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.svg'];

self.addEventListener('install', e => {
  // Sem skipWaiting aqui: a versão nova espera o usuário tocar em "Atualizar" no aplicativo.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICO)));
});
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;   // a API do Google nunca passa pelo cache
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      return res;
    }).catch(() => caches.match(req).then(m => m || caches.match('index.html')))
  );
});
