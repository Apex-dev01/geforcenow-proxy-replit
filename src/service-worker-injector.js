/**
 * Service Worker Injector Module
 * Injects service workers into pages to intercept network requests
 * and provide offline support and caching capabilities
 */

/**
 * Generate a service worker script that can be injected into pages
 * @param {string} proxyBaseUrl - The proxy server base URL
 * @returns {string} Service worker code
 */
function generateServiceWorkerScript(proxyBaseUrl) {
  return `
// Injected Service Worker for GeForce NOW Proxy
(function() {
  'use strict';
  
  const CACHE_NAME = 'geforcenow-proxy-v1';
  const PROXY_BASE = '${proxyBaseUrl}';
  
  // Listen for installation
  self.addEventListener('install', event => {
    console.log('[GeForce NOW Proxy SW] Installing service worker');
    self.skipWaiting();
  });
  
  // Listen for activation
  self.addEventListener('activate', event => {
    console.log('[GeForce NOW Proxy SW] Activating service worker');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
    self.clients.claim();
  });
  
  // Intercept network requests
  self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests for now
    if (request.method !== 'GET') {
      return;
    }
    
    // Skip chrome extensions and internal requests
    if (url.protocol === 'chrome-extension:' || url.origin === self.location.origin) {
      return;
    }
    
    event.respondWith(
      handleRequest(request)
        .catch(error => {
          console.error('[GeForce NOW Proxy SW] Error handling request:', error);
          return new Response('Network request failed', { status: 503 });
        })
    );
  });
  
  async function handleRequest(request) {
    // Try network first, fallback to cache
    try {
      const response = await fetch(request);
      
      if (response.ok && shouldCache(request)) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      
      return response;
    } catch (error) {
      // Fall back to cache
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }
      
      throw error;
    }
  }
  
  function shouldCache(request) {
    const url = new URL(request.url);
    // Cache static assets
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2'];
    return staticExtensions.some(ext => url.pathname.endsWith(ext));
  }
})();
`;
}

/**
 * Generate HTML code to inject the service worker
 * @param {string} proxyBaseUrl - The proxy server base URL
 * @returns {string} HTML code to inject
 */
function generateServiceWorkerInjectCode(proxyBaseUrl) {
  return `
<!-- Injected Service Worker Registration -->
<script>
(function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('${proxyBaseUrl}/sw.js', {
      scope: '/'
    }).then(registration => {
      console.log('[GeForce NOW Proxy] Service Worker registered successfully:', registration);
    }).catch(error => {
      console.warn('[GeForce NOW Proxy] Service Worker registration failed:', error);
    });
  }
})();
</script>
`;
}

/**
 * Inject service worker script into HTML content
 * @param {string} html - The HTML content
 * @param {string} proxyBaseUrl - The proxy server base URL
 * @returns {string} Modified HTML with service worker injection
 */
function injectServiceWorker(html, proxyBaseUrl) {
  try {
    const injectCode = generateServiceWorkerInjectCode(proxyBaseUrl);
    
    // Inject before closing </body> tag
    if (html.includes('</body>')) {
      return html.replace('</body>', injectCode + '</body>');
    }
    
    // If no body tag, append to end
    return html + injectCode;
  } catch (error) {
    console.error('Error injecting service worker:', error);
    return html;
  }
}

module.exports = {
  generateServiceWorkerScript,
  generateServiceWorkerInjectCode,
  injectServiceWorker
};
