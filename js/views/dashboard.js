import { emptyState, icon, registerLink } from './components.js';

const statistics = [
  ['reports', 'Total de reportes', 'blue'],
  ['clock', 'Pendientes', 'amber'],
  ['progress', 'En proceso', 'sky'],
  ['check', 'Resueltos', 'green'],
];

export function dashboard() {
  return `
    <div class="page-heading">
      <div><h1>Panel de incidencias</h1><p>Consulta el estado de los reportes de tu entorno.</p></div>
      ${registerLink('Registrar incidencia')}
    </div>
    <dl class="stats" aria-label="Estadísticas de incidencias">
      ${statistics.map(([symbol, label, tone]) => `
        <div class="card stat">
          <span class="tile ${tone}">${icon(symbol)}</span>
          <dt>${label}</dt><dd>0</dd>
        </div>`).join('')}
    </dl>
    <section class="card" aria-labelledby="recent-title">
      <div class="card-heading"><h2 id="recent-title">Reportes recientes</h2>
        <a class="text-link" href="#reportes">Ver todos ${icon('arrow')}</a>
      </div>
      ${emptyState('Aún no hay reportes', 'Las incidencias registradas aparecerán aquí.')}
    </section>`;
}
