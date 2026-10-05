# Auditoría de experiencia de usuario de Eventger

Fecha: 4 de octubre de 2026. Revisión del frontend local con React, Clerk
sustituido en pruebas y respuestas HTTP controladas. Se analizaron autenticación,
recuperación, registro, creación y edición de eventos/tareas, navegación,
configuración y estados de carga/error. Se corrigieron fallos de mensajes, foco
y conservación de tareas sin cambiar los tokens ni rediseñar las pantallas.

## Fallos corregidos

| Prioridad | Reproducción e impacto anterior | Comportamiento corregido y evidencia |
| --- | --- | --- |
| Alta | Introducir una contraseña incorrecta en login mostraba «No encontramos tu cuenta» y proponía registrarse; cualquier error del proveedor recibía ese diagnóstico. | Correo inexistente y contraseña incorrecta comparten un mensaje junto a las credenciales. Se conservan valores y se enfoca la contraseña. Otros errores mantienen el feedback general. `LoginPage.test.tsx` cubre ambas credenciales, error interno, límite de solicitudes y conexión. |
| Alta | En recuperación, el callback de activación podía navegar antes de conocer el resultado final de `finalize`. El reintento podía volver a enviar una contraseña ya actualizada. | Se reutiliza la activación del login, se espera su resultado, se respeta la verificación adicional y se reintenta solo la sesión. Pruebas con promesa pendiente, fallo y segundo factor. |
| Alta | Crear o guardar un evento con una tarea escrita pero todavía sin agregar/guardar omitía ese borrador. | El envío se detiene con explicación junto al editor. Se puede agregar, guardar o limpiar la tarea y continuar. Cubierto en creación, edición y navegador. Esto no protege todavía una salida mediante navegación. |
| Alta | Editar la segunda tarea provisional, eliminar la primera y guardar conservaba un índice obsoleto; los cambios podían no aplicarse. | Se reajusta el índice de edición y se comprueba el contenido finalmente enviado. Regresión en `EventForm.test.tsx`. |
| Alta | Adelantar la fecha del evento después de agregar tareas no revalidaba sus fechas. | Creación y edición detectan las tareas posteriores, explican cómo corregir y enfocan la fecha del evento. Regresión de creación y recorrido en navegador. |
| Media | Guardar/cancelar el evento seguía disponible mientras una tarea se guardaba por separado. | Las acciones se bloquean durante la operación para evitar salir o iniciar otra escritura. Prueba con guardado pendiente en `EditEventForm.test.tsx`. |
| Media | Los formularios de eventos y diálogos de tareas mostraban errores, pero el foco seguía en el botón al final. | Se enfoca el primer campo inválido siguiendo el orden visual. Pruebas en ambos formularios y ambos diálogos. |
| Media | Recuperación mostraba validación de código/contraseña como error general sin vinculación accesible. | `FieldError`, `aria-invalid`, `aria-describedby`, foco y ayuda previa de 15 caracteres. Se prueba también repetir el mismo envío inválido. |
| Media | Tras corregir una contraseña en Configuración continuaban visibles errores anteriores. | Se limpian los errores afectados y el mensaje general al editar. La siguiente validación se realiza al guardar. |
| Media | Fallar la carga de tipos al crear un evento dejaba un selector sin opciones y sin reintento local. | «Reintentar tipos de evento» vuelve a consultar el catálogo conservando los campos escritos. |
| Media | En móvil, las tareas provisionales ocultaban fecha y horas; acciones de 32 px y nombre truncado dificultaban revisarlas. | Fecha y horas visibles, nombre adaptable y acciones de 44 × 44 px. Comprobado a 320, 768 y 1440 px. |
| Media | El diálogo seguía haciendo zoom al abrir incluso con movimiento reducido. Una medición durante la animación devolvió 63,947 px para un icono de 64 px. | El diálogo compartido y su fondo usan `motion-reduce:animate-none!`. El recorrido visual verifica que ambas animaciones estén desactivadas. |

Los cambios están en `LoginPage`, `EventForm`, `EditEventForm`,
`AddSubtaskDialog`, `EditSubtaskDialog`, `PasswordDialog` y los componentes compartidos
`InlineFeedback` y `Dialog`. `src/lib/formFocus.ts` centraliza el orden de foco; las pruebas
están en sus archivos existentes bajo `tests/features` y en la matriz responsive.

## Recomendaciones pendientes

Estas recomendaciones proceden de inspección del código y las capturas; las
propuestas de carga cognitiva son hipótesis de diseño para validar con usuarios.

| Prioridad | Hallazgo y ubicación | Mejora propuesta y criterio de aceptación |
| --- | --- | --- |
| Alta | Login presenta Términos y Política como texto subrayado, pero son `span`; registro exige aceptar documentos que no permite abrir. | Incorporar enlaces a los documentos reales cuando se proporcionen sus destinos. Deben funcionar con teclado y conservar el formulario al consultarlos. No inventar documentos legales. |
| Alta | `CreateEventPage` conserva datos del evento y tareas agregadas, pero no el editor de tarea aún abierto. La edición no tiene protección de salida con cambios. | Avisar al navegar/cancelar con cambios y permitir continuar editando o descartarlos; ampliar el borrador de creación para incluir la tarea en preparación. Probar Atrás, sidebar y recarga, respetando el aislamiento por usuario. |
| Alta | Recuperación no ofrece reenviar código ni mostrar la nueva contraseña; algunas respuestas del proveedor al verificar se traducen siempre como código incorrecto. | Añadir reenvío con estado de envío y feedback; visibilidad de contraseña; distinguir código inválido, caducidad, red y límite de intentos en recuperación/registro. Usar los códigos reales de Clerk y no atribuir fallos técnicos a datos del usuario. |
| Media | `router.tsx` no define una ruta comodín ni un error de navegación propio. | Pantalla «No encontramos esta página», acceso al inicio adecuado a la sesión y opción de volver. Probar URL escrita incorrectamente y enlace antiguo. |
| Media | Crear/editar combinan información del evento, editor de tarea y lista de tareas en una sola vista larga; editar guarda tareas inmediatamente y el evento mediante otro botón. | Mostrar un resumen del evento y una sección de tareas opcionales desplegable. Al editar, considerar separar «Datos del evento» y «Tareas», manteniendo explícito qué se guarda con cada acción. Validar tiempo de finalización, errores y abandonos antes de adoptar un rediseño. |
| Media | «Tiempo estimado» no siempre explica su unidad. `min="0.5"` y `step="0.5"` no coinciden con una validación personalizada que acepta cualquier número positivo. | Acordar con backend la precisión válida; explicar «En horas» y dar un ejemplo. Alinear control, validación y mensajes, incluyendo valores fraccionarios. |
| Media | Algunos formularios comunican obligatoriedad solo con asteriscos; etiquetas auxiliares de 11–12 px exigen atención en vistas densas. | Añadir una explicación de los asteriscos y semántica de obligatoriedad. Revisar legibilidad con zoom y lectores de pantalla sin cambiar indiscriminadamente la escala visual. |
| Media | La aplicación mantiene un título de documento estático; cambiar de ruta no identifica la pantalla en la pestaña. | Actualizar el título por vista: «Crear evento · Eventger», «Eventos · Eventger», etc. Comprobar también estados de error. |
| Baja | La galería visual de autenticación conserva estados históricos que ya no representan el flujo real. | Sincronizar galería, Figma y evidencias con el feedback inline actual; evitar usar la galería como prueba de integración. |
| Media | El build informa un bundle JavaScript principal superior a 500 kB. | Medir carga inicial en una red móvil y evaluar división por rutas. No se afirma una regresión de rendimiento sin medirla. |

## Evidencia visual

- [Registro con errores en móvil](evidencias/auditoria-ux/registro-errores-mobile.png).
- [Creación con tarea visible en 320 px](evidencias/auditoria-ux/crear-tarea-mobile.png).
- [Creación con tarea visible en 1440 px](evidencias/auditoria-ux/crear-tarea-desktop.png).

Las capturas proceden de fixtures aisladas. En una captura de página completa,
la barra fija móvil puede aparecer a la altura del desplazamiento desde el que
se tomó la captura; no representa su posición mientras se recorre la página.

## Criterios y límites

La asociación de errores con campos, las instrucciones para corregirlos y el
foco en el primer error siguen las pautas de
[notificación de formularios de W3C WAI](https://www.w3.org/WAI/tutorials/forms/notifications/).
Los 44 px siguen la regla del propio repositorio y el criterio
[Target Size Enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced).
No debe confundirse con el mínimo de 24 px y sus excepciones en
[Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).

No se verificaron servicios de producción, entrega real de correos, Google OAuth,
política de la instancia de Clerk ni el backend real. Las pruebas sustituyen esas
fronteras. Tampoco se realizó una certificación WCAG, una medición exhaustiva de
contraste ni una sesión con lector de pantalla real. La navegación con teclado,
atributos accesibles, foco y reflow sí se comprueban en los casos descritos.

Se conservaron los cambios locales de direcciones y otros cambios concurrentes
en eventos, documentación y pruebas. No se modificó configuración, no se hicieron
commits, push ni despliegues.

## Validación ejecutada

- Node `24.18.0`, coincidente con `.nvmrc`.
- `npm run validate`: lint, TypeScript, **390 pruebas en 48 archivos**, cobertura
  y build correctos. Cobertura informada: 91,02 % de sentencias y 87,18 % de ramas.
  El build conserva la advertencia de tamaño del bundle; no es un error de compilación.
  Lint termina sin errores, con tres advertencias en `button.tsx`,
  `useEventTypes.ts` y el efecto existente de `AddSubtaskDialog.tsx`.
- Las regresiones de login/eventos fallaron antes de las correcciones. Hubo
  además timeouts de pruebas existentes bajo carga; se distinguen de los fallos
  funcionales reproducidos. Las suites afectadas y la validación final pasan.
- `npm run test:responsive -- --grep 'auditoría UX' --output=/tmp/eventger-ux-artifacts --reporter=list`:
  **3/3 correctas**, con foco del primer error, borrador pendiente, fecha límite,
  metadatos móviles, objetivos táctiles y ausencia de overflow.
- La primera matriz de navegador terminó con 155 casos correctos y 4 fallidos:
  tres errores `ENOENT` al cerrar trazas compartidas y una aserción de paginación.
  Se repitió con salida aislada para comprobar el resultado sin colisiones.
- La primera suite detectó una prueba de búsqueda de direcciones con un rechazo
  `network`; su ejecución aislada posterior y la validación final pasan. No se
  atribuye una causa raíz a ese fallo ni se presenta como una corrección propia.

### Resultado final de navegador

La matriz con salida aislada ejecutó **168 escenarios: 166 correctos y 2 fallidos**.
Los dos casos se investigaron y repitieron sin sustituir ni debilitar sus aserciones:

- Paginación: la traza registró una segunda carga del documento estando en la
  página 3, que añadió una consulta. Sin modificaciones de archivos ni builds en
  paralelo, las cuatro resoluciones pasaron dos veces: **8/8**. No se modificó
  la lógica de paginación ni se concluye una causa raíz más específica para la recarga.
- Iconografía/diálogo: una regla `data-open` prevalecía sobre la desactivación
  de animaciones. Se dio prioridad a la preferencia de movimiento reducido en
  el diálogo y su fondo. La prueba conserva la medición exacta de 64 px y añade
  comprobaciones de `animation-name: none`: **3/3 repeticiones correctas**.
- Los tres recorridos nuevos de creación pasaron también dos veces: **6/6**.

Comandos de repetición:

```bash
npm run test:responsive -- --grep 'paginación de eventos limita tarjetas|los estados de feedback comparten|auditoría UX' --repeat-each=2 --output=/tmp/eventger-ux-recheck-artifacts --reporter=list
npm run test:responsive -- --grep 'los estados de feedback comparten' --repeat-each=3 --output=/tmp/eventger-ux-motion-artifacts --reporter=list
```

El primero produjo 14 casos correctos y los dos fallos de especificidad CSS
indicados; el segundo verifica su corrección final. No se volvió a ejecutar la
matriz completa después de ese último ajuste CSS. Se repitieron lint y build.

## Validación de la rama del PR

La rama `fix/ux-auth-formularios` se preparó desde `origin/main` en un checkout
separado. Incluye solo las correcciones de esta auditoría. Las sugerencias de
direcciones, sus servicios/pruebas y los cambios del listado de eventos siguen
en el workspace original y no forman parte de este PR.

- `npm run validate`: **355 pruebas en 45 archivos**, lint, tipos, cobertura y
  build correctos. Los números anteriores corresponden al workspace completo
  durante la auditoría, que incluía trabajo concurrente.
- **17/17 escenarios de navegador correctos** sobre el contenido de la rama:
  login y registro en seis tamaños, errores accesibles, movimiento reducido y
  creación de eventos a 320, 768 y 1440 px.
- Dependencias instaladas con `npm ci --ignore-scripts --prefer-offline`.
  Se utilizó `VITE_API_URL=https://api.eventger.test` y respuestas HTTP simuladas;
  no se copiaron archivos de credenciales al checkout.

```bash
VITE_API_URL=https://api.eventger.test npm run test:responsive -- --grep 'auditoría UX|los estados de feedback comparten|los formularios comparten|login no produce|signup no produce' --output=/tmp/eventger-ux-pr-browser-verified --reporter=list
```
