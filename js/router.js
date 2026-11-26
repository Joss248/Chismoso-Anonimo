import { bindDashboard, dashboard } from './views/dashboard.js';
import { bindReportForm, reportForm } from './views/report-form.js';
import { bindReports, reports } from './views/reports.js';

const routes = new Map([
  ['#inicio', { title: 'Inicio', render: dashboard, bind: bindDashboard }],
  ['#registrar', { title: 'Registrar incidencia', render: reportForm, bind: bindReportForm }],
  ['#reportes', { title: 'Mis reportes', render: reports, bind: bindReports }],
]);

export function startRouter(main, navigation) {
  let controller;
  function render({ moveFocus = false } = {}) {
    const edit = /^#reportes\/editar\/([a-f0-9-]{36})$/i.exec(location.hash);
    const hash = edit ? '#registrar' : routes.has(location.hash) ? location.hash : '#inicio';
    if (!edit && hash !== location.hash) history.replaceState(null, '', hash);
    const route = routes.get(hash);

    controller?.abort();
    controller = new AbortController();
    main.innerHTML = route.render(edit?.[1]);
    route.bind(main, controller.signal, edit?.[1]);
    document.title = `${edit ? 'Editar incidencia' : route.title} · Chismoso Anónimo`;
    for (const link of navigation.querySelectorAll('a')) {
      if (link.hash === hash) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }

    if (moveFocus) {
      window.scrollTo(0, 0);
      const heading = main.querySelector('h1');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }

  window.addEventListener('hashchange', () => render({ moveFocus: true }));
  render();
}
