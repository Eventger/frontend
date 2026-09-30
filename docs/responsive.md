# Guía responsive de Eventger

## Objetivo

Eventger conserva en 1440 px la composición definida en Figma y adapta márgenes,
columnas y orden de acciones cuando cambia el espacio disponible. No se fijan
coordenadas globales por resolución: los componentes se limitan mediante anchos
máximos, gutters fluidos, Grid/Flex y alturas mínimas.

## Fundamentos compartidos

Los tokens de layout viven en `src/index.css`:

- `--app-sidebar-width`: ancho del sidebar de escritorio.
- `--app-page-max-width`: límite del contenedor principal.
- `--app-content-max-width`: límite de estados, listas y mensajes.
- `--app-page-gutter`: margen horizontal fluido.
- `--app-page-block-space`: separación vertical fluida.

El sidebar permanente aparece desde `xl` (1280 px). Por debajo de ese punto se
usa navegación móvil para evitar comprimir el contenido en tablets y desktops
estrechos.

## Reglas para componentes

1. Usar `w-full` junto con `max-w-*`; no fijar anchos globales por viewport.
2. Preferir `min-h-*` a `h-*` cuando el componente contenga texto dinámico.
3. Usar Grid/Flex para título, descripción y acciones. Reservar `absolute` para
   decoración u overlays que no participen del flujo.
4. Permitir que botones se apilen antes de que sus etiquetas se corten.
5. Aplicar `min-w-0`, `break-words` o wrapping en hijos de layouts flexibles.
6. No ocultar acciones exclusivamente mediante hover. En dispositivos sin hover
   deben permanecer visibles y sus objetivos táctiles deben medir al menos 44 px.
7. Los diálogos deben usar un ancho máximo, `max-height` relativo a `svh` y scroll
   interno cuando el contenido crezca.
8. Mantener visibles los indicadores de foco y respetar `prefers-reduced-motion`.

## Matriz automática

`npm run test:responsive` levanta una entrada de Vite exclusiva para pruebas,
abre Chrome con Playwright y revisa nueve composiciones en:

| Nombre | Viewport |
| --- | --- |
| mobile | 390 × 844 |
| tablet | 768 × 1024 |
| desktop-compact | 1024 × 768 |
| laptop | 1366 × 768 |
| reference | 1440 × 900 |
| wide | 1920 × 1080 |

La prueba falla si una composición genera overflow horizontal y conserva una
captura por escenario dentro de `reports/responsive-artifacts`. Los viewports de
1024 y 768 CSS px también cubren el reflow aproximado producido por zoom de
125–200% en monitores de mayor resolución.

La fixture está aislada en `tests/visual`: no añade rutas ni datos falsos a la
aplicación de producción. Si Chrome no está instalado, debe instalarse antes de
ejecutar la matriz (`npx playwright install chrome`).

## Revisión manual antes de publicar

- Revisar nombres de evento y tarea más largos que los datos habituales.
- Probar los formularios con todos los errores visibles simultáneamente.
- Abrir los diálogos en viewports bajos y confirmar su scroll interno.
- Recorrer navegación, tarjetas y modales usando únicamente teclado.
- Comprobar 1440 px contra Figma después de cambiar contenedores o gutters.
- Ejecutar `npm run test:responsive` y `npm run validate`.
