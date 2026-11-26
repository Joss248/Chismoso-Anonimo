import { dashboard } from './views/dashboard.js';
import { bindReportForm, reportForm } from './views/report-form.js';
import { reports } from './views/reports.js';

const routes = new Map([
  ['#inicio', { title: 'Inicio', render: dashboard }],
  ['#registrar', { title: 'Registrar incidencia', render: reportForm, bind: bindReportForm }],
  ['#reportes', { title: 'Mis reportes', render: reports }],
]);

export function startRouter(main, navigation) {
  function render({ moveFocus = false } = {}) {
    const hash = routes.has(location.hash) ? location.hash : '#inicio';
    if (hash !== location.hash) history.replaceState(null, '', hash);
    const route = routes.get(hash);

    main.innerHTML = route.render();
    route.bind?.(main);
    document.title = `${route.title} · Chismoso Anónimo`;
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
