export async function openCamera() {
  if (!isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('La cámara requiere HTTPS o localhost y un navegador compatible.');
  }
  try {
    return await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
  } catch (error) {
    const messages = {
      NotAllowedError: 'Se denegó el permiso de cámara.',
      NotFoundError: 'No se encontró una cámara.',
      NotReadableError: 'La cámara no está disponible o está en uso.',
    };
    throw new Error(messages[error.name] ?? 'No se pudo iniciar la cámara.');
  }
}

export function stopCamera(stream) {
  stream?.getTracks().forEach(track => track.stop());
}

export function capturePhoto(video) {
  if (!video.videoWidth || !video.videoHeight) {
    return Promise.reject(new Error('Espera a que aparezca la vista previa.'));
  }
  const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('No se pudo generar la fotografía.'));
    }, 'image/jpeg', 0.78);
  });
}
