export const categories = ['Infraestructura', 'Alumbrado', 'Limpieza', 'Agua', 'Seguridad', 'Otros'];
export const statuses = ['Pendiente', 'En proceso', 'Resuelto'];

export function icon(name) {
  return `<svg class="icon" aria-hidden="true" focusable="false"><use href="./assets/icons/ui.svg#${name}"></use></svg>`;
}

export function options(labels) {
  return labels.map(label => `<option>${label}</option>`).join('');
}

export function registerLink(label) {
  return `<a class="button primary" href="#registrar">${icon('plus')}${label}</a>`;
}

export function emptyState(title, description) {
  return `<div class="empty"><span class="tile">${icon('inbox')}</span><p><strong>${title}</strong></p><p>${description}</p></div>`;
}
