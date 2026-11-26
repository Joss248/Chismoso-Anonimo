import { startRouter } from './router.js';
import { icon } from './views/components.js';
import { setupInstallation } from './services/install-app.js';
import { registerServiceWorker } from './services/register-worker.js';

const main = document.querySelector('main');
const connection = document.querySelector('#connection');
setupInstallation();
registerServiceWorker();

for (const element of document.querySelectorAll('[data-icon]')) {
  element.innerHTML = icon(element.dataset.icon);
}

function updateConnection() {
  connection.textContent = navigator.onLine ? 'En línea' : 'Sin conexión';
  connection.classList.toggle('offline', !navigator.onLine);
}

window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
updateConnection();

document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});

startRouter(main, document.querySelector('.navigation'));
