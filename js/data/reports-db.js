let databasePromise;

function openDatabase() {
  databasePromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open('ChismosoAnonimoDB', 1);
    let blocked = false;
    request.onupgradeneeded = () => request.result.createObjectStore('reportes', { keyPath: 'id' });
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      blocked = true;
      reject(new Error('Otra pestaña bloquea la apertura de la base de datos.'));
    };
    request.onsuccess = () => {
      const database = request.result;
      if (blocked) {
        database.close();
        return;
      }
      database.onversionchange = database.onclose = () => {
        database.close();
        databasePromise = undefined;
      };
      resolve(database);
    };
  }).catch(error => {
    databasePromise = undefined;
    throw error;
  });
  return databasePromise;
}

async function transaction(mode, operation) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('reportes', mode);
    tx.onabort = () => reject(tx.error ?? new Error('La operación se canceló.'));
    const request = operation(tx.objectStore('reportes'), tx);
    tx.oncomplete = () => resolve(request.result);
  });
}

export async function listReports() {
  const reports = await transaction('readonly', store => store.getAll());
  return reports.sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
}

export function getReport(id) {
  return transaction('readonly', store => store.get(id));
}

export function createReport(fields) {
  const date = new Date().toISOString();
  const report = { ...fields, id: crypto.randomUUID(), fechaCreacion: date, fechaActualizacion: date };
  return transaction('readwrite', store => store.add(report));
}

export function updateReport(id, fields) {
  return transaction('readwrite', (store, tx) => {
    const request = store.get(id);
    request.onsuccess = () => {
      if (!request.result) {
        tx.abort();
        return;
      }
      store.put({ ...request.result, ...fields, fechaActualizacion: new Date().toISOString() });
    };
    return request;
  });
}

export function deleteReport(id) {
  return transaction('readwrite', store => store.delete(id));
}
