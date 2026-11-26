# Chismoso Anónimo

Proyecto académico de una aplicación web progresiva (PWA). Eslogan: «Observa, registra y reporta».

## Objetivo y alcance

Registrar y administrar incidencias del entorno mediante descripciones, fotografías y coordenadas geográficas, con funcionamiento sin conexión a Internet.

- Panel con estadísticas.
- Registro de incidencias con título, descripción, categoría y prioridad.
- Captura de evidencia fotográfica y de ubicación.
- Consulta, edición y eliminación de reportes.
- Estados de los reportes: pendiente, en proceso y resuelto.
- Funcionamiento offline e instalación como PWA.
- Los reportes se guardan localmente y no se envían a terceros. El proyecto no tendrá backend, autenticación ni base de datos remota.

## Requisitos técnicos y visuales

- HTML5, CSS3 y JavaScript vanilla.
- Arquitectura App Shell responsiva y renderizado del lado del cliente (CSR).
- IndexedDB para persistencia local asíncrona.
- Service Worker con estrategias de caché estática y dinámica.
- Web App Manifest con iconos PNG de 192 × 192 y 512 × 512 píxeles.
- MediaDevices API para capturar fotografías y Geolocation API para obtener coordenadas.
- Git y GitHub para el control de versiones. Vercel para la publicación por HTTPS.
- Diseño moderno, limpio y responsivo. Paleta: `#0f172a`, `#2563eb`, `#38bdf8`, `#f1f5f9` y `#ffffff`.

## Reglas de trabajo

- Trabaja por etapas supervisadas. Espera autorización explícita antes de comenzar una etapa posterior.
- Mantén el código organizado, modular y comprensible. Evita instalar dependencias innecesarias.
- Realiza commits, pushes y despliegues únicamente con autorización explícita.
- Al cerrar cada etapa, informa qué archivos creaste o modificaste, qué pruebas ejecutaste, sus resultados reales y las limitaciones.
- La etapa de preparación comprende verificar la carpeta y Git, inicializar el repositorio local en `main` si hace falta, crear `AGENTS.md`, `.gitignore` y `README.md`, proponer la estructura y revisar `git status`. Esta etapa termina con la entrega del resumen para revisión. La interfaz y las funcionalidades quedan para etapas posteriores.
