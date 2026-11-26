import { categories, emptyState, icon, options, registerLink, statuses } from './components.js';

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
        <label>Categoría <select><option>Todas las categorías</option>${options(categories)}</select></label>
        <label>Estado <select><option>Todos los estados</option>${options(statuses)}</select></label>
      </fieldset>
      <p class="filter-note">La búsqueda y los filtros estarán disponibles cuando se incorpore el registro de reportes.</p>
      <div id="report-list">
        ${emptyState('Aún no hay reportes', 'Tus incidencias registradas aparecerán en esta lista.')}
      </div>
    </section>`;
}
