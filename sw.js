const CACHE_NAME = "pokemon-learning-adventure-v1.0.3";
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
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))));
  self.skipWaiting();
});

self.addEventListener("activate",(event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request,response.clone());
    return response;
  } catch {
    const cached = await cache.match(request,{ ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === "navigate") return cache.match("./index.html");
    throw new Error("Network and cache unavailable");
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request,{ ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request,response.clone());
  return response;
}

self.addEventListener("fetch",(event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.pathname.endsWith("/leaderboard")) return;
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
    return;
  }
  if (url.hostname === "pokeapi.co" || url.hostname === "raw.githubusercontent.com" || url.hostname.endsWith("githubusercontent.com")) {
    event.respondWith(cacheFirst(request));
  }
});
