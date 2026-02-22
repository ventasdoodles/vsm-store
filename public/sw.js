// Service Worker - VSM Store PWA
// Estrategias: Cache First (assets), Network First (páginas), Stale While Revalidate (imágenes)
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `vsm-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `vsm-images-${CACHE_VERSION}`;
const PAGE_CACHE = `vsm-pages-${CACHE_VERSION}`;
const FONT_CACHE = `vsm-fonts-${CACHE_VERSION}`;

const ALL_CACHES = [STATIC_CACHE, IMAGE_CACHE, PAGE_CACHE, FONT_CACHE];

// Límite de imágenes en cache (LRU)
const MAX_IMAGES = 100;

// Assets a pre-cachear durante install
const PRECACHE_URLS = [
    '/',
    '/offline.html',
    '/manifest.json',
    '/logo-vsm.png',
];

// Dominios de API que NO deben cachearse
const API_DOMAINS = [
    'supabase.co',
    'supabase.io',
];

// Dominios de fuentes que sí deben cachearse
const FONT_DOMAINS = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
];

// Dominios de imágenes de Supabase Storage
const IMAGE_STORAGE_DOMAINS = [
    'supabase.co/storage',
    'supabase.in/storage',
];

// ---------------------------------------------------
// Install: pre-cachear assets críticos
// ---------------------------------------------------
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Pre-caching assets (v2)');
            return cache.addAll(PRECACHE_URLS);
        })
    );
    // Activar inmediatamente sin esperar
    self.skipWaiting();
});

// ---------------------------------------------------
// Activate: limpiar caches viejos
// ---------------------------------------------------
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => !ALL_CACHES.includes(name))
                    .map((name) => {
                        console.log('[SW] Eliminando cache viejo:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    // Tomar control de todas las pestañas
    self.clients.claim();
});

// ---------------------------------------------------
// Fetch: decidir estrategia según tipo de request
// ---------------------------------------------------
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // NO cachear requests que no sean GET
    if (event.request.method !== 'GET') return;

    // NO cachear extensiones de Chrome u otros protocolos
    if (!url.protocol.startsWith('http')) return;

    // ── Google Fonts: Cache First (raramente cambian) ──
    if (FONT_DOMAINS.some((d) => url.hostname.includes(d))) {
        event.respondWith(cacheThenNetwork(event.request, FONT_CACHE));
        return;
    }

    // ── Supabase Storage Images: Stale While Revalidate ──
    if (IMAGE_STORAGE_DOMAINS.some((d) => url.href.includes(d))) {
        event.respondWith(staleWhileRevalidate(event.request, IMAGE_CACHE));
        return;
    }

    // NO cachear llamadas a Supabase API
    if (API_DOMAINS.some((d) => url.hostname.includes(d))) return;

    // ── Assets estáticos (JS, CSS, imágenes locales): Cache First ──
    if (isStaticAsset(url)) {
        event.respondWith(cacheThenNetwork(event.request, STATIC_CACHE));
        return;
    }

    // ── Imágenes externas: Stale While Revalidate ──
    if (isImageRequest(event.request, url)) {
        event.respondWith(staleWhileRevalidate(event.request, IMAGE_CACHE));
        return;
    }

    // ── Páginas HTML: Network First con fallback offline ──
    event.respondWith(networkFirstWithOffline(event.request));
});

// ---------------------------------------------------
// Estrategias
// ---------------------------------------------------

/**
 * Cache First: buscar en cache, si no hay ir a red y cachear
 */
async function cacheThenNetwork(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
}

/**
 * Stale While Revalidate: servir de cache inmediatamente,
 * mientras actualiza en background. Ideal para imágenes.
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Revalidar en background
    const fetchPromise = fetch(request)
        .then(async (response) => {
            if (response.ok) {
                await cache.put(request, response.clone());
                // LRU: limpiar si excede límite
                if (cacheName === IMAGE_CACHE) {
                    await trimCache(cache, MAX_IMAGES);
                }
            }
            return response;
        })
        .catch(() => cached); // Si falla la red, usar cache

    // Retornar cache si está disponible, sino esperar red
    return cached || fetchPromise;
}

/**
 * Network First con fallback a página offline
 */
async function networkFirstWithOffline(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(PAGE_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        // Intentar servir de cache
        const cached = await caches.match(request);
        if (cached) return cached;

        // Si es una navegación HTML, servir página offline
        if (request.mode === 'navigate') {
            const offlinePage = await caches.match('/offline.html');
            if (offlinePage) return offlinePage;
        }

        // Fallback: intentar servir la página principal cacheada
        const fallback = await caches.match('/');
        if (fallback) return fallback;

        return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
}

// ---------------------------------------------------
// Helpers
// ---------------------------------------------------

function isStaticAsset(url) {
    const staticExtensions = [
        '.js', '.css', '.woff', '.woff2', '.ttf', '.eot', '.ico',
    ];
    return staticExtensions.some((ext) => url.pathname.endsWith(ext));
}

function isImageRequest(request, url) {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'];
    if (imageExtensions.some((ext) => url.pathname.endsWith(ext))) return true;
    if (request.headers.get('Accept')?.includes('image/')) return true;
    return false;
}

/**
 * LRU eviction: mantener solo los N items más recientes en el cache
 */
async function trimCache(cache, maxItems) {
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        // Eliminar los más viejos (primeros en la lista)
        const toDelete = keys.slice(0, keys.length - maxItems);
        await Promise.all(toDelete.map((key) => cache.delete(key)));
    }
}
