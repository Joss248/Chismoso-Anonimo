import { capturePhoto, openCamera, stopCamera } from '../services/camera.js';
import { formatLocation, getLocation } from '../services/geolocation.js';

export function bindEvidence(form, signal) {
  const video = form.querySelector('video');
  const photo = form.querySelector('img');
  const camera = form.querySelector('[data-camera]');
  const capture = form.querySelector('[data-capture]');
  const close = form.querySelector('[data-close-camera]');
  const removePhoto = form.querySelector('[data-remove-photo]');
  const locate = form.querySelector('[data-locate]');
  const removeLocation = form.querySelector('[data-remove-location]');
  const cameraStatus = form.querySelector('[data-camera-status]');
  const locationStatus = form.querySelector('[data-location-status]');
  const coordinates = form.querySelector('[data-coordinates]');
  const evidence = { fotografia: null, ubicacion: null };
  let stream;
  let photoUrl;
  let opening = false;

  function closeCamera() {
    stopCamera(stream);
    stream = undefined;
    video.srcObject = null;
    video.hidden = capture.hidden = close.hidden = true;
    camera.disabled = false;
  }

  function setPhoto(blob) {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    evidence.fotografia = blob;
    photoUrl = blob ? URL.createObjectURL(blob) : undefined;
    if (photoUrl) photo.src = photoUrl;
    else photo.removeAttribute('src');
    photo.hidden = removePhoto.hidden = !blob;
    camera.textContent = blob ? 'Repetir captura' : 'Abrir cámara';
  }

  function setLocation(location) {
    evidence.ubicacion = location;
    coordinates.textContent = location ? formatLocation(location) : 'Sin ubicación adjunta.';
    removeLocation.hidden = !location;
    locate.textContent = location ? 'Actualizar ubicación' : 'Obtener ubicación';
  }

  camera.addEventListener('click', async () => {
    opening = camera.disabled = true;
    cameraStatus.textContent = 'Abriendo cámara… Si el navegador solicita permiso, elige si deseas concederlo.';
    try {
      const opened = await openCamera();
      if (signal.aborted) {
        stopCamera(opened);
        return;
      }
      stream = opened;
      video.srcObject = stream;
      video.hidden = capture.hidden = close.hidden = false;
      cameraStatus.textContent = 'Cámara activa.';
    } catch (error) {
      if (!signal.aborted) {
        closeCamera();
        cameraStatus.textContent = error.message;
      }
    } finally {
      opening = false;
    }
  });

  close.addEventListener('click', () => {
    closeCamera();
    cameraStatus.textContent = 'Cámara cerrada.';
    camera.focus();
  });

  capture.addEventListener('click', async () => {
    capture.disabled = close.disabled = true;
    try {
      const blob = await capturePhoto(video);
      if (!signal.aborted) {
        setPhoto(blob);
        closeCamera();
        cameraStatus.textContent = 'Fotografía lista para guardar.';
      }
    } catch (error) {
      if (!signal.aborted) cameraStatus.textContent = error.message;
    } finally {
      capture.disabled = close.disabled = false;
    }
  });

  removePhoto.addEventListener('click', () => {
    setPhoto(null);
    cameraStatus.textContent = 'Fotografía eliminada del formulario.';
  });

  locate.addEventListener('click', async () => {
    locate.disabled = true;
    locationStatus.textContent = 'Obteniendo ubicación… Si el navegador solicita permiso, elige si deseas concederlo.';
    try {
      const location = await getLocation();
      if (!signal.aborted) {
        setLocation(location);
        locationStatus.textContent = '';
      }
    } catch (error) {
      if (!signal.aborted) locationStatus.textContent = error.message;
    } finally {
      locate.disabled = false;
    }
  });

  removeLocation.addEventListener('click', () => {
    setLocation(null);
    locationStatus.textContent = 'Ubicación eliminada del formulario.';
  });

  signal.addEventListener('abort', () => {
    closeCamera();
    if (photoUrl) URL.revokeObjectURL(photoUrl);
  }, { once: true });

  return { evidence, setPhoto, setLocation, closeCamera, pending: () => opening || locate.disabled || capture.disabled };
}
