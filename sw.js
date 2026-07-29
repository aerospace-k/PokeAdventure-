const CACHE_NAME = "pokemon-learning-adventure-v1.0.28";
const APP_SHELL = [
  "./",
  "./index.html",
  "./dist/main.js",
  "./dist/styles.css",
  "./voltorb-enhancements.css",
  "./voltorb-enhancements.js",
  "./config/allowed-trainers.js",
  "./site.webmanifest",
  "./assets/pokeball-favicon.svg",
  "./assets/pokeball-icon-192.png",
  "./assets/pokeball-icon-512.png"
];

self.addEventListener("install",(event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate",(event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});

function isCacheable(response) {
  return response.ok || response.type === "opaque";
}

async function fetchWithDeadline(request, timeoutMs = 6000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(),timeoutMs);
  try {
    return await fetch(request,{signal:controller.signal});
  } finally {
    clearTimeout(timeout);
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetchWithDeadline(request);
    if (isCacheable(response)) await cache.put(request,response.clone());
    return response;
  } catch {
    const cached = await cache.match(request,{ ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === "navigate") return await cache.match("./index.html") || Response.error();
    throw new Error("Network and cache unavailable");
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request,{ ignoreSearch: true });
  if (cached) return cached;
  const response = await fetchWithDeadline(request,8000);
  if (isCacheable(response)) await cache.put(request,response.clone());
  return response;
}

self.addEventListener("fetch",(event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.pathname.endsWith("/leaderboard")) return;
  if (url.origin === self.location.origin) {
    event.respondWith(request.mode === "navigate" ? networkFirst(request) : cacheFirst(request));
    return;
  }
  if (url.hostname === "pokeapi.co" || url.hostname === "play.pokemonshowdown.com" || url.hostname === "raw.githubusercontent.com" || url.hostname.endsWith("githubusercontent.com")) {
    event.respondWith(cacheFirst(request));
  }
});
