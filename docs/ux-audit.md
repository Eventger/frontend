# Auditoría Heurística de UX/UI — Eventger

**Fecha de evaluación:** 25 de octubre de 2026<br>
**Rol del evaluador:** Evaluador Senior de UX/UI (Especialista en Heurística, Arquitectura de Información y Diseño de Interacción)<br>
**Alcance:** Frontend Web (Escritorio 1440×900, Tableta 768×1024, Móvil 375×812)<br>
**Estado:** Diagnóstico e investigación técnica (sin modificaciones de código en esta fase)<br>

---

## 1. Resumen Ejecutivo

La presente auditoría heurística evaluó la experiencia de usuario, arquitectura de información, jerarquía visual y coherencia de diseño en **Eventger**, una aplicación web orientada a la planificación de eventos y balance de carga de trabajo diaria de tareas.

### Principales fortalezas identificadas
- **Sistema visual estructurado:** Uso consistente de tipografía moderna (`Geist Variable`), paleta de color Tailwind sobria, soporte de accesibilidad básico en modales Radix UI, y feedback contextual para estados de carga/error.
- **Potencia en prevención de sobrecargas:** El cálculo algorítmico de límites de carga diarios (`daily_limit_hours`) y la detección de conflictos en reprogramación aportan un valor diferenciador clave frente a simples listas de tareas.
- **Estabilidad en configuración:** La pantalla de configuración y el selector de horas se encuentran visualmente estables, con diálogos modales para gestión de conflictos.

### Principales fricciones y riesgos de usabilidad
- **Fractura del modelo mental en gestión de tareas (`EventDetailContent`):** La pantalla de detalle de evento permite agregar tareas vía modal solo cuando el evento tiene 0 tareas. Una vez creada la primera tarea, el botón para agregar tareas desaparece y la UI informa que *"las tareas se gestionan desde Editar evento"*, forzando al usuario a abandonar el detalle y abrir un formulario masivo de edición de evento para una acción elemental.
- **Falsa obligatoriedad de tareas en creación de eventos (`EventForm`):** El formulario de creación incluye una subsección de «Crear tarea» con campos marcados con asteriscos (`*`) y su propio botón primario. Esto induce al usuario a creer que no puede registrar un evento sin desglosar tareas inmediatamente.
- **Pérdida crítica de visibilidad en móvil (`TodaySummary`):** Las tarjetas de resumen («Vencidas», «Para hoy», «Próximas») se ocultan por completo en pantallas menores a 768 px (`md:hidden`), dejando al usuario móvil sin métricas clave al abrir su jornada.
- **Navegación inesperada y pérdida de contexto en «Hoy» (`TodayTaskCard`):** Hacer clic en una tarjeta de tarea en la vista de «Hoy» expulsa al usuario de su dashboard y lo traslada a la página del evento, en vez de desplegar el detalle inline como ocurre en el detalle de eventos.
- **Inconsistencia de iconos y affordances:** Uso de iconos de engranaje (`Settings`) para menús contextuales de tareas, icono de verificación (`CircleCheck`) en acciones destructivas de revocación de sesiones, y presencia de dos botones primarios idénticos `+ Crear evento` en la misma pantalla.

---

## 2. Inventario de Pantallas y Componentes Revisados

| ID | Ruta | Pantalla / Módulo | Componentes Clave Inspeccionados | Tarea Principal del Usuario |
|---|---|---|---|---|
| **P-01** | `/` | Inicio de Sesión (`LoginPage`) | `LoginPage.tsx`, `AuthFeedbackModal.tsx` | Acceder mediante correo/contraseña o Google; recuperar acceso. |
| **P-02** | `/crear-cuenta` | Registro (`SignUpPage`) | `SignUpPage.tsx` | Crear cuenta nueva; aceptar términos legales; federación Google. |
| **P-03** | `/hoy` | Dashboard Diario (`TodayPage`) | `TodaySummary.tsx`, `TodayPriorityGuide.tsx`, `TodayTaskCard.tsx`, `TodayFilters.tsx`, `DailyLimitDialog.tsx` | Revisar carga del día, tareas vencidas y próximas; registrar avance; reprogramar; ajustar horas. |
| **P-04** | `/eventos` | Catálogo de Eventos (`EventsPage`) | `EventsPage.tsx`, `EventCard.tsx`, `EventsTypeFilter.tsx`, `EventsPagination.tsx` | Consultar eventos activos, porcentaje de avance general y filtrar por tipo. |
| **P-05** | `/crear` | Creación de Eventos (`CreateEventPage`) | `EventForm.tsx`, `EventLocationInput.tsx`, `InlineDateCalendar.tsx` | Registrar metadatos del evento (nombre, tipo, fecha, lugar, contacto) y definir tareas iniciales. |
| **P-06** | `/evento/:id` | Detalle del Evento (`EventDetailPage`) | `EventDetailContent.tsx`, `EventInfoCard.tsx`, `EventTaskCard.tsx`, `AddSubtaskDialog.tsx` | Monitorear el evento; consultar notas de tareas; registrar avances; reprogramar; gestionar evento. |
| **P-07** | `/evento/:id` (modo edit) | Edición de Evento (`EditEventForm`) | `EditEventForm.tsx`, `DeleteSubtaskDialog.tsx` | Modificar datos del evento y alterar tareas en base de datos. |
| **P-08** | `/progreso` | Métricas de Avance (`ProgressPage`) | `ProgressPage.tsx`, `ProgressEmptyState.tsx`, `ProgressErrorState.tsx` | Panorama global de completitud de todos los eventos del usuario. |
| **P-09** | `/configuracion` | Ajustes de Cuenta (`SettingsPage`) | `SettingsPage.tsx`, `PreferencesForm.tsx`, `ProfileDialog.tsx`, `EmailDialog.tsx` | Consultar perfil; vincular Google; configurar horas límite de trabajo diario. |
| **P-10** | `/configuracion/seguridad` | Seguridad de la Cuenta (`SecurityPage`) | `SecurityPage.tsx`, `PasswordDialog.tsx`, `DeleteAccountDialog.tsx` | Cambiar contraseña; revocar sesiones activas en otros dispositivos; eliminar cuenta. |
| **P-11** | N/A (Modales) | Diálogos de Interacción Crítica | `RescheduleTaskDialog.tsx`, `RegisterProgressDialog.tsx`, `DestructiveConfirmationDialog.tsx` | Resolver conflictos de sobrecarga y actualizar estados de tarea. |

---

## 3. Hallazgos por Pantalla y Componente

### Hallazgo H-01: Imposibilidad de agregar o eliminar tareas desde la vista de detalle de evento cuando ya existen tareas
- **Pantalla y Ruta:** `/evento/:id` (`EventDetailPage.tsx` / `EventDetailContent.tsx`).
- **Componentes Afectados:** `EventDetailContent.tsx` (L101-127, L130-159) y `EventTaskCard.tsx` (L310-395).
- **Evidencia Técnica:**
  - En `EventDetailContent.tsx` (L120) se presenta el microcopy: `<p className="mt-0.5 text-xs text-[#667085]">Las tareas se gestionan desde Editar evento.</p>`.
  - Cuando el evento no tiene tareas (`EmptyTasksState`), se renderiza el botón directo «Agregar tarea». Sin embargo, cuando ya existen tareas (`hasTasks === true`), el botón para crear tareas desaparece y solo se muestra el botón secundario «Ver progreso detallado» (L124).
  - En `EventTaskCard.tsx`, el menú de acciones ofrece «Reprogramar», «Ver detalle» y «Editar tarea», pero omite deliberadamente la acción de «Eliminar tarea».
- **Principio Heurístico:**
  - *Heurística #3: Control y libertad del usuario.*
  - *Heurística #6: Reconocimiento antes que recuerdo.*
  - *Heurística #7: Flexibilidad y eficiencia de uso.*
- **Impacto en el Usuario:** El usuario asume que la interfaz tiene un fallo o que no es posible agregar más actividades a un evento en marcha. Para realizar una adición o borrado básico, se ve forzado a entrar a la edición integral del evento (`EditEventForm`), desplazarse verticalmente por un formulario de más de 1.000 líneas y guardar el evento completo.
- **Severidad:** **3 / 4 (Problema Mayor)**.
- **Nivel de Confianza:** Alto (comprobado en código y en arquitectura de componentes).
- **Solución Propuesta con Justificación:**
  1. Habilitar un botón primario/secundario «+ Agregar tarea» en el encabezado de la sección «Plan logístico» de `EventDetailContent.tsx` que active directamente el diálogo modal `AddSubtaskDialog.tsx` ya existente.
  2. Incorporar la acción «Eliminar tarea» con estilo destructivo en el menú contextual de `EventTaskCard.tsx`, vinculada a `DeleteSubtaskDialog`.
  3. Suprimir la leyenda restrictiva *"Las tareas se gestionan desde Editar evento."*.

---

### Hallazgo H-02: Doble botón primario idéntico («+ Crear evento») visible simultáneamente en la misma pantalla
- **Pantalla y Ruta:** `/hoy`, `/eventos`, `/progreso` (Layout global).
- **Componentes Afectados:** `AppSidebar.tsx` (L98-105) y `PageHeaderCreateButton.tsx` (en cabeceras de página).
- **Evidencia Visual:** Capturas `today_desktop_1792975922279.png`, `events_list_desktop_1792976221534.png`, `progress_desktop_1792976064222.png`.
  - En la barra lateral izquierda fija se muestra un botón ancho morado/índigo sólido `+ Crear evento`.
  - Simultáneamente, en el margen superior derecho de la misma ventana, se renderiza otro botón de idéntico color, tipografía e icono `+ Crear evento`.
  - Al abrir el tooltip de disponibilidad en escritorio (`today_hover_tooltip_1792975934134.png`), este se superpone sobre el botón superior derecho.
- **Principio Heurístico:**
  - *Heurística #8: Diseño estético y minimalista.*
  - *Jerarquía visual y Ley de Hick.*
- **Impacto en el Usuario:** Sobrecarga visual innecesaria y competencia entre dos elementos de llamado a la acción (CTA) idénticos en el mismo campo visual. Genera percepción de falta de pulido en la arquitectura de interfaz.
- **Severidad:** **2 / 4 (Problema Menor)**.
- **Nivel de Confianza:** Alto (confirmado visualmente en navegador automatizado).
- **Solución Propuesta con Justificación:**
  - Mantener «+ Crear evento» como acción persistente en la barra lateral izquierda para navegación global, y remover el botón repetido de la cabecera en paneles como «Hoy» y «Progreso». En «Eventos», mantenerlo únicamente como acción de contexto si se desea destacar sobre la lista.

---

### Hallazgo H-03: Supresión completa de las tarjetas de métricas en dispositivos móviles
- **Pantalla y Ruta:** `/hoy` (`TodayPage.tsx`).
- **Componentes Afectados:** `TodaySummary.tsx` (L47-133 vs L135-180).
- **Evidencia Visual:** Captura comparativa `today_desktop_1792975922279.png` vs `today_mobile_1792975942086.png`.
  - En escritorio, `TodaySummary` despliega 4 tarjetas: «Vencidas», «Para hoy», «Próximas» y «Horas disponibles».
  - En móvil (`md:hidden`), el código omite las primeras 3 tarjetas y renderiza exclusivamente «Tus horas disponibles».
- **Principio Heurístico:**
  - *Heurística #1: Visibilidad del estado del sistema.*
  - *Heurística #4: Consistencia y estándares (Diseño responsive).*
- **Impacto en el Usuario:** El usuario en móvil (contexto frecuente para verificar tareas urgentes sobre la marcha) pierde el conteo inmediato de tareas vencidas o pendientes y se ve obligado a scrollear toda la pantalla para dimensionar el trabajo del día.
- **Severidad:** **3 / 4 (Problema Mayor)**.
- **Nivel de Confianza:** Alto (comprobado en captura móvil y código en L135 de `TodaySummary.tsx`).
- **Solución Propuesta con Justificación:**
  - Diseñar una fila de resumen móvil compacta (3 indicadores o chips numéricos: `2 Vencidas`, `4 Hoy`, `7 Próximas`) integrada en la parte superior o inmediatamente adyacente a la tarjeta de horas disponibles.

---

### Hallazgo H-04: Falsa obligatoriedad de tareas y fricción de formulario incrustado en «Crear evento»
- **Pantalla y Ruta:** `/crear` (`CreateEventPage.tsx` / `EventForm.tsx`).
- **Componentes Afectados:** `EventForm.tsx` (L189-230, L900-1100).
- **Evidencia Visual:** Capturas `create_event_desktop_1792976233355.png` y `create_event_scrolled_desktop_1792976243307.png`.
  - La tarjeta «Crear tarea» contiene campos marcados con asterisco: «Nombre de la tarea *», «Fecha límite *», «Tiempo estimado *».
  - En el pie coexisten dos botones primarios azules: «Agregar tarea» y «Crear evento».
  - Si bien el evento se puede crear con 0 tareas, el usuario percibe los asteriscos como obligatorios. Además, si el usuario empieza a escribir una tarea y presiona «Crear evento» sin pulsar antes «Agregar tarea», el sistema bloquea el envío con un error de borrador pendiente.
- **Principio Heurístico:**
  - *Heurística #2: Coincidencia entre el sistema y el mundo real.*
  - *Heurística #5: Prevención de errores.*
  - *Heurística #8: Diseño estético y minimalista.*
- **Impacto en el Usuario:** Tasa de abandono elevada en la creación de eventos. Usuarios que solo quieren agendar un evento básico (ej. "Reunión de equipo") sienten que la aplicación les exige obligatoriamente desglosar actividades con horas estimadas en ese preciso instante.
- **Severidad:** **3 / 4 (Problema Mayor)**.
- **Nivel de Confianza:** Alto (comprobado en código y capturas).
- **Solución Propuesta con Justificación:**
  - Convertir la adición de tareas iniciales en un acordeón plegado por defecto o en un paso posterior opcional claramente identificado: *"Plan logístico (opcional) — Puedes añadir tareas ahora o más tarde desde el evento"*.
  - Eliminar los asteriscos cuando el formulario de tarea no esté activo.

---

### Hallazgo H-05: Navegación abrupta y pérdida de contexto al interactuar con tareas en el panel «Hoy»
- **Pantalla y Ruta:** `/hoy` (`TodayPage.tsx` / `TodayTaskCard.tsx`).
- **Componentes Afectados:** `TodayTaskCard.tsx` (L53-83) y `TodayPage.tsx` (L123-130).
- **Evidencia Técnica:**
  - En `TodayTaskCard.tsx`, casi toda el área de la tarjeta es un botón clickable que dispara `onOpenTask`.
  - En `TodayPage.tsx`, `onOpenTask` redirige forzosamente mediante `navigate('/evento/:id?tarea=:id')`.
  - En el menú contextual, la opción «Ver detalles» también dispara esta misma navegación hacia el evento.
  - En contraste, en `EventTaskCard.tsx` (detalle de evento), la acción «Ver detalle» despliega un panel colapsable inline con las notas y detalles de la tarea.
- **Principio Heurístico:**
  - *Heurística #4: Consistencia y estándares.*
  - *Heurística #3: Control y libertad del usuario.*
- **Impacto en el Usuario:** Desorientación. El usuario que solo deseaba revisar notas o detalles de una tarea asignada para hoy es expulsado del panel diario hacia la vista completa del evento, perdiendo su scroll y contexto de trabajo.
- **Severidad:** **2 / 4 (Problema Menor / Fricción de Flujo)**.
- **Nivel de Confianza:** Alto (verificado en código fuente y flujo de navegación).
- **Solución Propuesta con Justificación:**
  - Implementar en `TodayTaskCard` el mismo comportamiento de expansión inline para notas y detalles que posee `EventTaskCard`, o un cajón lateral rápido (drawer).
  - Dejar un enlace explícito «Ir al evento →» para los casos donde el usuario realmente decida cambiar de vista.

---

### Hallazgo H-06: Inconsistencia semántica y responsive en el menú de acciones de tareas (engranaje vs puntos suspensivos)
- **Pantalla y Ruta:** `/evento/:id` y `/hoy`.
- **Componentes Afectados:** `EventTaskCard.tsx` (L321), `TodayTaskActionsMenu.tsx` (L90-91).
- **Evidencia Visual:** Capturas `today_desktop_1792975922279.png` vs `today_mobile_1792975942086.png`.
  - En `EventTaskCard.tsx`, el botón de acciones de cada tarea muestra una rueda dentada de configuración (`Settings`).
  - En `TodayTaskActionsMenu.tsx`, en móvil muestra puntos suspensivos `<MoreHorizontal />` (`•••`), pero en escritorio cambia arbitrariamente al icono de engranaje `<Settings />`.
- **Principio Heurístico:**
  - *Heurística #4: Consistencia y estándares.*
  - *Affordance y convenciones de iconos.*
- **Impacto en el Usuario:** El icono de engranaje internacionalmente denota configuración del sistema o cuenta, no acciones contextuales sobre un ítem ("Reprogramar", "Editar", "Eliminar").
- **Severidad:** **2 / 4 (Problema Menor)**.
- **Nivel de Confianza:** Alto (verificado en código y capturas).
- **Solución Propuesta con Justificación:**
  - Estandarizar el icono en todas las resoluciones hacia `MoreHorizontal` (`•••`) o `MoreVertical`, acompañado de la etiqueta «Acciones».

---

### Hallazgo H-07: Icono de confirmación/éxito (`CircleCheck`) asignado a la acción destructiva de revocación de sesiones
- **Pantalla y Ruta:** `/configuracion/seguridad` (`SecurityPage.tsx`).
- **Componentes Afectados:** `SecurityPage.tsx` (L65).
- **Evidencia Técnica:**
  - En la lista de sesiones activas, la sesión actual muestra `<CircleCheck size={15} /> Sesión actual` (correcto, estado pasivo).
  - Pero el botón interactivo para cerrar una sesión remota en otro dispositivo utiliza:
    `<Button ... onClick={() => revokeSession(session.id)}><CircleCheck size={15} /> Cerrar sesión</Button>`.
- **Principio Heurístico:**
  - *Heurística #2: Coincidencia entre el sistema y el mundo real.*
  - *Heurística #4: Consistencia y estándares.*
- **Impacto en el Usuario:** Un checkmark verde/índigo transmite que algo está completado o verificado con éxito, no que se va a expulsar un dispositivo activo. Genera duda sobre si la sesión ya fue cerrada o si el botón ejecutará un cierre.
- **Severidad:** **2 / 4 (Problema Menor)**.
- **Nivel de Confianza:** Alto (código exacto en L65 de `SecurityPage.tsx`).
- **Solución Propuesta con Justificación:**
  - Reemplazar el icono del botón de revocación por `LogOut` o `XCircle` con tono neutro o de advertencia.

---

### Hallazgo H-08: Fugas de jerga técnica y proveedores internos en la interfaz de usuario («Clerk»)
- **Pantalla y Ruta:** `/configuracion` (`SettingsPage.tsx`).
- **Componentes Afectados:** `SettingsPage.tsx` (L41, L65), captura `settings_desktop_1792975998930.png`.
- **Evidencia Visual:**
  - Subtítulo de página: *"Gestiona tu cuenta de Clerk y las preferencias de Eventger desde un solo lugar."*
  - Metadato de perfil: *"Perfil administrado por Clerk"*, *"Estos datos se gestionan de forma segura con Clerk."*
- **Principio Heurístico:**
  - *Heurística #2: Coincidencia entre el sistema y el mundo real.*
- **Impacto en el Usuario:** Los usuarios no conocen qué es "Clerk" ni por qué deben gestionar una cuenta de un tercero desconocido. Induce incertidumbre sobre la privacidad y seguridad de sus datos.
- **Severidad:** **2 / 4 (Problema Menor)**.
- **Nivel de Confianza:** Alto (captura real).
- **Solución Propuesta con Justificación:**
  - Sustituir las menciones técnicas por microcopia orientada al usuario: *"Gestiona tu cuenta personal y las preferencias de Eventger"*, *"Perfil de usuario"*.

---

### Hallazgo H-09: Texto truncado bruscamente y microtipografía (10.5 px) en la regla de prioridad de «Hoy»
- **Pantalla y Ruta:** `/hoy` (`TodayPage.tsx` / `TodayPriorityGuide.tsx`).
- **Componentes Afectados:** `TodayPriorityGuide.tsx` (L106-108, L161).
- **Evidencia Visual:** Captura `today_mobile_1792975942086.png`.
  - El texto descriptivo del banner tiene clase `truncate`. En dispositivos móviles se corta como: `(i) Orden de Hoy: Vencidas → Para hoy → Próximas ·... ¿Cómo funciona?`.
  - El popover explicativo utiliza una fuente de `text-[10.5px] leading-[15px]`.
- **Principio Heurístico:**
  - *Heurística #8: Diseño estético y minimalista.*
  - *Accesibilidad tipográfica y legibilidad.*
- **Impacto en el Usuario:** El usuario no puede leer el criterio de ordenamiento en móvil y el popover resulta difícilmente legible para personas con fatiga visual o pantallas de alta densidad.
- **Severidad:** **2 / 4 (Problema Menor)**.
- **Nivel de Confianza:** Alto (captura real y código).
- **Solución Propuesta con Justificación:**
  - Permitir salto de línea en móvil o resumir el texto a: *"Prioridad: Vencidas → Hoy → Próximas"*.
  - Aumentar el tamaño de fuente del popover a 12 px o 13 px.

---

### Hallazgo H-10: Ausencia de buscador textual en el listado de eventos
- **Pantalla y Ruta:** `/eventos` (`EventsPage.tsx`).
- **Componentes Afectados:** `EventsPage.tsx` (L100-128).
- **Evidencia Técnica:**
  - La pantalla solo cuenta con un filtro desplegable por tipo (`EventsTypeFilter`).
  - No existe ningún campo de entrada para buscar eventos por nombre, cliente, ciudad o fecha.
- **Principio Heurístico:**
  - *Heurística #7: Flexibilidad y eficiencia de uso.*
- **Impacto en el Usuario:** Ineficiencia severa cuando el usuario supera una docena de eventos. Se ve obligado a pasar páginas de forma secuencial para localizar un evento específico.
- **Severidad:** **2 / 4 (Problema Menor / Escalabilidad)**.
- **Nivel de Confianza:** Alto (código verificado).
- **Solución Propuesta con Justificación:**
  - Agregar un input de búsqueda con icono de lupa en la barra de herramientas de `/eventos`.

---

### Hallazgo H-11: Falta de indicadores preventivos de requisitos de contraseña en el registro
- **Pantalla y Ruta:** `/crear-cuenta` (`SignUpPage.tsx`).
- **Componentes Afectados:** `SignUpPage.tsx`, captura `signup_desktop_1792975985755.png`.
- **Evidencia Visual:**
  - El campo de contraseña no exhibe ningún texto de ayuda sobre longitud mínima o reglas de caracteres.
  - La validación solo se activa tras enviar el formulario con un valor que falla.
- **Principio Heurístico:**
  - *Heurística #5: Prevención de errores.*
  - *Heurística #10: Ayuda y documentación.*
- **Impacto en el Usuario:** Fricción en el proceso de alta de nuevos usuarios por tener que corregir errores a ciegas.
- **Severidad:** **2 / 4 (Problema Menor)**.
- **Nivel de Confianza:** Alto (captura real).
- **Solución Propuesta con Justificación:**
  - Añadir microcopy previo con los requisitos mínimos de contraseña o una barra de fortaleza visual.

---

### Hallazgo H-12: Artefacto decorativo incongruente en pantallas de autenticación (calendario de 35 días)
- **Pantalla y Ruta:** `/` y `/crear-cuenta` (`LoginPage.tsx`, `SignUpPage.tsx`).
- **Componentes Afectados:** Columna lateral ilustrativa (Hero decorativo).
- **Evidencia Visual:** Capturas `login_desktop_1792975973256.png` y `signup_desktop_1792975985755.png`.
  - La tarjeta decorativa muestra *"Abril 2026"* con números que continúan correlativamente hasta el día 35.
- **Principio Heurístico:**
  - *Heurística #2: Coincidencia entre el sistema y el mundo real.*
  - *Credibilidad visual.*
- **Impacto en el Usuario:** En una aplicación cuyo valor central es la precisión cronológica y la planificación temporal, un calendario con 35 días proyecta descuido gráfico.
- **Severidad:** **1 / 4 (Problema Cosmético)**.
- **Nivel de Confianza:** Alto (confirmado visualmente).
- **Solución Propuesta con Justificación:**
  - Corregir la grilla estática para que termine en el día 30 y muestre los días restantes como pertenecientes al mes siguiente.

---

### Hallazgo H-13: Botón de reintento en error de tipos de evento sin apariencia de control interactivo
- **Pantalla y Ruta:** `/crear` (`EventForm.tsx`).
- **Componentes Afectados:** `EventForm.tsx` (L750-760), captura `create_event_desktop_1792976233355.png`.
- **Evidencia Visual:**
  - Al fallar la consulta de tipos de evento, el selector se bordea de rojo y debajo aparece el texto *"Reintentar tipos de evento"*.
  - El elemento es un botón en HTML, pero se estiliza como texto plano negro sin subrayado, sin color de enlace ni cursor perceptible.
- **Principio Heurístico:**
  - *Heurística #4: Consistencia y estándares.*
  - *Affordance visual.*
- **Impacto en el Usuario:** El usuario no identifica que el texto es accionable y cree que la pantalla está bloqueada permanentemente.
- **Severidad:** **2 / 4 (Problema Menor)**.
- **Nivel de Confianza:** Alto (captura real).
- **Solución Propuesta con Justificación:**
  - Aplicar estilos de botón de enlace con icono `RotateCcw` y color primario `#4f46e5`.

---

### Hallazgo H-14: Incongruencia en el modelo de persistencia (mutación inmediata de tareas vs guardado de formulario)
- **Pantalla y Ruta:** Modo edición de evento (`EditEventForm.tsx`).
- **Componentes Afectados:** `EditEventForm.tsx` (L74-85, L1200-1380).
- **Evidencia Técnica:**
  - En la vista de edición de evento, alterar o borrar una subtarea realiza llamadas inmediatas a la API de backend.
  - En cambio, los cambios en el evento (nombre, fecha, lugar) solo se guardan al pulsar «Guardar cambios».
  - Si un usuario borra una tarea y luego pulsa «Cancelar» en la cabecera, la tarea borrada ya fue eliminada del servidor de forma irreversible.
- **Principio Heurístico:**
  - *Heurística #3: Control y libertad del usuario.*
  - *Heurística #1: Visibilidad del estado del sistema.*
- **Impacto en el Usuario:** Destrucción inadvertida de datos. El usuario asume que «Cancelar» revierte todo lo realizado durante esa sesión de edición.
- **Severidad:** **3 / 4 (Problema Mayor)**.
- **Nivel de Confianza:** Alto (código fuente verificado).
- **Solución Propuesta con Justificación:**
  - Separar conceptualmente la edición de atributos del evento (formulario clásico) de la lista de tareas del evento (gestión directa con diálogo de confirmación individual).

---

## 4. Tabla Consolidada de Evaluación Heurística

| ID | Pantalla | Componente | Principio Heurístico | Severidad (0-4) | Confianza |
|---|---|---|---|---|---|
| **H-01** | `/evento/:id` | `EventDetailContent` | H3: Control y libertad del usuario / H7: Eficiencia | **3 (Mayor)** | Alta |
| **H-04** | `/crear` | `EventForm` | H2: Mundo real / H5: Prevención de errores | **3 (Mayor)** | Alta |
| **H-03** | `/hoy` | `TodaySummary` | H1: Visibilidad del sistema / H4: Consistencia | **3 (Mayor)** | Alta |
| **H-14** | `/evento/:id` (edit) | `EditEventForm` | H3: Control del usuario / H1: Visibilidad | **3 (Mayor)** | Alta |
| **H-02** | Global | `AppSidebar` / `PageHeader` | H8: Minimalismo y estética / Ley de Hick | **2 (Menor)** | Alta |
| **H-05** | `/hoy` | `TodayTaskCard` | H4: Consistencia / H3: Control del usuario | **2 (Menor)** | Alta |
| **H-06** | `/evento/:id`, `/hoy` | `EventTaskCard` / `TodayActions` | H4: Consistencia y estándares / Affordance | **2 (Menor)** | Alta |
| **H-07** | `/configuracion/seguridad`| `SecurityPage` | H2: Mundo real / H4: Consistencia | **2 (Menor)** | Alta |
| **H-08** | `/configuracion` | `SettingsPage` | H2: Coincidencia con el mundo real | **2 (Menor)** | Alta |
| **H-09** | `/hoy` | `TodayPriorityGuide` | H8: Minimalismo / Accesibilidad tipográfica | **2 (Menor)** | Alta |
| **H-10** | `/eventos` | `EventsPage` | H7: Flexibilidad y eficiencia de uso | **2 (Menor)** | Alta |
| **H-11** | `/crear-cuenta` | `SignUpPage` | H5: Prevención de errores / H10: Ayuda | **2 (Menor)** | Alta |
| **H-13** | `/crear` | `EventForm` | H4: Consistencia y estándares / Affordance | **2 (Menor)** | Alta |
| **H-12** | `/`, `/crear-cuenta` | Hero visual decorativo | H2: Coincidencia con el mundo real | **1 (Cosmético)**| Alta |

---

## 5. Hallazgos Pendientes de Validación Humana (Pruebas con Usuarios)

Los siguientes puntos corresponden a hipótesis de diseño y carga cognitiva que deben contrastarse mediante pruebas de usabilidad con usuarios representativos:

1. **Comprensión del balance de horas en `Hoy`:**
   - *Hipótesis:* La visualización simultánea de «Horas disponibles» (ej. 16 h/día), «Horas planificadas» (12.5 h) y «Horas restantes» (3.5 h) genera confusión en usuarios que interpretan las horas disponibles como un horario de jornada laboral fija en lugar de un techo de capacidad de tareas.
   - *Validación sugerida:* Prueba de protocolo de pensamiento en voz alta (*Think-Aloud*) pidiendo a 5 usuarios que interpreten si están sobrecargados o si pueden tomar una nueva tarea de 4 horas.

2. **Resolución de sobrecarga en reprogramación (`RescheduleTaskDialog`):**
   - *Hipótesis:* Cuando el sistema detecta que reprogramar una tarea sobrepasa el límite diario y muestra la lista de tareas en conflicto, los usuarios dudan sobre si el botón «Resolver conflicto» reprogramará la tarea actual o modificará las demás tareas del día.
   - *Validación sugerida:* Medir la tasa de éxito y titubeo al resolver una reprogramación con conflicto forzado.

3. **Densidad informativa de la barra de prioridad algorítmica:**
   - *Hipótesis:* El banner con la regla algorítmica de orden (*"Vencidas → Para hoy → Próximas · Fecha define el orden · Empate: menor tiempo estimado"*) es percibido como un mensaje de depuración técnica o distracción innecesaria más que como una ayuda de valor.
   - *Validación sugerida:* Comparar satisfacción y tiempo de escaneo entre usuarios con el banner visible versus usuarios con un tooltip discreto en la cabecera.

---

## 6. Los Cinco Problemas Prioritarios para Corregir

Basado en el impacto sobre la tarea principal del usuario, la frecuencia de uso y la severidad heurística, estos son los cinco problemas que deben abordarse en la siguiente iteración:

### 1. Desbloquear la adición y eliminación directa de tareas en el detalle del evento
- **Por qué es prioritario:** Afecta el núcleo funcional de la aplicación. Obligar a entrar a la edición del evento entero para añadir una tarea o borrarla es una fricción crítica y antinatural.
- **Acción mínima requerida:** Añadir botón «+ Agregar tarea» en el `EventDetailContent` que abra `AddSubtaskDialog`, y sumar «Eliminar tarea» al menú desplegable de `EventTaskCard`.

### 2. Eliminar la falsa obligatoriedad de subtareas en la creación de eventos
- **Por qué es prioritario:** Constituye una barrera de entrada que causa abandono en la creación de eventos.
- **Acción mínima requerida:** Convertir la sección «Crear tarea» en un acordeón opcional secundario dentro de `EventForm`, quitando asteriscos de obligatoriedad en dicha tarjeta.

### 3. Restaurar las tarjetas de resumen métrico en dispositivos móviles
- **Por qué es prioritario:** En móvil el usuario pierde la visibilidad del estado de sus tareas (vencidas, hoy, próximas), degradando la utilidad del panel principal.
- **Acción mínima requerida:** Reemplazar el bloque `md:hidden` por un formato de tarjetas compactas o chips numéricos que muestren el conteo de tareas urgentes.

### 4. Resolver la inconsistencia de interacción y navegación en las tarjetas de «Hoy»
- **Por qué es prioritario:** Hacer clic en una tarjeta de tarea en «Hoy» saca al usuario de su flujo diario sin previo aviso.
- **Acción mínima requerida:** Abrir detalles inline o en un modal ligero dentro de «Hoy», y unificar el icono del menú de acciones a `•••` (`MoreHorizontal`) eliminando el engranaje engañoso.

### 5. Sanitizar la microcopia técnica eliminando menciones a proveedores internos («Clerk»)
- **Por qué es prioritario:** Daña la confianza y credibilidad de la aplicación frente al usuario final.
- **Acción mínima requerida:** Reemplazar las cadenas que contienen "Clerk" en `SettingsPage.tsx` y `SecurityPage.tsx` por términos universales ("tu cuenta", "tu perfil").
