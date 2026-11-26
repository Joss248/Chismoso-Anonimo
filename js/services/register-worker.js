export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register(new URL('../../sw.js', import.meta.url), {
    updateViaCache: 'none',
  }).catch(error => {
    console.warn('No se pudo registrar el Service Worker de Chismoso Anónimo.', error);
  });
}
