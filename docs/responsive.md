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

Los mensajes de error, éxito y confirmación conservan el icono, título,
descripción y grupo de acciones centrados en móvil, tableta y escritorio,
siguiendo la referencia de `Estados UX en _hoy.pdf`.

Eventos descarga y presenta como máximo 6 tarjetas por página, con dos columnas
desde `lg` y una por debajo. La paginación conserva el contenedor y encabezado
compartidos. Si solo hay una página, el pie muestra únicamente el número de
eventos, sin divisor ni controles deshabilitados. Con varias páginas, muestra el
rango y agrupa las flechas con el indicador de página; en móvil las flechas usan
botones de 44 px con nombres accesibles y en escritorio incluyen sus etiquetas.
La URL guarda `page`, cada avance vuelve al inicio y el historial conserva
la página anterior. Durante la carga se muestran seis esqueletos, sin presentar
las tarjetas de la página anterior ni un estado vacío. Un fallo permite
reintentar la misma página. Las páginas fuera de rango utilizan los metadatos
normalizados del backend para permitir regresar a la página anterior.

Los filtros de Eventos y Hoy reutilizan `FilterSelect`, basado en el componente
Select de Radix que usan los formularios. El menú conserva el ancho del control,
se abre debajo cuando hay espacio y se adapta al borde de la ventana; usa las
mismas esquinas, tipografía y selección violeta, sin depender del menú nativo
del sistema operativo. Las opciones mantienen al menos 44 px de alto y permiten
teclado, cierre con Escape y scroll interno para listas largas. Los filtros de
Hoy distribuyen el ancho disponible sin desbordar en escritorio estrecho.

El filtro «Tipo de evento» muestra «Todos los tipos» y las opciones de
`/event-types/`. Sus controles
mantienen 44 px de alto sin desplazar el encabezado. La URL añade `type` y conserva
el filtro al paginar y al volver por el historial. Cambiar o limpiar el tipo
reinicia la página; el backend filtra antes de calcular el total y seleccionar
los seis resultados. Un tipo sin coincidencias muestra «No hay eventos de este
tipo» y permite ver todos los eventos. Un fallo del catálogo mantiene la lista
y permite reintentar los tipos. Las respuestas anteriores se ignoran tanto al
cambiar de página como de tipo, incluso si el número de página es el mismo.

La miga de pan se configura con `breadcrumbs` en `PageContainer` y se presenta
sobre el encabezado mediante `PageBreadcrumbs`. Los niveles anteriores usan
enlaces de React Router; el último identifica la vista actual con `aria-current`.
La cadena mantiene una fila de 44 px para que el encabezado no cambie de
posición al añadir niveles o recibir el nombre del evento. En móvil, los
ancestros posteriores a Hoy y Eventos se presentan como «…»; conservan su enlace,
nombre accesible y `title`. El nivel actual y los nombres largos se acortan
visualmente. Los enlaces mantienen 44 px de alto y foco visible. Los estados de
edición y feedback actualizan la cadena sin enlazar a un evento ya eliminado.

`PageTitle` comparte tamaño, altura de línea de 36 px y tracking entre listas,
detalle, formularios y confirmaciones. Todos los encabezados usan el espaciado
de `PageContainer`; los formularios sitúan `PageHeader` antes de su superficie
blanca, sin modificar el padding del contenedor según el estado. Los esqueletos
del detalle reservan también las acciones en móvil. Al cambiar entre formulario,
error, éxito y detalle, `usePageFlowNavigation` restablece el scroll y enfoca el
encabezado (o el contenido principal durante la carga). No actúa al montar una
ruta ni al editar campos, conservando la restauración del historial.
`AppLayout` completa esa restauración al volver por el historial después de
cargar los datos, para que el navegador no recorte la posición al tamaño de un
esqueleto. Una interacción de scroll del usuario cancela la restauración pendiente.

Las filas de «Tareas agregadas» al editar utilizan las mismas columnas de Grid
para nombre, fecha, horas y acciones desde `md`. El espacio de Reprogramar se
conserva en las tareas completadas con el indicador «Completada», evitando el
desplazamiento de 138 px que ocurría al retirar el botón. En móvil se muestran
nombre, datos y acciones en filas separadas, con nombres que pueden ajustarse
en varias líneas y botones de 44 px. La reprogramación sigue disponible para
tareas pendientes o en progreso; editar y eliminar conservan sus acciones.

La revisión del 3 de octubre de 2026 detectó desplazamientos de título de 24 px
al crear y 68 px al editar en 390 px (112 px con nombre largo), migas 24 px más
altas en formularios de escritorio y 220 px de scroll heredado por la confirmación
en 320 × 568. Tras el ajuste, los títulos comienzan a 104 px en 1440 × 900 y
144 px en móvil con la navegación superior; las migas mantienen su fila y los
cambios internos muestran el encabezado desde el inicio. Las pruebas recorren
las páginas reales con Clerk y HTTP sustituidos en cinco tamaños y con nombres
cortos y largos, incluidos los errores y reintentos de creación y edición.

«Ver tarea» usa la transición de ruta compartida entre Hoy y el detalle del
evento. La carga se mantiene hasta recibir las tareas del evento actual, sin
mostrar un estado vacío intermedio. El detalle no superpone una animación de
entrada a la transición de ruta; las vistas de edición y feedback conservan
sus animaciones. Las pruebas de navegador cubren red lenta, scroll desde una
lista larga, móvil, movimiento reducido y la ausencia de View Transitions.

## Matriz automática

`npm run test:responsive` levanta una entrada de Vite exclusiva para pruebas,
abre Chrome con Playwright y revisa las composiciones de autenticación, eventos,
Hoy, diálogos y las nuevas vistas de configuración y seguridad en:

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
