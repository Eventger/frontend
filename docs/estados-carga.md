# Estados de carga de eventos y tareas

Las vistas reutilizan los mensajes existentes. La ausencia de datos se confirma
con una respuesta exitosa del backend; no se deduce de una petición fallida.

| Respuesta o situación | Estado mostrado |
| --- | --- |
| La consulta sigue pendiente | Indicador de carga |
| `GET /events/` devuelve `success: true` y `data: []` | «Aún no tienes eventos» |
| `GET /hoy/` devuelve `success: true` sin prioridades pendientes | «No tienes gestiones pendientes para hoy» |
| El evento existe y sus subtareas están vacías | «Aún no tienes tareas para este evento» |
| `GET /events/:id/` devuelve HTTP 404 | «Evento no encontrado» |
| HTTP de error, fallo de red, `success: false` o respuesta inválida | Error de carga correspondiente y acción de reintento |

Un HTTP 404 en una consulta de **lista** conserva el error de carga: el contrato
del backend devuelve HTTP 200 con una lista vacía cuando no hay registros.
Los fallos de autenticación tampoco confirman que una cuenta no tenga datos.

## Correcciones y regresiones

- Eventos acepta también el contrato anterior: `success: true` y `data` como
  lista, sin `pagination`. La ausencia de esos metadatos no convierte una lista
  vacía válida en un error. Para esa respuesta completa, el frontend aplica el
  filtro antes de contar y presentar páginas de seis eventos; si la API incluye
  paginación, conserva sus resultados y totales.
- Hoy usa `/hoy/`, la ruta canónica del backend, y comprueba `success` antes de
  interpretar sus grupos. Si todos están vacíos, no necesita consultar eventos
  para completar los nombres de tareas.
- Las cargas de Hoy, eventos, detalle y subtareas ignoran respuestas de
  solicitudes anteriores después de un reintento, cambio de recurso o desmontaje.
  Un error antiguo no reemplaza una respuesta vacía o datos más recientes.
- El detalle consulta subtareas después de confirmar que el evento existe.
  Un HTTP 404 del evento activa su mensaje específico y no queda oculto por
  errores anteriores de subtareas.
- Al dejar de consultar un evento, los hooks de detalle y subtareas limpian el
  error anterior.

`tests/features/loadStates.integration.test.tsx` verifica las vistas con los
hooks y servicios reales, Clerk sustituido y respuestas HTTP sintéticas. Cubre
cuentas vacías y con datos, reintentos, HTTP 401/403/404/500/503, fallos de red,
`success: false` y eventos inexistentes. Las pruebas de hooks cubren respuestas
que llegan fuera de orden.

Estas pruebas no comprueban una sesión real ni la persistencia en producción.
Si el problema continúa en la página publicada, se necesita observar el estado
HTTP de la petición autenticada para distinguir un fallo de sesión, API o red.
