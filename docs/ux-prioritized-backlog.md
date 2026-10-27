# Backlog Priorizado de Remediación UX/UI: Eventger

**Documento:** Backlog de Ingeniería de Producto, Diseño de Interacción y Accesibilidad<br>
**Origen:** Auditoría Senior de Producto UX/UI Basada en Evidencia (`docs/ux-senior-product-audit.md`)<br>
**Fecha:** 26 de Octubre de 2026<br>
**Clasificación de Prioridad:** P1 (Crítico) | P2 (Alto / Estructural) | P3 (Medio) | P4 (Bajo / Pulido)<br>
**Marco de Estimación de Esfuerzo:** T-Shirt Sizing (S = 1–2 días, M = 3–5 días, L = 1–2 sprints)<br>

---

## 1. Resumen Ejecutivo del Backlog

Este backlog traduce los hallazgos empíricos de usabilidad y los diagnósticos heurísticos de la auditoría senior en **tickets técnicos accionables, defendibles y con criterios de aceptación verificables**.

```
┌──────────────┬─────────────────────────────────────────────────────────────────┬───────────┬─────────┬─────────┐
│ Ticket ID    │ Título del Ticket                                               │ Prioridad │ Impacto │ Esfuerzo│
├──────────────┼─────────────────────────────────────────────────────────────────┼───────────┼─────────┼─────────┤
│ TKT-CAP-01   │ Asistente de diagnóstico y rebalanceo multifecha de capacidad   │ **P1**    │ Crítico │ L       │
│ TKT-ORD-01   │ Transparencia heurística de ordenación y destacados en Hoy      │ **P1**    │ Crítico │ S       │
│ TKT-POS-01   │ Acción directa "Posponer / En espera" en menú contextual        │ **P2**    │ Alto    │ M       │
│ TKT-ACT-01   │ Simetría de acciones: Integrar "Editar detalles" en Hoy         │ **P2**    │ Alto    │ S       │
│ TKT-FIL-01   │ Filtro por fecha específica y sección "Completadas hoy" en Hoy  │ **P2**    │ Alto    │ M       │
│ TKT-DUR-01   │ Claridad semántica de unidad en Duración Estimada               │ **P2**    │ Alto    │ S       │
│ TKT-ESC-01   │ Buscador textual y ordenación por fecha en lista de eventos     │ **P2**    │ Alto    │ M       │
│ TKT-ERR-01   │ Asistente de reubicación de tareas al adelantar fecha de evento │ **P3**    │ Medio   │ M       │
│ TKT-RIG-01   │ Soporte de horas remanentes en tareas en progreso               │ **P3**    │ Medio   │ L       │
│ TKT-ACC-01   │ Corrección de ratio de contraste WCAG 1.4.11 en barras neutrales│ **P4**    │ Bajo    │ S       │
└──────────────┴─────────────────────────────────────────────────────────────────┴───────────┴─────────┴─────────┘
```

---

## 2. Categorización Estratégica del Backlog

### 2.1 Quick Wins (Bajo Esfuerzo / Alto Beneficio Inmediato)
* **TKT-DUR-01:** Rótulo `Duración estimada (horas) *` y placeholder `ej. 1,5 h` en formularios de subtareas.
* **TKT-ACC-01:** Actualización del token de contraste a `#667085` en acentos laterales de tareas pospuestas.
* **TKT-ORD-01:** Chip informativo de ordenación en `TodayPage.tsx` (*"Ordenadas por fecha y menor duración"*).
* **TKT-ACT-01:** Exponer la acción "Editar detalles" en `TodayTaskActionsMenu.tsx`.

### 2.2 Mejoras Estructurales (Patrones Compartidos y Consistencia)
* **TKT-POS-01:** Desacoplar "Posponer / Dejar en espera" del diálogo "Registrar avance", elevándolo al menú contextual.
* **TKT-FIL-01:** Incorporar selector de fecha en `TodayFilters.tsx` y renderizar sección "Completadas hoy".
* **TKT-ESC-01:** Buscador con debounce y ordenación cronológica en catálogo de eventos (`EventsPage.tsx`).

### 2.3 Problemas Críticos (Bloqueos Operativos y Pérdida de Control)
* **TKT-CAP-01:** Reemplazar el error 400 seco de `validate_daily_limit_reduction` con un asistente guiado de diagnóstico multifecha y rebalanceo asistido.
* **TKT-ERR-01:** Rescate guiado al adelantar la fecha de un evento colisionando con subtareas posteriores.

### 2.4 Oportunidades de Simplificación y Reducción de Trabajo Manual
* **TKT-RIG-01:** Registro de horas parciales ejecutadas en compromisos largos sin retener el 100% de la capacidad.

---

## 3. Especificación Detallada de Tickets de Remediación

---

### Ticket TKT-CAP-01: Asistente de Diagnóstico y Rebalanceo Multifecha de Capacidad
* **Épica:** Planificación de Capacidad Diaria y Gestión de Conflictos
* **Prioridad:** **P1 (Crítica)** | **Severidad:** 4 (Catástrofe de Usabilidad)
* **Esfuerzo:** L (Grande — Fullstack) | **Impacto:** Elimina el abandono del 100% observado en pruebas al reducir horas
* **Dependencias:** Endpoint backend `GET /subtasks/overload-check/` (apps/subtasks)
* **Archivos / Componentes:** `DailyLimitDialog.tsx`, `PreferencesForm.tsx`, `usePlanningPreferences.ts`, `apps/subtasks/planning.py`, `apps/subtasks/views.py`
* **Historia de Usuario:**
  > **Como** organizador de eventos con compromisos previamente cargados,<br>
  > **Quiero** reducir mi límite diario de horas disponibles y ver de inmediato qué fechas quedan en conflicto con la lista exacta de tareas causantes,<br>
  > **Para** reprogramar o redistribuir esas tareas desde el mismo asistente sin recibir errores ciegos ni salir a buscarlas a mano en el calendario.

* **Criterios de Aceptación (Gherkin):**
  ```gherkin
  Escenario: Reducción de capacidad sin conflictos
    Dado que el usuario tiene un límite de 6 horas y ninguna fecha futura suma más de 4 horas
    Cuando ingresa "4" en el diálogo de horas disponibles y pulsa "Guardar"
    Entonces el nuevo límite se persiste inmediatamente en el servidor
    Y el modal se cierra mostrando una confirmación de éxito.

  Escenario: Detección y diagnóstico multifecha de sobrecarga
    Dado que el usuario tiene tareas que suman 5 h el 24 de octubre y 5,5 h el 28 de octubre
    Cuando intenta cambiar su límite a 4 horas
    Entonces el modal no se cierra ni muestra un error de servidor
    Y la vista cambia a "Diagnóstico de sobrecarga"
    Y se listan claramente ambas fechas: "24 de octubre (exceso: 1,0 h)" y "28 de octubre (exceso: 1,5 h)"
    Y bajo cada fecha se listan las tareas específicas con sus horas estimadas.

  Escenario: Reprogramación directa desde el asistente
    Dado que el usuario se encuentra en la pantalla de diagnóstico de sobrecarga
    Cuando pulsa el botón "Reprogramar" junto a una tarea causante
    Entonces se abre el diálogo de reprogramación enfocado en esa tarea
    Y al mover la tarea a una fecha disponible, el diagnóstico se recalcula en tiempo real
    Y cuando todas las fechas quedan en <= 4 h, se habilita el botón "Confirmar y guardar límite".
  ```

* **Especificaciones de UX Writing:**
  * *Título de vista de diagnóstico:* `Reorganiza tus tareas antes de reducir el límite`
  * *Texto descriptivo:* `Para establecer tu disponibilidad en 4 horas al día, necesitas mover algunas tareas de los siguientes días sobrecargados:`
  * *Botón primario habilitado:* `Guardar límite de 4 h`

* **Riesgos y Mitigación:**
  * *Riesgo:* Inconsistencia en concurrencia si otra pestaña modifica una tarea simultáneamente.
  * *Mitigación:* Revalidación transaccional atómica en backend antes de hacer commit de la preferencia.

---

### Ticket TKT-ORD-01: Transparencia Heurística de Ordenación y Destacados en Hoy
* **Épica:** Agenda Diaria y Prevención de Omisiones
* **Prioridad:** **P1 (Crítica)** | **Severidad:** 3 (Problema Mayor)
* **Esfuerzo:** S (Pequeño — Frontend) | **Impacto:** Previene el riesgo de omisión de compromisos urgentes observado en Participante 3
* **Dependencias:** Ninguna (componentes de UI en frontend)
* **Archivos / Componentes:** `TodayPage.tsx`, `TodayPriorityGuide.tsx`, `today.service.ts`, `EventTaskCard.tsx`
* **Historia de Usuario:**
  > **Como** usuario que inicia su jornada laboral revisando la vista Hoy,<br>
  > **Quiero** comprender de un vistazo bajo qué criterio están ordenadas mis tareas y ver destacadas de forma inequívoca las que corresponden al día de hoy,<br>
  > **Para** no cometer errores de priorización ni pasar por alto compromisos inmediatos.

* **Criterios de Aceptación (Gherkin):**
  ```gherkin
  Escenario: Visualización del criterio de ordenación activo
    Dado que el usuario carga la vista Hoy con múltiples tareas para el día
    Cuando visualiza la sección "Para hoy"
    Entonces observa un chip sutil en la cabecera: "Ordenadas por menor duración estimada"
    Y un icono informativo explica: "Te sugerimos atender primero las tareas más breves para liberar tu jornada".

  Escenario: Destacado visual reforzado para tareas de hoy
    Dado que una tarea tiene fecha objetivo igual a la fecha del sistema en Bogotá
    Cuando se renderiza en cualquier listado (Hoy o Detalle de Evento)
    Entonces exhibe un chip ámbar de alto contraste: "Hoy" con fondo #fff7e6 y texto #c2410c
    Y su barra lateral de acento tiene color naranja oscuro #c2410c
    Y en el DOM se ubica arriba de cualquier tarea futura.
  ```

* **Especificaciones de UX Writing:**
  * *Texto explicativo:* `Ordenadas por fecha y menor duración estimada (técnica Quick Wins).`

---

### Ticket TKT-POS-01: Acción Directa "Posponer / Dejar en Espera" en Menú Contextual
* **Épica:** Gestión de Ciclo de Vida de Compromisos
* **Prioridad:** **P2 (Alta / Estructural)** | **Severidad:** 3 (Problema Mayor)
* **Esfuerzo:** M (Mediano — Frontend) | **Impacto:** Eleva la autonomía del 0% actual al 100% al pausar compromisos
* **Dependencias:** Ninguna (soporte de estado `postponed` existente en backend)
* **Archivos / Componentes:** `EventTaskCard.tsx`, `TodayTaskActionsMenu.tsx`, `RegisterProgressDialog.tsx`
* **Historia de Usuario:**
  > **Como** organizador de eventos en espera de la confirmación de un tercero (proveedor, cliente o locación),<br>
  > **Quiero** dejar una tarea en espera directamente desde sus opciones con una nota explicativa,<br>
  > **Para** que la tarea deje de consumir horas de mi jornada diaria sin tener que marcarla falsamente como terminada.

* **Criterios de Aceptación (Gherkin):**
  ```gherkin
  Escenario: Posponer tarea desde el menú de acciones
    Dado que el usuario identifica una tarea en estado pendiente en la vista Hoy o en el Evento
    Cuando despliega el menú "Acciones" de la tarjeta y hace clic en "Dejar en espera (Posponer)"
    Entonces se abre un diálogo modal enfocado titulado "Dejar tarea en espera"
    Y se le solicita obligatoriamente el motivo de la espera en un campo de texto
    Y se le indica: "Esta tarea saldrá de tu carga diaria hasta que decidas reanudarla".

  Escenario: Confirmación de posposición exitosa
    Dado que el usuario ingresó la nota "Esperando cotización de transporte" y pulsó "Confirmar espera"
    Cuando la API responde exitosamente
    Entonces la tarjeta adopta el estilo pospuesto (chip gris "Pospuesta", texto "Sin fecha")
    Y las horas de la tarea se descuentan de la carga horaria planificada del día.
  ```

* **Especificaciones de UX Writing:**
  * *Opción de menú:* `Dejar en espera (Posponer)` con icono `Pause`.
  * *Título del modal:* `Pausar tarea temporalmente`
  * *Texto de ayuda:* `La tarea no contará en tu límite de horas diarias hasta que le asignes una nueva fecha.`

---

### Ticket TKT-ACT-01: Simetría de Acciones: Integrar "Editar Detalles" en Hoy
* **Épica:** Coherencia y Flexibilidad de Navegación
* **Prioridad:** **P2 (Alta)** | **Severidad:** 2 (Fricción Menor)
* **Esfuerzo:** S (Pequeño — Frontend) | **Impacto:** Ahorra 3 pasos de navegación al corregir nombres o notas
* **Dependencias:** `EditSubtaskDialog.tsx`
* **Archivos / Componentes:** `TodayTaskActionsMenu.tsx`, `TodayPage.tsx`
* **Historia de Usuario:**
  > **Como** usuario que despacha su jornada en la pantalla Hoy,<br>
  > **Quiero** poder editar el nombre, las horas o las notas de una tarea desde el menú de acciones de Hoy,<br>
  > **Para** no tener que abandonar mi agenda diaria y entrar al evento solo para cambiar un detalle textual.

* **Criterios de Aceptación (Gherkin):**
  ```gherkin
  Escenario: Editar tarea desde la vista Hoy
    Dado que el usuario está en la página Hoy
    Cuando abre el menú de acciones de una tarea y selecciona "Editar detalles"
    Entonces se despliega el diálogo "EditSubtaskDialog" prellenado con los datos actuales
    Y al guardar cambios, la tarjeta en Hoy se actualiza reactivamente sin recargar la página.
  ```

---

### Ticket TKT-FIL-01: Filtro por Fecha y Sección "Completadas Hoy" en Hoy
* **Épica:** Consulta y Auditoría de Productividad
* **Prioridad:** **P2 (Alta)** | **Severidad:** 2 (Problema Menor)
* **Esfuerzo:** M (Mediano — Fullstack) | **Impacto:** Cierre perceptual de jornada y consulta retrospectiva
* **Dependencias:** `TodayFilters.tsx`, `TodayPage.tsx`, `today.service.ts`
* **Historia de Usuario:**
  > **Como** usuario que finaliza su turno de trabajo,<br>
  > **Quiero** ver las tareas que completé hoy al seleccionar el filtro "Todos" y poder consultar compromisos de una fecha puntual,<br>
  > **Para** verificar mi productividad y revisar qué actividades tengo planificadas en una fecha concreta.

* **Criterios de Aceptación (Gherkin):**
  ```gherkin
  Escenario: Visualización de completadas con filtro Todos
    Dado que el usuario completó 2 tareas durante el día actual
    Cuando selecciona el filtro de estado "Todos" en Hoy
    Entonces visualiza una sección final titulada "Completadas hoy (2)"
    Y las tarjetas se presentan con estilo atenuado y marca verde de verificación.

  Escenario: Filtrado por fecha arbitraria
    Dado que el usuario necesita revisar la carga del 30 de octubre
    Cuando selecciona esa fecha en el selector de calendario de los filtros
    Entonces la lista se acota a los compromisos de ese día con su total de horas acumuladas.
  ```

---

### Ticket TKT-DUR-01: Claridad Semántica de Unidad en Duración Estimada
* **Épica:** Prevención de Errores en Formularios
* **Prioridad:** **P2 (Alta)** | **Severidad:** 2 (Fricción de Entrada)
* **Esfuerzo:** S (Pequeño — Frontend) | **Impacto:** Elimina vacilaciones de 100% de usuarios noveles
* **Dependencias:** Ninguna
* **Archivos / Componentes:** `AddSubtaskDialog.tsx`, `EditSubtaskDialog.tsx`, `EventForm.tsx`
* **Historia de Usuario:**
  > **Como** usuario que crea o edita un compromiso,<br>
  > **Quiero** ver de forma explícita que el tiempo de dedicación se mide en horas con soporte para decimales,<br>
  > **Para** no dudar sobre si escribir minutos o días y evitar errores de validación.

* **Criterios de Aceptación (Gherkin):**
  ```gherkin
  Escenario: Rótulo de duración autoexplicativo
    Dado que el usuario abre cualquier formulario de creación o edición de subtareas
    Cuando visualiza el campo numérico de esfuerzo
    Entonces el label dice: "Duración estimada (horas) *"
    Y el placeholder muestra: "ej. 1,5"
    Y un texto auxiliar aclara: "Indica el tiempo en horas (ej. 1,5 h equivale a 1 hora y 30 min)".
  ```

---

### Ticket TKT-ESC-01: Buscador Textual y Ordenación en Catálogo de Eventos
* **Épica:** Escalabilidad y Localización de Información
* **Prioridad:** **P2 (Alta)** | **Severidad:** 2 (Escalabilidad)
* **Esfuerzo:** M (Mediano — Fullstack) | **Impacto:** Permite gestionar decenas de eventos sin fricción de paginación
* **Dependencias:** Backend `apps/events/views.py` (soporte de query param `?search=`)
* **Archivos / Componentes:** `EventsPage.tsx`, `event.service.ts`, `apps/events/views.py`
* **Historia de Usuario:**
  > **Como** organizador que administra más de 20 eventos académicos o sociales,<br>
  > **Quiero** escribir parte del nombre de un evento en una barra de búsqueda,<br>
  > **Para** encontrarlo inmediatamente sin tener que hojear 4 o 5 páginas secuenciales.

* **Criterios de Aceptación (Gherkin):**
  ```gherkin
  Escenario: Búsqueda rápida de eventos
    Dado que existen 30 eventos registrados
    Cuando el usuario teclea "Laura" en la barra de búsqueda de /eventos
    Entonces tras 300 ms de pausa se filtran reactivamente los eventos que contengan "Laura"
    Y se preserva el conteo total de resultados coincidentes.
  ```

---

### Ticket TKT-ERR-01: Asistente de Reubicación al Adelantar Fecha de Evento
* **Épica:** Tolerancia a Errores en Operaciones Compuestas
* **Prioridad:** **P3 (Media)** | **Severidad:** 3 (Problema Mayor Ocasional)
* **Esfuerzo:** M (Mediano — Fullstack) | **Impacto:** Ahorra hasta 15 clics manuales al reprogramar eventos
* **Dependencias:** Endpoint de actualización en bloque de subtareas
* **Archivos / Componentes:** `EditEventForm.tsx`, `apps/events/views.py`
* **Historia de Usuario:**
  > **Como** usuario que debe adelantar la fecha de realización de un evento,<br>
  > **Quiero** que el sistema me ofrezca reubicar automáticamente las tareas que quedarían por fuera en la nueva fecha límite,<br>
  > **Para** no tener que cancelar la edición, buscar cada tarea en el detalle y moverlas manualmente una a una.

* **Criterios de Aceptación (Gherkin):**
  ```gherkin
  Escenario: Detección de tareas posteriores y confirmación de ajuste
    Dado que un evento para el 30 de noviembre tiene 3 tareas programadas para el 28 de noviembre
    Cuando el usuario intenta cambiar la fecha del evento al 20 de noviembre
    Entonces el sistema muestra un diálogo de confirmación: "3 tareas quedan fuera del nuevo plazo"
    Y ofrece el botón: "Mover estas tareas al 20 de noviembre y guardar".
  ```

---

### Ticket TKT-RIG-01: Soporte de Horas Remanentes en Tareas en Progreso
* **Épica:** Flexibilidad en Modelo Temporal
* **Prioridad:** **P3 (Media)** | **Severidad:** 2 (Rigidez de Modelo)
* **Esfuerzo:** L (Grande — Backend / Modelo de Datos) | **Impacto:** Libera capacidad de agenda real
* **Dependencias:** Migración de base de datos (`hours_remaining` en modelo `Subtask`)
* **Archivos / Componentes:** `RegisterProgressDialog.tsx`, `apps/subtasks/models.py`, `apps/subtasks/planning.py`
* **Historia de Usuario:**
  > **Como** usuario que trabajó parcialmente en una tarea de 6 horas,<br>
  > **Quiero** indicar que la tarea está en progreso y que solo le quedan 2 horas pendientes para hoy,<br>
  > **Para** que mi capacidad diaria no quede bloqueada artificialmente con las 6 horas completas.

---

### Ticket TKT-ACC-01: Corrección de Contraste WCAG 1.4.11 en Barra de Tareas Pospuestas
* **Épica:** Accesibilidad Universal (WCAG 2.2 AA)
* **Prioridad:** **P4 (Baja / Pulido Accesible)** | **Severidad:** 1 (Problema Cosmético / Concurrencia AA)
* **Esfuerzo:** S (Inmediato — Frontend) | **Impacto:** Cumplimiento total de contraste no textual $\ge 3.0:1$
* **Dependencias:** Ninguna
* **Archivos / Componentes:** `EventTaskCard.tsx` (`STATUS_ACCENTS.postponed`)
* **Historia de Usuario:**
  > **Como** persona con baja agudeza visual que utiliza la aplicación en ambientes iluminados,<br>
  > **Quiero** que la barra indicadora de tareas pospuestas tenga suficiente contraste contra el fondo blanco,<br>
  > **Para** distinguir inmediatamente su estado gráfico sin esfuerzo perceptual.

* **Criterios de Aceptación (Gherkin):**
  ```gherkin
  Escenario: Verificación de contraste no textual
    Dado el indicador lateral de una tarea pospuesta en EventTaskCard
    Cuando se mide el ratio de contraste frente al fondo blanco #ffffff
    Entonces el ratio debe ser igual o superior a 3.0:1 (color #667085, ratio 4.52:1).
  ```

---

## 4. Matriz de Dependencias y Plan de Sprints

```
SPRINT 1 (Quick Wins y Claridad Léxica):
  ├── TKT-DUR-01 (Unidad de horas)
  ├── TKT-ORD-01 (Destacados y chip de orden en Hoy)
  ├── TKT-ACT-01 (Editar detalles en Hoy)
  └── TKT-ACC-01 (Contraste WCAG)

SPRINT 2 (Descubribilidad de Estados y Filtros):
  ├── TKT-POS-01 (Acción directa Posponer)
  └── TKT-FIL-01 (Completadas en Hoy y filtro de fecha)

SPRINT 3 (Escalabilidad y Navegación):
  ├── TKT-ESC-01 (Buscador de eventos)
  └── TKT-ERR-01 (Asistente de adelanto de evento)

SPRINT 4 (Planificación Profunda y Capacidad):
  ├── TKT-CAP-01 (Asistente de diagnóstico de capacidad multifecha)
  └── TKT-RIG-01 (Horas remanentes en progreso)
```
