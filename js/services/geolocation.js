export function getLocation() {
  if (!isSecureContext || !navigator.geolocation) {
    return Promise.reject(new Error('La ubicación requiere HTTPS o localhost y un navegador compatible.'));
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(({ coords }) => resolve({
      latitud: coords.latitude,
      longitud: coords.longitude,
      precision: coords.accuracy,
    }), error => {
      const messages = {
        1: 'Se denegó el permiso de ubicación.',
        2: 'No se pudo determinar la ubicación.',
        3: 'Se agotó el tiempo para obtener la ubicación.',
      };
      reject(new Error(messages[error.code] ?? 'No se pudo obtener la ubicación.'));
    }, { enableHighAccuracy: true, timeout: 12000 });
  });
}

export function formatLocation(location) {
  return `${location.latitud.toFixed(5)}, ${location.longitud.toFixed(5)} (±${Math.round(location.precision)} m)`;
}
