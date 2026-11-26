import { emptyState, icon, registerLink } from './components.js';
import { listReports } from '../data/reports-db.js';
import { renderReportCards } from './report-card.js';

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
          <dt>${label}</dt><dd>—</dd>
        </div>`).join('')}
    </dl>
    <section class="card" aria-labelledby="recent-title">
      <div class="card-heading"><h2 id="recent-title">Reportes recientes</h2>
        <a class="text-link" href="#reportes">Ver todos ${icon('arrow')}</a>
      </div>
      <div id="recent-reports"><p class="filter-note" role="status">Cargando reportes…</p></div>
    </section>`;
}

export async function bindDashboard(container, signal) {
  const counters = container.querySelectorAll('dd');
  const recent = container.querySelector('#recent-reports');
  try {
    const reports = await listReports();
    if (signal.aborted) return;
    const totals = [reports.length, ...['Pendiente', 'En proceso', 'Resuelto'].map(
      state => reports.filter(report => report.estado === state).length)];
    counters.forEach((counter, index) => { counter.textContent = totals[index]; });
    if (!reports.length) {
      recent.innerHTML = emptyState('Aún no hay reportes', 'Las incidencias registradas aparecerán aquí.');
      return;
    }
    recent.replaceChildren();
    recent.className = 'report-grid';
    renderReportCards(recent, reports.slice(0, 3), signal);
  } catch {
    if (!signal.aborted) recent.querySelector('p[role=status]')?.replaceChildren('No se pudieron consultar los reportes.');
  }
}
