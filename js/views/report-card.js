import { formatLocation } from '../services/geolocation.js';
import { options, statuses } from './components.js';
import { enhanceSelect } from './select-picker.js';

const formatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

export function renderReportCards(list, reports, signal, actions) {
  const urls = [];
  const cardController = new AbortController();
  for (const report of reports) {
    const article = document.createElement('article');
    article.className = 'report-card';
    article.dataset.reportId = report.id;
    article.innerHTML = `
      <h3></h3><p class="report-meta"></p><p class="report-description"></p>
      <time></time><p class="report-location" hidden></p><img hidden loading="lazy" alt="Evidencia fotográfica">
      ${actions ? `<div class="report-actions">
        <label>Estado <select>${options(statuses)}</select></label>
        <a class="button secondary">Editar</a><button class="button secondary" type="button">Eliminar</button>
      </div>` : ''}`;
    article.querySelector('h3').textContent = report.titulo;
    article.querySelector('.report-meta').textContent = `${report.categoria} · Prioridad ${report.prioridad.toLowerCase()} · ${report.estado}`;
    article.querySelector('.report-description').textContent = report.descripcion;
    const time = article.querySelector('time');
    time.dateTime = report.fechaCreacion;
    time.textContent = formatter.format(new Date(report.fechaCreacion));

    if (report.fotografia) {
      const photo = article.querySelector('img');
      const url = URL.createObjectURL(report.fotografia);
      urls.push(url);
      photo.src = url;
      photo.hidden = false;
    }
    if (report.ubicacion) {
      const coordinates = article.querySelector('.report-location');
      coordinates.textContent = 'Ubicación: ' + formatLocation(report.ubicacion);
      coordinates.hidden = false;
    }
    if (actions) {
      const state = article.querySelector('select');
      const edit = article.querySelector('a');
      const remove = article.querySelector('button');
      state.setAttribute('aria-label', 'Estado de ' + report.titulo);
      state.value = report.estado;
      enhanceSelect(state, cardController.signal);
      state.addEventListener('change', () => actions.change(report, state.value));
      edit.href = '#reportes/editar/' + encodeURIComponent(report.id);
      edit.setAttribute('aria-label', 'Editar ' + report.titulo);
      remove.setAttribute('aria-label', 'Eliminar ' + report.titulo);
      remove.addEventListener('click', () => actions.remove(report));
    }
    list.append(article);
  }

  function dispose() {
    cardController.abort();
    signal.removeEventListener('abort', dispose);
    urls.forEach(url => URL.revokeObjectURL(url));
  }
  signal.addEventListener('abort', dispose, { once: true });
  return dispose;
}
