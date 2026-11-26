import { categories, emptyState, icon, options, registerLink, statuses } from './components.js';
import { deleteReport, listReports, updateReport } from '../data/reports-db.js';
import { renderReportCards } from './report-card.js';
import { enhanceSelect } from './select-picker.js';

export function reports() {
  return `
    <div class="page-heading">
      <div><h1>Mis reportes</h1><p>Consulta y filtra tus incidencias registradas.</p></div>
      ${registerLink('Nueva incidencia')}
    </div>
    <section class="card" aria-label="Reportes registrados">
      <fieldset class="filters" disabled>
        <legend class="visually-hidden">Búsqueda y filtros</legend>
        <label>Buscar reportes <span class="search-field">${icon('search')}<input type="search" placeholder="Por título o descripción"></span></label>
        <label>Categoría <select name="categoria"><option value="">Todas las categorías</option>${options(categories)}</select></label>
        <label>Estado <select name="estado"><option value="">Todos los estados</option>${options(statuses)}</select></label>
      </fieldset>
      <p class="filter-note" role="status"></p>
      <div id="report-list"><p class="filter-note">Cargando reportes…</p></div>
    </section>`;
}

export async function bindReports(container, signal) {
  const filters = container.querySelector('fieldset');
  const list = container.querySelector('#report-list');
  const notice = container.querySelector('[role=status]');
  const search = filters.querySelector('input');
  const category = filters.querySelector('[name=categoria]');
  const status = filters.querySelector('[name=estado]');
  enhanceSelect(category, signal);
  enhanceSelect(status, signal);
  let stored = [];
  let disposeCards;
  let mutating = false;
  let loadFailed = false;
  notice.textContent = container.dataset.reportNotice ?? '';
  delete container.dataset.reportNotice;

  function show() {
    disposeCards?.();
    list.replaceChildren();
    const query = search.value.trim().toLocaleLowerCase('es');
    const matching = stored.filter(report =>
      (!category.value || report.categoria === category.value) &&
      (!status.value || report.estado === status.value) &&
      [report.titulo, report.descripcion].some(value => value.toLocaleLowerCase('es').includes(query)));

    if (!matching.length) {
      list.innerHTML = stored.length
        ? emptyState('Sin resultados', 'Ajusta la búsqueda o los filtros.')
        : emptyState('Aún no hay reportes', 'Tus incidencias registradas aparecerán en esta lista.');
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'report-grid';
    list.append(grid);
    disposeCards = renderReportCards(grid, matching, signal, {
      change: (report, estado) => mutate(() => updateReport(report.id, { estado }), 'Estado actualizado.', report.id, { estado }),
      remove: report => {
        if (window.confirm('¿Eliminar esta incidencia? Esta acción es permanente.')) {
          mutate(() => deleteReport(report.id), 'Incidencia eliminada.', report.id);
        }
      },
    });
  }

  async function load() {
    try {
      const results = await listReports();
      if (signal.aborted) return;
      stored = results;
      loadFailed = false;
      filters.disabled = false;
      show();
    } catch {
      if (signal.aborted) return;
      loadFailed = true;
      filters.disabled = true;
      list.replaceChildren();
      notice.textContent = 'No se pudieron consultar los reportes.';
    }
  }

  async function mutate(operation, message, id, fields) {
    if (mutating) return;
    const restoreFocus = list.contains(document.activeElement);
    mutating = filters.disabled = true;
    for (const control of list.querySelectorAll('button, select')) control.disabled = true;
    try {
      await operation();
      if (signal.aborted) return;
      if (fields) {
        stored = stored.map(report => report.id === id ? { ...report, ...fields } : report);
      } else {
        stored = stored.filter(report => report.id !== id);
      }
      notice.textContent = message;
    } catch {
      if (!signal.aborted) notice.textContent = 'No se pudo aplicar el cambio. Inténtalo de nuevo.';
    } finally {
      mutating = false;
      if (!signal.aborted && !loadFailed) {
        filters.disabled = false;
        show();
        if (restoreFocus && document.activeElement === document.body) {
          const card = Array.from(list.querySelectorAll('.report-card')).find(article => article.dataset.reportId === id);
          (card?.querySelector(fields ? '[role=combobox]' : 'button.button') ?? search).focus();
        }
      }
    }
  }

  search.addEventListener('input', show);
  filters.addEventListener('change', event => {
    if (event.target !== search) show();
  });
  await load();
}
