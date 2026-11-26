# Chismoso Anónimo

**Observa, registra y reporta.**

Chismoso Anónimo es un proyecto académico para desarrollar una aplicación web progresiva (PWA) que permita registrar y administrar incidencias del entorno, incluso sin conexión a Internet.

## Objetivo

Registrar cada incidencia con título, descripción, categoría, prioridad, evidencia fotográfica y coordenadas geográficas. La aplicación incluirá un panel de estadísticas y permitirá consultar, editar y eliminar reportes, así como gestionar sus estados: pendiente, en proceso y resuelto.

Los reportes se guardarán en el navegador y no se enviarán a terceros. La aplicación se podrá instalar y funcionará sin backend, autenticación ni base de datos remota.

## Tecnologías previstas

- **HTML5, CSS3 y JavaScript vanilla** para una App Shell responsiva con renderizado del lado del cliente (CSR).
- **IndexedDB** para persistencia local asíncrona.
- **Service Worker** para la caché estática y dinámica, y **Web App Manifest** con iconos PNG de 192 × 192 y 512 × 512 píxeles para la instalación.
- **MediaDevices API** para capturar fotografías y **Geolocation API** para obtener coordenadas.
- **Git y GitHub** para el control de versiones y **Vercel** para la publicación por HTTPS.

## Estructura propuesta

Los siguientes archivos y directorios de la aplicación se crearán en las etapas autorizadas. La ubicación del Service Worker en la raíz permitirá que cubra toda la aplicación.

```text
Chismoso-Anonimo/
├── AGENTS.md
├── .gitignore
├── README.md
├── index.html                   App Shell
├── manifest.webmanifest         Metadatos de instalación
├── sw.js                        Caché estática y dinámica
├── assets/
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── css/
│   └── styles.css               Estilos y diseño responsivo
└── js/
    ├── app.js                   Inicio y navegación
    ├── data/
    │   └── reports-db.js         Persistencia de reportes en IndexedDB
    ├── services/
    │   ├── camera.js             Captura fotográfica
    │   └── geolocation.js        Obtención de coordenadas
    └── views/
        ├── dashboard.js          Panel de estadísticas
        ├── reports.js            Consulta y eliminación de reportes
        └── report-form.js        Registro y edición de incidencias
```
