// Clears a service worker left over from another app that ran on this origin.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(self.registration.unregister());
});
