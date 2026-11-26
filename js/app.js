import { startRouter } from './router.js';
import { icon } from './views/components.js';

const main = document.querySelector('main');
const connection = document.querySelector('#connection');

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
