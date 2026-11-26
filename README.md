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

El árbol incluye archivos actuales y previstos. La ubicación del Service Worker en la raíz permitirá que cubra toda la aplicación.

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
    ├── router.js                Navegación por hash y renderizado de vistas
    ├── data/
    │   └── reports-db.js         Persistencia de reportes en IndexedDB
    ├── services/
    │   ├── camera.js             Captura fotográfica
    │   └── geolocation.js        Obtención de coordenadas
    └── views/
        ├── components.js         Iconos y elementos compartidos
        ├── dashboard.js          Panel de estadísticas
        ├── reports.js            Búsqueda, filtros y gestión de reportes
        ├── report-card.js        Tarjetas de incidencias
        ├── report-evidence.js    Controles de fotografía y ubicación
        └── report-form.js        Registro y edición de incidencias
```

Los iconos de la interfaz están en `assets/icons/ui.svg`.

## Ejecutar con Live Server

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Con la extensión Live Server disponible, haz clic derecho sobre `index.html` y selecciona **Open with Live Server**.
3. Usa la dirección local que abra el navegador. Puedes acceder directamente a `#inicio`, `#registrar` y `#reportes`.

Sirve el proyecto por HTTP local para que el navegador pueda cargar los módulos JavaScript.

## Verificación local

1. Registra una incidencia y recarga **Mis reportes** usando la misma dirección y el mismo puerto. Comprueba que conserve los datos y que **Inicio** actualice los totales.
2. Busca por título o descripción, combina los filtros, cambia el estado y edita la incidencia. Prueba cancelar y luego confirmar su eliminación.
3. Desde `localhost` o HTTPS, permite y deniega la cámara y la ubicación. Comprueba que puedes guardar sin evidencia. Con la cámara abierta, abandona el formulario y verifica que se apague el indicador de uso del navegador.
4. Comprueba los controles de selección a 320, 375, 390, 768 y 1280 px. Abre un selector con Enter o Espacio, recorre las opciones con las flechas y confirma con Enter. Comprueba que Escape y un toque fuera cierren el menú, y que Tab continúe al siguiente control. Prueba también en un teléfono.

Chrome puede recordar los permisos del origen, que incluye el protocolo, el host y el puerto. Para volver a probar el aviso, restablece los permisos de cámara y ubicación desde la configuración del sitio. Al abrir el formulario, ambas funciones deben permanecer inactivas hasta que pulses su botón.

La base local `ChismosoAnonimoDB` (versión 1) guarda las incidencias en el almacén `reportes` por UUID. Cada registro incluye título, descripción, categoría, prioridad, estado y fechas de creación y actualización en formato ISO. La fotografía se guarda como Blob JPEG y la ubicación como latitud, longitud y precisión en metros. Ambos campos admiten `null`.
