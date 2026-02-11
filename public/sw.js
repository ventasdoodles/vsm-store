// Service Worker - VSM Store PWA
// Estrategia: Cache First para assets, Network First para páginas
const CACHE_NAME = 'vsm-v1';

// Assets a pre-cachear durante install
const PRECACHE_URLS = [
    '/',
    '/manifest.json',
    '/logo-vsm.png',
];

// Dominios de API que NO deben cachearse
const API_DOMAINS = [
    'supabase.co',
    'supabase.io',
];

// ---------------------------------------------------
// Install: pre-cachear assets críticos
// ---------------------------------------------------
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Pre-caching assets');
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
                    .filter((name) => name !== CACHE_NAME)
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

    // NO cachear llamadas a Supabase u otras APIs
    if (API_DOMAINS.some((domain) => url.hostname.includes(domain))) {
        return; // Dejar pasar sin interceptar
    }

    // NO cachear requests que no sean GET
    if (event.request.method !== 'GET') {
        return;
    }

    // NO cachear extensiones de Chrome u otros protocolos
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Assets estáticos (JS, CSS, imágenes, fuentes): Cache First
    if (isStaticAsset(url)) {
        event.respondWith(cacheFirst(event.request));
        return;
    }

    // Páginas HTML: Network First (para tener contenido fresco)
    event.respondWith(networkFirst(event.request));
});

// ---------------------------------------------------
// Helpers
// ---------------------------------------------------

function isStaticAsset(url) {
    const staticExtensions = [
        '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
        '.webp', '.woff', '.woff2', '.ttf', '.eot', '.ico',
    ];
    return staticExtensions.some((ext) => url.pathname.endsWith(ext));
}

// Cache First: buscar en cache, si no hay ir a red y cachear
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        // Offline y no en cache
        return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
}

// Network First: intentar red, si falla usar cache
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        // Fallback: intentar servir la página principal cacheada
        const fallback = await caches.match('/');
        if (fallback) {
            return fallback;
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
}
