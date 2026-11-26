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

## Estructura

El Service Worker está en la raíz para cubrir el directorio de la aplicación.

```text
Chismoso-Anonimo/
├── AGENTS.md
├── .gitignore
├── README.md
├── index.html                   App Shell
├── manifest.json                Metadatos de instalación
├── sw.js                        Caché estática y dinámica
├── assets/
│   └── icons/
│       ├── icon-192.png e icon-512.png
│       ├── maskable-192.png y maskable-512.png
│       ├── apple-touch-icon.png
│       └── ui.svg
├── css/
│   └── styles.css               Estilos y diseño responsivo
└── js/
    ├── app.js                   Inicio y navegación
    ├── router.js                Navegación por hash y renderizado de vistas
    ├── data/
    │   └── reports-db.js         Persistencia de reportes en IndexedDB
    ├── services/
    │   ├── camera.js             Captura fotográfica
    │   ├── geolocation.js        Obtención de coordenadas
    │   ├── install-app.js        Diálogo y ayuda de instalación
    │   └── register-worker.js    Registro del Service Worker
    └── views/
        ├── components.js         Iconos y elementos compartidos
        ├── dashboard.js          Panel de estadísticas
        ├── reports.js            Búsqueda, filtros y gestión de reportes
        ├── report-card.js        Tarjetas de incidencias
        ├── report-evidence.js    Controles de fotografía y ubicación
        ├── report-form.js        Registro y edición de incidencias
        └── select-picker.js     Selector accesible reutilizable
```

Los iconos de la interfaz están en `assets/icons/ui.svg`.

## Ejecutar con Live Server

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Con la extensión Live Server disponible, haz clic derecho sobre `index.html` y selecciona **Open with Live Server**.
3. Usa la dirección local que abra el navegador. Puedes acceder directamente a `#inicio`, `#registrar` y `#reportes`.

Usa `localhost` o `127.0.0.1` para Live Server y HTTPS para probar desde otro dispositivo. El manifiesto y el Service Worker usan rutas relativas para funcionar en la raíz o bajo un subdirectorio. Si Live Server inyecta su cliente de recarga, puede aparecer un mensaje de su WebSocket al desconectarte. Para aislar esa extensión durante las pruebas, puedes servir la misma carpeta con `python -m http.server 5500 --bind 127.0.0.1`.

## Instalación

Abre la aplicación en línea. Si el navegador ofrece un diálogo programático, el encabezado muestra **Instalar** y el diálogo solo aparece al pulsarlo. Si aparece **Cómo instalar**, consulta la ayuda para instalar desde el menú del navegador o desde **Compartir** en Safari para iPhone o iPad, cuando el navegador ofrezca esa opción. Si inicias la aplicación instalada en modo independiente, el control queda oculto.

El manifiesto aporta el nombre, los colores y los iconos que las plataformas compatibles usan para generar su pantalla de inicio. La presentación concreta depende del navegador y del sistema.

## Caché y actualizaciones

- **Precarga.** El Service Worker comprueba y guarda el HTML, el CSS, todos los módulos de la aplicación, el manifiesto y los iconos. Si la precarga falla, la instalación del Service Worker se cancela.
- **Navegación HTML (Network-First).** Se intenta la red para la raíz y `index.html`. Si la red falla o el HTML recibido pertenece a otra versión, se usa el HTML precargado. Las rutas por hash siguen gestionadas por JavaScript.
- **Recursos de la App Shell (Cache-First).** Los archivos de la versión activa se sirven de su caché precargada. Si falta un archivo, solo se intenta recuperar de la red cuando el servidor sigue ofreciendo esa versión. Las peticiones GET de recursos adicionales compatibles bajo `assets/` intentan la red y guardan respuestas válidas para futuras visitas offline.
- **Versiones.** Incrementa juntos `VERSION` en `sw.js` y el valor de `app-shell-version` en `index.html` al publicar cualquier cambio en la App Shell o su estrategia de caché. Actualiza la lista `shell` al agregar o quitar archivos y publica el conjunto en una sola versión. El nuevo Service Worker espera a que se cierren las páginas controladas por el anterior y, al activarse, elimina las cachés antiguas del proyecto para ese ámbito. IndexedDB conserva los reportes entre versiones.

## Pruebas de instalación y funcionamiento offline

1. Carga la aplicación en línea y revisa **Application → Service Workers** en Chrome DevTools. Espera a que el Service Worker esté activo y controle la pestaña. En **Cache Storage**, revisa la lista de recursos precargados.
2. Registra una incidencia con fotografía y ubicación si están disponibles. Activa **Offline** en DevTools y recarga usando la recarga normal. Recorre las tres vistas, abre el reporte y comprueba que se vean la evidencia y las coordenadas.
3. Sin conexión, crea un reporte, edítalo, cambia su estado, búscalo, aplica filtros y elimínalo. Comprueba los contadores del panel. La cámara depende del permiso y del dispositivo. La ubicación puede seguir disponible, devolver un error o agotar su tiempo de espera según el dispositivo.
4. Quita **Offline**. Para probar una actualización, incrementa ambas versiones, vuelve a cargar para que el navegador detecte el Service Worker y espera a que termine la precarga. Cierra las pestañas y ventanas de la aplicación y vuelve a abrirla en el mismo origen. Comprueba que aparezca la caché nueva y que sigan disponibles los reportes.
5. En un navegador con interfaz, prueba abrir y cancelar el diálogo de instalación, o sigue **Cómo instalar**. Instala la aplicación, ábrela desde el sistema y comprueba que se muestre en modo independiente. En un dispositivo compatible, revisa el icono y la pantalla de inicio.

## Verificación local

1. Registra una incidencia y recarga **Mis reportes** usando la misma dirección y el mismo puerto. Comprueba que conserve los datos y que **Inicio** actualice los totales.
2. Busca por título o descripción, combina los filtros, cambia el estado y edita la incidencia. Prueba cancelar y luego confirmar su eliminación.
3. Desde `localhost` o HTTPS, permite y deniega la cámara y la ubicación. Comprueba que puedes guardar sin evidencia. Con la cámara abierta, abandona el formulario y verifica que se apague el indicador de uso del navegador.
4. Comprueba los controles de selección a 320, 375, 390, 768 y 1280 px. Abre un selector con Enter o Espacio, recorre las opciones con las flechas y confirma con Enter. Comprueba que Escape y un toque fuera cierren el menú, y que Tab continúe al siguiente control. Prueba también en un teléfono.

Chrome puede recordar los permisos del origen, que incluye el protocolo, el host y el puerto. Para volver a probar el aviso, restablece los permisos de cámara y ubicación desde la configuración del sitio. Al abrir el formulario, ambas funciones deben permanecer inactivas hasta que pulses su botón.

La base local `ChismosoAnonimoDB` (versión 1) guarda las incidencias en el almacén `reportes` por UUID. Cada registro incluye título, descripción, categoría, prioridad, estado y fechas de creación y actualización en formato ISO. La fotografía se guarda como Blob JPEG y la ubicación como latitud, longitud y precisión en metros. Ambos campos admiten `null`.
