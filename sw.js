const VERSION = '2';
const scope = new URL(self.registration.scope);
const cachePrefix = `chismoso-anonimo:${encodeURIComponent(scope.pathname)}:`;
const staticCache = `${cachePrefix}estatica-v${VERSION}`;
const dynamicCache = `${cachePrefix}dinamica-v${VERSION}`;
const indexUrl = new URL('index.html', scope);
const assetsPath = new URL('assets/', scope).pathname;
const iconPath = 'assets/icons/icon-192.png';
const faviconUrl = new URL(`${iconPath}?favicon=1`, scope);
const shell = [
  'index.html',
  'manifest.json',
  'css/styles.css',
  'js/app.js',
  'js/router.js',
  'js/data/reports-db.js',
  'js/services/camera.js',
  'js/services/geolocation.js',
  'js/services/install-app.js',
  'js/services/register-worker.js',
  'js/views/components.js',
  'js/views/dashboard.js',
  'js/views/report-card.js',
  'js/views/report-evidence.js',
  'js/views/report-form.js',
  'js/views/reports.js',
  'js/views/select-picker.js',
  'assets/icons/ui.svg',
  iconPath,
  'assets/icons/icon-512.png',
  'assets/icons/maskable-192.png',
  'assets/icons/maskable-512.png',
  'assets/icons/apple-touch-icon.png',
].map(path => new URL(path, scope).href);
const shellUrls = new Set(shell);
const contentTypes = {
  html: /^(text\/html)\b/i,
  json: /^application\/(?:manifest\+)?json\b/i,
  css: /^text\/css\b/i,
  js: /^(?:text|application)\/(?:java|ecma)script\b/i,
  svg: /^image\/svg\+xml\b/i,
  png: /^image\/png\b/i,
  jpg: /^image\/jpeg\b/i,
  jpeg: /^image\/jpeg\b/i,
  webp: /^image\/webp\b/i,
  avif: /^image\/avif\b/i,
  gif: /^image\/gif\b/i,
  woff2: /^(?:font\/woff2|application\/font-woff2)\b/i,
};

function validResponse(response, extension) {
  return response.status === 200 && response.type === 'basic' && !response.redirected &&
    contentTypes[extension]?.test(response.headers.get('content-type') ?? '');
}

function cacheable(response) {
  return !/\b(?:no-store|private)\b/i.test(response.headers.get('cache-control') ?? '') &&
    response.headers.get('vary') !== '*';
}

async function matchingIndex(response) {
  if (!validResponse(response, 'html')) return false;
  const html = await response.clone().text();
  return html.includes(`<meta name="app-shell-version" content="${VERSION}">`);
}

async function precache() {
  // Fetch and validate the entire release before writing any of its files.
  const entries = await Promise.all(shell.map(async url => {
    const response = await fetch(url, { cache: 'reload' });
    const extension = new URL(url).pathname.split('.').pop();
    if (!validResponse(response, extension) || !cacheable(response) ||
        (url === indexUrl.href && !(await matchingIndex(response)))) {
      throw new Error(`No se pudo precargar ${url}`);
    }
    return [url, response];
  }));
  const cache = await caches.open(staticCache);
  const results = await Promise.allSettled(entries.map(([url, response]) => cache.put(url, response)));
  const failure = results.find(result => result.status === 'rejected');
  if (failure) {
    await caches.delete(staticCache);
    throw failure.reason;
  }
}

self.addEventListener('install', event => {
  event.waitUntil(precache());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(cachePrefix) &&
      name !== staticCache && name !== dynamicCache).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

function unavailable(navigation = false) {
  const message = navigation
    ? '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sin conexión · Chismoso Anónimo</title><h1>Interfaz sin conexión no disponible</h1><p>Conéctate y vuelve a abrir Chismoso Anónimo para cargar sus recursos.</p></html>'
    : 'Recurso no disponible sin conexión.';
  return new Response(message, {
    status: 503,
    headers: { 'Content-Type': navigation ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8' },
  });
}

async function navigate(request) {
  try {
    const response = await fetch(request, { cache: 'no-store', signal: AbortSignal.timeout?.(5000) });
    // An active worker can meet a newer deployment while old tabs still control its lifetime.
    if (await matchingIndex(response)) return response;
  } catch {
    // Use the HTML from the same release as the cached scripts and styles.
  }
  return (await caches.match(indexUrl.href, { cacheName: staticCache })) ?? unavailable(true);
}

async function staticAsset(url) {
  const cached = await caches.match(url.href, { cacheName: staticCache });
  if (cached) return cached;

  try {
    // Recover a missing entry only while the server still serves this release.
    const index = await fetch(indexUrl, { cache: 'no-store' });
    if (!(await matchingIndex(index))) return unavailable();
    const response = url.href === indexUrl.href ? index : await fetch(url, { cache: 'reload' });
    if (validResponse(response, url.pathname.split('.').pop())) {
      await remember(staticCache, url.href, response);
      return response;
    }
  } catch {
    // A missing shell resource cannot be recovered offline.
  }
  return unavailable();
}

async function remember(name, request, response) {
  if (!cacheable(response)) return;
  try {
    const cache = await caches.open(name);
    await cache.put(request, response.clone());
  } catch {
    // The network response is still usable if storage is unavailable.
  }
}

async function localAsset(request, extension) {
  try {
    const response = await fetch(request);
    if (validResponse(response, extension)) {
      await remember(dynamicCache, request, response);
      return response;
    }
    const previous = await caches.match(request, { cacheName: dynamicCache });
    return previous ?? response;
  } catch {
    return (await caches.match(request, { cacheName: dynamicCache })) ?? unavailable();
  }
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  const url = new URL(request.url);
  if (!/^https?:$/.test(url.protocol) || url.origin !== scope.origin) return;

  if (request.mode === 'navigate') {
    if (url.pathname === scope.pathname || url.pathname === indexUrl.pathname) {
      event.respondWith(navigate(request));
    }
    return;
  }

  const staticUrl = url.href === faviconUrl.href ? new URL(iconPath, scope) : url;
  if (shellUrls.has(staticUrl.href)) {
    event.respondWith(staticAsset(staticUrl));
    return;
  }
  const extension = url.pathname.split('.').pop().toLowerCase();
  if (url.pathname.startsWith(assetsPath) && contentTypes[extension] &&
      extension !== 'html' && extension !== 'json') {
    event.respondWith(localAsset(request, extension));
  }
});
