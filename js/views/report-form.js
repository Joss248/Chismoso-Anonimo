import { categories, icon, options, statuses } from './components.js';

export function reportForm() {
  return `
    <div class="page-heading"><div><h1>Registrar incidencia</h1><p>Describe lo que ocurrió y clasifica la incidencia.</p></div></div>
    <form class="card report-form">
      <h2>Datos de la incidencia</h2>
      <label>Título <input name="titulo" required minlength="3" maxlength="100" placeholder="Ej. Luminaria apagada"></label>
      <label>Descripción <textarea name="descripcion" required minlength="5" maxlength="1000" rows="4" placeholder="Describe lo que observaste"></textarea></label>
      <div class="form-grid">
        <label>Categoría <select name="categoria" required><option value="">Selecciona una categoría</option>${options(categories)}</select></label>
        <label>Prioridad <select name="prioridad" required><option value="">Selecciona una prioridad</option>${options(['Baja', 'Media', 'Alta'])}</select></label>
        <label>Estado <select name="estado">${options(statuses)}</select></label>
      </div>
      <div class="media-grid">
        <section class="media-panel"><h2>${icon('camera')} Evidencia fotográfica</h2>
          <p>Captura fotográfica pendiente de implementación.</p>
          <button type="button" class="button secondary" disabled>Abrir cámara</button>
        </section>
        <section class="media-panel"><h2>${icon('pin')} Ubicación geográfica</h2>
          <p>Obtención de coordenadas pendiente de implementación.</p>
          <button type="button" class="button secondary" disabled>Obtener ubicación</button>
        </section>
      </div>
      <p class="form-note">El guardado de reportes se incorporará en una etapa posterior.</p>
      <div class="form-actions"><a class="button secondary" href="#inicio">Cancelar</a><button class="button primary" type="submit">Guardar</button></div>
      <p class="feedback" role="status"></p>
    </form>`;
}

export function bindReportForm(container) {
  const form = container.querySelector('form');
  const feedback = form.querySelector('.feedback');

  function validateText(field) {
    const valid = field.value.trim().length >= field.minLength;
    field.setCustomValidity(valid ? '' : `Escribe al menos ${field.minLength} caracteres sin contar espacios al inicio ni al final.`);
  }

  form.addEventListener('input', event => {
    feedback.textContent = '';
    if (event.target.matches('[minlength]')) validateText(event.target);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    for (const field of form.querySelectorAll('[minlength]')) validateText(field);
    if (form.reportValidity()) {
      feedback.textContent = 'El guardado aún no está disponible. Los datos siguen en el formulario.';
    }
  });
}
