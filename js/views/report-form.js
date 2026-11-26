import { categories, icon, options, statuses } from './components.js';
import { createReport, getReport, updateReport } from '../data/reports-db.js';
import { bindEvidence } from './report-evidence.js';
import { enhanceSelect } from './select-picker.js';

export function reportForm(id) {
  return `
    <div class="page-heading"><div><h1>${id ? 'Editar incidencia' : 'Registrar incidencia'}</h1><p>Describe lo que ocurrió y clasifica la incidencia.</p></div></div>
    <form class="card report-form">
      <fieldset class="form-fields" ${id ? 'disabled' : ''}>
      <legend class="visually-hidden">Datos y evidencia</legend>
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
          <video autoplay muted playsinline hidden aria-label="Vista previa de la cámara"></video>
          <img alt="Fotografía de la incidencia" hidden>
          <div class="media-actions">
            <button type="button" class="button secondary" data-camera>Abrir cámara</button>
            <button type="button" class="button secondary" data-capture hidden>Capturar foto</button>
            <button type="button" class="button secondary" data-close-camera hidden>Cerrar cámara</button>
            <button type="button" class="button secondary" data-remove-photo hidden>Quitar fotografía</button>
          </div>
          <p data-camera-status role="status"></p>
        </section>
        <section class="media-panel"><h2>${icon('pin')} Ubicación geográfica</h2>
          <p data-coordinates>Sin ubicación adjunta.</p>
          <div class="media-actions">
            <button type="button" class="button secondary" data-locate>Obtener ubicación</button>
            <button type="button" class="button secondary" data-remove-location hidden>Quitar ubicación</button>
          </div>
          <p data-location-status role="status"></p>
        </section>
      </div>
      <p class="form-note">La fotografía y la ubicación son opcionales.</p>
      </fieldset>
      <div class="form-actions"><a class="button secondary" href="${id ? '#reportes' : '#inicio'}">Cancelar</a><button class="button primary" type="submit" ${id ? 'disabled' : ''}>Guardar</button></div>
      <p class="feedback" role="status"></p>
    </form>`;
}

export async function bindReportForm(container, signal, id) {
  const form = container.querySelector('form');
  const feedback = form.querySelector('.feedback');
  const fields = form.querySelector('fieldset');
  const save = form.querySelector('[type=submit]');
  const media = bindEvidence(form, signal);
  const refreshPickers = Array.from(form.querySelectorAll('select'), select => enhanceSelect(select, signal));
  let saving = false;

  function validateText(field) {
    const valid = field.value.trim().length >= field.minLength;
    field.setCustomValidity(valid ? '' : `Escribe al menos ${field.minLength} caracteres sin contar espacios al inicio ni al final.`);
  }

  form.addEventListener('input', event => {
    feedback.textContent = '';
    if (event.target.matches('[minlength]')) validateText(event.target);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (saving || fields.disabled) return;
    if (media.pending()) {
      feedback.textContent = 'Espera a que termine la operación de cámara o ubicación.';
      return;
    }
    for (const field of form.querySelectorAll('[minlength]')) validateText(field);
    if (!form.reportValidity()) return;

    const values = Object.fromEntries(new FormData(form));
    values.titulo = values.titulo.trim();
    values.descripcion = values.descripcion.trim();
    media.closeCamera();
    saving = fields.disabled = save.disabled = true;
    feedback.textContent = 'Guardando incidencia…';
    try {
      const data = { ...values, ...media.evidence };
      if (id) await updateReport(id, data);
      else await createReport(data);
      if (!signal.aborted) {
        container.dataset.reportNotice = id ? 'Incidencia actualizada.' : 'Incidencia guardada.';
        location.hash = '#reportes';
      }
    } catch {
      if (!signal.aborted) {
        feedback.textContent = 'No se pudo guardar la incidencia. Revisa los datos o inténtalo de nuevo.';
        saving = fields.disabled = save.disabled = false;
      }
    }
  });

  if (!id) return;
  feedback.textContent = 'Cargando incidencia…';
  try {
    const report = await getReport(id);
    if (signal.aborted) return;
    if (!report) {
      feedback.textContent = 'La incidencia ya no está disponible.';
      return;
    }
    for (const name of ['titulo', 'descripcion', 'categoria', 'prioridad', 'estado']) {
      form.elements.namedItem(name).value = report[name];
    }
    refreshPickers.forEach(refresh => refresh());
    media.setPhoto(report.fotografia);
    media.setLocation(report.ubicacion);
    feedback.textContent = '';
    fields.disabled = save.disabled = false;
  } catch {
    if (!signal.aborted) feedback.textContent = 'No se pudo cargar la incidencia.';
  }
}
