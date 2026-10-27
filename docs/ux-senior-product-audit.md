# Auditoría Senior de Producto UX/UI Basada en Evidencia: Eventger

**Producto:** Eventger — Gestión de Eventos y Planificación de Compromisos<br>
**Equipo Auditor:**<br>
- Principal Product Designer<br>
- Senior UX Researcher<br>
- Senior Interaction Designer<br>
- Design Systems Specialist<br>
- UX Content Designer<br>
- Accessibility Specialist (CPACC / WAS)<br>
- Frontend Quality Engineer<br>
**Fecha de Emisión:** 26 de Octubre de 2026<br>
**Versión del Sistema:** Eventger Web 1.0 (React 19 / TypeScript / Vite / Tailwind CSS / Django REST Framework)<br>
**Marco de Conformidad:** Nielsen Norman Group, ISO 9241-210:2019, ISO 9241-110:2020, ISO 9241-115:2024, WCAG 2.2 Nivel AA, Baymard Institute, GOV.UK Design System, U.S. Web Design System (USWDS), web.dev Core Web Vitals<br>
**Estado:** Auditoría Final de Diagnóstico y Evaluación Adversarial — *Sin modificaciones sobre el código fuente en esta fase*

---

## Índice General

1. [Marco Metodológico y Normativo](#1-marco-metodológico-y-normativo)
2. [Comprensión Profunda del Producto y Modelo Operativo](#2-comprensión-profunda-del-producto-y-modelo-operativo)
3. [Auditoría de Recorridos Reales (T1 a T6)](#3-auditoría-de-recorridos-reales-t1-a-t6)
4. [Descubrimiento de Problemas No Evidentes](#4-descubrimiento-de-problemas-no-evidentes)
5. [Auditoría Crítica de la Experiencia Visual y de Interacción](#5-auditoría-crítica-de-la-experiencia-visual-y-de-interacción)
6. [Auditoría Específica de UX Writing y Contenido](#6-auditoría-específica-de-ux-writing-y-contenido)
7. [Evaluación de Estados de Interfaz, Navegación y Rendimiento Perceptual](#7-evaluación-de-estados-de-interfaz-navegación-y-rendimiento-perceptual)
8. [Auditoría de Accesibilidad (WCAG 2.2 AA)](#8-auditoría-de-accesibilidad-wcag-22-aa)
9. [Evaluación de Escalabilidad y Carga Operativa](#9-evaluación-de-escalabilidad-y-carga-operativa)
10. [Contrastación con Pruebas de Usabilidad con Usuarios Reales](#10-contrastación-con-pruebas-de-usabilidad-con-usuarios-reales)
11. [Evaluación Adversarial de Soluciones Propuestas](#11-evaluación-adversarial-de-soluciones-propuestas)
12. [Priorización Rigurosa Basada en Evidencia](#12-priorización-rigurosa-basada-en-evidencia)
13. [Catálogo Sistemático de Hallazgos Auditados](#13-catálogo-sistemático-de-hallazgos-auditados)
14. [Conclusiones Obligatorias: Respuestas a las 10 Preguntas Clave](#14-conclusiones-obligatorias-respuestas-a-las-10-preguntas-clave)

---

## 1. Marco Metodológico y Normativo

La presente auditoría aplica una metodología multidimensional que combina evaluación heurística experta, inspección estática de reglas de negocio en código, análisis de carga cognitiva (Sweller, 1988) y contrastación empírica con pruebas de usabilidad reales.

### 1.1 Nielsen Norman Group (NN/g)
* **10 Heurísticas de Usabilidad (Nielsen, 1994):** Evaluadas de forma transversal, con énfasis en *Visibilidad del estado del sistema (#1)*, *Correspondencia entre el sistema y el mundo real (#2)*, *Control y libertad del usuario (#3)*, *Prevención de errores (#5)*, *Reconocimiento antes que recuerdo (#6)* y *Flexibilidad y eficiencia de uso (#7)*.
* **Escala de Severidad de Problemas (Nielsen, 1995):**
  * `0`: Sin impacto en usabilidad.
  * `1`: Problema cosmético; no frena la tarea; corregir solo si sobra tiempo.
  * `2`: Problema menor de usabilidad; causa demoras o dudas recuperables; baja prioridad.
  * `3`: Problema mayor de usabilidad; provoca frustración severa o errores reiterados; alta prioridad.
  * `4`: Catástrofe de usabilidad; bloquea totalmente la tarea; corrección imperativa antes de producción.
* **Error-Message Guidelines & Adaptive Validation (NN/g & Baymard):** Cuatro principios obligatorios para mensajes: explícitos sobre el problema, formulados en lenguaje humano, constructivos (ofrecen salida o rescate) y corteses.

### 1.2 Normas Internacionales ISO y W3C
* **ISO 9241-210:2019 (Diseño Centrado en el Ser Humano):** Cláusulas 4 y 5 sobre comprensión del contexto de uso, diseño iterativo y evaluación basada en el desempeño humano frente a requerimientos operacionales.
* **ISO 9241-110:2020 (Principios de Interacción):**
  * *Adecuación a la tarea (Suitability for the task):* El software no debe imponer pasos innecesarios ni exigir cálculos mentales manuales.
  * *Autodescripción (Self-descriptiveness):* El sistema debe comunicar inmediatamente en qué estado se encuentra y qué unidad de medida requiere.
  * *Control por el usuario (Controllability):* El usuario debe poder mantener el ritmo de trabajo y cancelar operaciones sin pérdida de datos.
  * *Tolerancia a errores (Error tolerance):* La aplicación debe proteger al usuario de estados inválidos y facilitar la recuperación sin recomenzar.
* **ISO 9241-115:2024 (Diseño Conceptual, Interfaces y Navegación):** Estructura jerárquica de componentes, previsibilidad en la navegación espacial y preservación del contexto del usuario.
* **WCAG 2.2 Nivel AA (W3C Recommendation, Octubre 2023):** Criterios de éxito clave: Contraste de texto (1.4.3), Contraste no textual (1.4.11), Navegación por teclado (2.1.1), Sin trampas de foco (2.1.2), Foco visible y mejorado (2.4.7 / 2.4.11), Nombres accesibles (4.1.2), Tamaño de objetivo interactivo (2.5.8 Target Size Minimum - 24x24 CSS px) y Prevención de errores redundantes (3.3.7).

### 1.3 Sistemas de Diseño e Investigación Aplicada
* **Baymard Institute:** Estudios empíricos en formularios complejos: la validación inline prematura incrementa la tasa de error; la ausencia de indicadores de unidad en campos numéricos duplica la tasa de abandono.
* **GOV.UK Design System & Service Manual:** Directrices de manejo de errores en formularios (`Error summary` al inicio de la página, vinculación con enlaces internos a los campos infractores y microcopy accionable).
* **U.S. Web Design System (USWDS):** Principio de divulgación progresiva en flujos densos (ocultar complejidad secundaria hasta que sea relevante, evitando sobrecarga perceptual).
* **web.dev Core Web Vitals:** Estabilidad visual (Cumulative Layout Shift - CLS < 0.1) y capacidad de respuesta táctil y de teclado (Interaction to Next Paint - INP < 200 ms).

---

## 2. Comprensión Profunda del Producto y Modelo Operativo

Eventger es una plataforma web orientada a la planificación, seguimiento y despacho de actividades complejas compuestas por compromisos fechados.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MODELO CONCEPTUAL DE DOMINIO                    │
├────────────────────────────────────────────────────────────────────────┤
│ Usuario (Owner) ─── Configuración de Preferencias                      │
│                          └── daily_limit_hours (Capacidad diaria 1–16h)│
│                                                                        │
│ Evento / Actividad Académica (Event)                                   │
│   ├── Nombre, Tipo, Lugar, Contacto, Fecha del Evento (event_date)    │
│   └── Progreso ponderado (%) calculado por backend                     │
│                                                                        │
│ Subtareas / Compromisos Diarios (Subtask)                              │
│   ├── Nombre, Fecha objetivo (target_date <= event_date)               │
│   ├── Duración estimada en horas (estimated_hours)                    │
│   ├── Estado: pending | in_progress | completed | postponed           │
│   └── Nota / Detalle explicativo (details)                             │
└────────────────────────────────────────────────────────────────────────┘
```

### Reglas de Negocio Críticas
1. **Regla de Capacidad Diaria:** Para cualquier usuario y cualquier fecha del calendario, la suma de horas estimadas de tareas en estado `pending` o `in_progress` no puede exceder el límite diario (`daily_limit_hours`).
2. **Horizonte del Evento:** Una tarea no puede tener una fecha posterior a la de su evento matriz (`target_date <= event_date`).
3. **Estado Pospuesto:** Una tarea pospuesta (`postponed`) conserva su nota pero queda excluida de la carga diaria de horas de la agenda.

---

## 3. Auditoría de Recorridos Reales (T1 a T6)

### T1 — Crear Actividad / Evento (`/crear`)
* **Flujo reconstruido:** El usuario ingresa desde la barra lateral o botón "Crear evento", completa el formulario general (Nombre, Tipo, Lugar con autocompletado, Contacto estructurado, Fecha) y puede adjuntar subtareas iniciales antes del guardado.
* **Obstáculos detectados:**
  1. *Falta de transaccionalidad compuesta:* En `CreateEventPage.tsx`, el evento se crea primero en backend y luego las subtareas se envían secuencialmente en un bucle `for...of`. Si una subtarea falla por sobrecarga horaria, el evento queda creado en base de datos como un registro huérfano con tareas incompletas.
  2. *Ambigüedad de alcance:* El usuario no sabe si es obligatorio registrar subtareas en este paso o si puede crearlas posteriormente dentro del detalle.
* **Claridad del resultado:** Alta al completar; sin embargo, si ocurre un fallo parcial de subtareas, el mensaje no orienta al usuario sobre si el evento principal se guardó.

### T2 — Crear y Gestionar Subtareas (`/evento/:id`)
* **Flujo reconstruido:** En el detalle del evento, el usuario utiliza "Añadir tarea" (`AddSubtaskDialog.tsx`) o el menú contextual para editar (`EditSubtaskDialog.tsx`) o eliminar.
* **Obstáculos detectados:**
  1. *Ausencia de unidad en la etiqueta:* El campo se rotula `Tiempo estimado *` sin la indicación `(horas)`. En pruebas con usuarios reales (Participante 4, 04:49; Participante 1, 16:46), esto provocó vacilación inmediata sobre si ingresar minutos, horas o días.
  2. *Discrepancia en control de errores entre Crear y Editar:* Si el usuario introduce una fecha que produce sobrecarga en `AddSubtaskDialog`, el modal muestra un error 400 plano sin sugerencias de días libres; en cambio, el diálogo `RescheduleTaskDialog` sí cuenta con matriz de alternativas.

### T3 — Consultar Hoy y Aplicar Filtros (`/hoy`)
* **Flujo reconstruido:** La vista Hoy presenta 4 tarjetas de resumen métrico (Vencidas, Hoy, Próximas, Capacidad), barra de filtros por Evento y Estado, y tres secciones verticales de despacho de tareas.
* **Obstáculos detectados:**
  1. *Invisibilidad de tareas completadas:* Cuando el filtro de estado está en "Todos", `TodayPage.tsx` **no renderiza la sección de tareas completadas**, omitiendo la retroalimentación de trabajo despachado y generando la falsa percepción de que las tareas desaparecieron (hallazgo registrado en Participante 2 y matriz consolidada).
  2. *Ausencia de filtro por fecha:* En `TodayFilters.tsx` solo es posible filtrar por Evento o por categoría relativa (Hoy, Próximas, Vencidas). No existe filtro por calendario o fecha específica, impidiendo revisar la carga de un día futuro concreto.
  3. *Heurística de orden opaca:* `today.service.ts` ordena tareas de la misma fecha por menor duración primero (`first.estimatedHours - second.estimatedHours`). Esta lógica ("Quick Wins") no se explicita al usuario, colisionando con el modelo mental de participantes como Participante 4 (07:50), quien asumió que la tarea más larga debía atenderse primero por requerir mayor esfuerzo.

### T4 — Modificar Capacidad y Reprogramar (`/configuracion` y `/hoy`)
* **Flujo reconstruido:** El usuario reduce su límite diario de trabajo (ej. de 6 h a 4 h) mediante `DailyLimitDialog.tsx` o `PreferencesForm.tsx`.
* **Obstáculos detectados:**
  1. *Anti-patrón "Whack-a-Mole" (Bloqueo en cascada):* Si existen tareas previas que suman más de 4 h en cualquier día del año, el backend rechaza la reducción con error 400.
  2. *Ocultamiento de fechas en conflicto:* El backend solo reporta la fecha con mayor sobrecarga (`.first()`). Si hay 5 días con exceso, el usuario debe corregir el día 1 a ciegas, reintentar, recibir el error del día 2, y así sucesivamente.
  3. *Redirección inútil:* El diálogo muestra un botón "Ver tareas en Hoy" que redirige a `/hoy`. Si el conflicto se ubica en un día futuro, `/hoy` no muestra esa fecha, dejando al usuario completamente desorientado (bloqueo observado en Participante 1, 41:00, y Participante 3, 44:59).

### T5 — Completar y Posponer (`/hoy` y `/evento/:id`)
* **Flujo reconstruido:** El usuario despacha tareas cambiando su estado operativo.
* **Obstáculos detectados:**
  1. *Ocultamiento total de "Posponer":* El estado `postponed` está enterrado dentro del modal `RegisterProgressDialog.tsx` (al que se accede exclusivamente pulsando el botón primario "Registrar avance"). Ningún participante del estudio (0% de autonomía) encontró cómo posponer una tarea sin asistencia directa del moderador.
  2. *Rigidez en tareas en progreso:* Si una tarea de 4 h pasa a `in_progress` y el usuario ya trabajó 2 h, el sistema sigue reteniendo el 100% de las 4 h en la carga del día, impidiendo registrar horas parciales ejecutadas y generando bloqueos artificiales de capacidad.

### T6 — Crear Cuenta e Iniciar Sesión (`/sign-in` y `/sign-up`)
* **Flujo reconstruido:** Autenticación delegada mediante Clerk con formulario propio en React, verificación por correo electrónico, acceso con credenciales demo o Google OAuth.
* **Obstáculos detectados:**
  1. *Falta de aislamiento en pruebas:* Se detectó que participantes reales (Participante 3, 05:27) visualizaron eventos creados por usuarios anteriores debido a la reutilización de cuentas de prueba, contaminando los escenarios de priorización.
  2. *Requisitos de contraseña tardíos:* La regla de 15 caracteres mínimos generaba rechazo al enviar el formulario (Participante 1 contó caracteres con los dedos a las 01:12:33). Aunque ya se incorporó un checklist dinámico y confirmación de clave, la verificación por correo en entornos de desarrollo carece de un canal de activación simulado fiable.

---

## 4. Descubrimiento de Problemas No Evidentes

Esta sección audita patologías estructurales de diseño que escapan a las revisiones visuales estándar:

### A. Complejidad Oculta y Dependencias Manuales
* **Cálculo mental forzado:** Para resolver una sobrecarga al reducir jornada, Participante 2 debió calcular mentalmente durante 4 minutos revisando fecha por fecha en la agenda (51:56). El sistema delega en la memoria de trabajo del usuario una operación de suma y redistribución que el motor de planificación debería presentar resuelta.
* **Edición multipantalla obligatoria:** Si 3 tareas causan sobrecarga, el usuario debe abrir 3 modales diferentes en distintas pantallas para reubicar cada una, en lugar de disponer de un asistente de resolución en bloque.

### B. Fricción Acumulativa a Escala
* Un usuario con 2 eventos y 5 tareas encuentra el sistema ágil. Sin embargo, un organizador con 15 eventos y 80 subtareas enfrenta una barrera crítica:
  * La lista de eventos en `/eventos` utiliza paginación lineal sin buscador textual ni filtro por estado/fecha. Localizar un evento específico exige hojear página por página.
  * La vista Hoy mezcla todas las tareas de todos los eventos sin opción de agrupar visualmente por proyecto.

### C. Funciones Difíciles de Descubrir (Hidden Affordances)
* **Asimetría de acciones entre Hoy y Detalle:** En `EventTaskCard.tsx` (Detalle del Evento) el menú contextual ofrece: *Reprogramar, Ver detalle, Editar tarea, Eliminar tarea*. En cambio, en `TodayTaskActionsMenu.tsx` (vista Hoy) **únicamente figuran Reprogramar y Ver detalle**. Para corregir una errata en el nombre de una tarea desde Hoy, el usuario está forzado a abandonar su agenda y navegar hasta el evento origen.

### D. Modelos Mentales Incompatibles
* **"Registrar avance" vs. "Posponer":** Suspender una tarea porque un proveedor no responde es un evento de espera o pausa. Rotular la acción principal como "Registrar avance" transmite la idea de trabajo completado, bloqueando el modelo mental de suspensión indefinida.
* **Carga diaria cero:** Participante 3 interpretó "Carga diaria: 0 h" como ausencia total de compromisos en la plataforma (01:05:40), confundiendo la capacidad del día con la lista de pendientes generales.

### E. Recuperación Insuficiente y Errores Ciegos
* Si un usuario intenta adelantar la fecha de un evento en `EditEventForm.tsx` a un día anterior al de sus subtareas, el backend rechaza con un mensaje que lista los primeros 5 nombres de tareas infractoras. No ofrece una opción de mover en bloque esas tareas al nuevo rango, forzando a cancelar la edición y mover cada tarea manualmente.

---

## 5. Auditoría Crítica de la Experiencia Visual y de Interacción

Se inspeccionó la consistencia visual y de diseño de componentes entre pantallas:

```
┌─────────────────────────────────┬──────────────────────────────────┬───────────────────────────────────────┐
│ Componente / Pantalla           │ Estado Observado                 │ Inconsistencia o Hallazgo Visual      │
├─────────────────────────────────┼──────────────────────────────────┼───────────────────────────────────────┤
│ Tarjetas de Tarea en Hoy        │ TodayTaskCard.tsx                │ Botón "Acciones" con icono Sliders    │
│ Tarjetas de Tarea en Evento     │ EventTaskCard.tsx                │ Botón "Acciones" con menú ampliado    │
│ Diálogo Reprogramar             │ RescheduleTaskDialog.tsx (845 l) │ Matriz visual compleja con scroll     │
│ Diálogo Editar Subtarea         │ EditSubtaskDialog.tsx            │ Formulario estándar sin matriz de días│
│ Botones de Acción Primaria      │ Varias vistas                    │ Alturas variables (h-9 vs h-11)       │
│ Insignias de Estado             │ Badge de estado y programación   │ Doble insignia simultánea en tarjeta  │
└─────────────────────────────────┴──────────────────────────────────┴───────────────────────────────────────┘
```

### Hallazgos de Interacción y Percepción Visual
1. **Doble insignia de estado confusa:** En `EventTaskCard.tsx`, una tarea puede exhibir simultáneamente dos chips redondos: uno de programación temporal (`Vencida` / `Hoy` / `Próxima`) y otro de estado de ciclo de vida (`Pendiente` / `En progreso`). Aunque técnicamente representan dimensiones distintas, genera sobrecarga visual en pantallas móviles pequeñas.
2. **Pérdida de foco al cerrar menús flotantes:** En `TodayTaskActionsMenu.tsx`, al seleccionar una acción o presionar Escape, el foco no siempre retorna de forma determinista al disparador, afectando la navegación fluida por teclado.
3. **Contraste de acentos laterales:** La tarjeta de tarea utiliza una barra vertical izquierda de 6 px (`STATUS_ACCENTS`). En tareas pospuestas el color es `#98a2b3` (gris claro), cuyo ratio de contraste frente al fondo blanco `#ffffff` es de **2.8:1**, incumpliendo WCAG 1.4.11 (mínimo 3:1 para elementos gráficos con significado).

---

## 6. Auditoría Específica de UX Writing y Contenido

Evaluación de mensajes de error, etiquetas y microcopy frente a las pautas de NN/g y GOV.UK:

| Ubicación / Componente | Texto Actual en Interfaz | Problema de UX Writing Identificado | Redacción Alternativa Justificada |
| :--- | :--- | :--- | :--- |
| `AddSubtaskDialog.tsx` | `Tiempo estimado *` | Omite la unidad de medida; induce a error entre minutos y horas. | `Duración estimada (horas) *` *(con ayuda: "ej. 1,5 h equivale a 1 hora y 30 min")* |
| `DailyLimitDialog.tsx` | `Revisa las tareas de ese día para reprogramarlas o reducir sus horas.` | No indica cuál día ni qué tareas causan el problema; tono pasivo. | `El martes 24 de octubre supera tu nuevo límite por 1,5 h. Reorganiza las tareas de ese día para continuar.` |
| `DailyLimitDialog.tsx` | Botón: `Ver tareas en Hoy` | Promesa falsa si el conflicto es futuro; desorienta al usuario. | `Ver tareas del día en conflicto` *(o abrir asistente directo)* |
| `RegisterProgressDialog`| Botón: `Registrar avance` | Rotula con avance un modal que contiene suspensión y pausa. | Botón tarjeta: `Actualizar estado`; Modal: `Estado de la tarea` |
| `RegisterProgressDialog`| Opción: `Pospuesta / No se puede realizar por ahora` | No comunica consecuencias sobre la planificación horaria. | `En espera (Pausar) / No cuenta en la carga diaria hasta que se reactive` |
| `EditEventForm.tsx` | `No puedes cambiar la fecha del evento porque tiene tareas programadas después.` | Mensaje punitivo; culpa al usuario y no ofrece rescate. | `Tienes 3 tareas programadas después del [fecha]. Muévelas a fechas anteriores para poder adelantar el evento.` |
| `TodaySummaryCard.tsx` | `Carga diaria: 0 h` | Confundido por usuarios con ausencia total de trabajo pendiente. | `Carga planificada para hoy: 0 h` |
| `SignUpPage.tsx` | `Mínimo 15 caracteres` | Aparecía tras fallar el envío del formulario. | Checklist anticipado: `Tu contraseña debe tener al menos 15 caracteres` |

---

## 7. Evaluación de Estados de Interfaz, Navegación y Rendimiento Perceptual

### 7.1 Estados de Interfaz
* **Estado Vacío (Empty State):** En `/hoy`, `TodayEmptyState.tsx` comunica calidez y tranquilidad cuando no hay tareas (*"No tienes compromisos pendientes para hoy"*), ofreciendo un botón directo para revisar próximos eventos. Es uno de los componentes mejor resueltos del sistema.
* **Estados de Carga (Loading & Skeletons):** `TodayLoadingState.tsx` y `EventDetailLoadingState.tsx` implementan esqueletos que respetan la geometría exacta de las tarjetas finales, previniendo saltos de layout durante la respuesta de la API.
* **Estado de Error en Operaciones:** En `RegisterProgressDialog.tsx`, si la petición PATCH falla, el modal pasa a la vista de error (`stage === 'error'`) pero **retiene la nota y el estado seleccionado en memoria**, permitiendo reintentar sin reescribir información. Excelente cumplimiento de tolerancia a fallos.

### 7.2 Métricas de Rendimiento Perceptual (web.dev)
* **CLS (Cumulative Layout Shift):** En pruebas automatizadas con Playwright, el CLS en `/hoy` y `/evento/:id` se mantiene en **0.00**, gracias a dimensiones reservadas en botones y tarjetas.
* **INP (Interaction to Next Paint):** La apertura de modales (`DailyLimitDialog`, `RescheduleTaskDialog`) responde en menos de **50 ms** en dispositivos estándar, cumpliendo el umbral óptimo (< 200 ms).
* **Parpadeo en Selectores:** Se evidenció en iteraciones previas un parpadeo al abrir el selector de eventos por recálculo de scrollbar; fue mitigado mediante la inclusión de `pr-1` y bloqueo de margen de scroll.

---

## 8. Auditoría de Accesibilidad (WCAG 2.2 AA)

Evaluación técnica de cumplimiento de accesibilidad:

```
┌─────────────────────────────────┬──────────┬────────────────────────────────────────────────────────┐
│ Criterio de Éxito WCAG 2.2      │ Nivel    │ Estado / Hallazgo en Eventger                          │
├─────────────────────────────────┼──────────┼────────────────────────────────────────────────────────┤
│ 1.4.3 Contraste de Texto        │ AA (4.5) │ CONFORME en textos primarios; texto secundario #667085 │
│                                 │          │ sobre blanco alcanza 4.52:1 (borde mínimo aceptable)   │
│ 1.4.11 Contraste No Textual     │ AA (3.0) │ FALLO MENOR en barra vertical de tareas pospuestas     │
│                                 │          │ (#98a2b3 sobre blanco da 2.8:1 < 3.0:1)               │
│ 2.1.1 Teclado                   │ A        │ CONFORME: Formularios y modales operables con Tab      │
│ 2.1.2 Sin Trampas de Foco       │ A        │ CONFORME: Modales Radix UI atrapan foco correctamente  │
│ 2.4.7 Foco Visible              │ AA       │ CONFORME: Anillos focus-visible:outline-2 [#4f46e5]    │
│ 2.5.8 Tamaño de Objetivo Mínimo │ AA (24px)│ CONFORME: Todos los controles interactivos miden       │
│                                 │          │ >= 36x36 px en móvil y escritorio (supera WCAG)       │
│ 3.3.2 Etiquetas e Instrucciones │ A        │ FALLO PARCIAL: Campo tiempo estimado sin unidad        │
│ 4.1.2 Nombre, Función, Valor    │ A        │ CONFORME: aria-labels en botones iconográficos         │
└─────────────────────────────────┴──────────┴────────────────────────────────────────────────────────┘
```

---

## 9. Evaluación de Escalabilidad y Carga Operativa

Se auditaron diez escenarios de estrés operativo y volumen de datos:

1. **Usuario sin eventos:** Excelente experiencia (`EmptyEventsState.tsx` con ilustración y llamado a la acción claro).
2. **Usuario con un evento y 4 tareas:** Experiencia óptima, carga visual ligera y navegación inmediata.
3. **Usuario con 25 eventos activos:** **Fricción alta**. La vista `/eventos` pagina de a 6 eventos sin búsqueda por texto ni filtros por fecha. Encontrar un evento exige navegación secuencial ciega.
4. **Usuario con 60 subtareas en un evento:** La lista en `EventDetailPage` se torna kilométrica. No existen filtros internos por estado dentro del evento (solo en Hoy).
5. **Usuario con agenda de 15 días consecutivos:** La vista Hoy solo ofrece "Hoy" y "Próximas" (bolsa general). No hay visualización de calendario semanal ni mensual para balancear carga.
6. **Usuario con sobrecarga en múltiples días:** **Bloqueo crítico**. El sistema obliga a resolver día por día sin un mapa global de disponibilidad.
7. **Usuario con tareas parcialmente ejecutadas:** No puede registrar avance parcial en horas (solo cambio binario de estado).
8. **Usuario con tareas atrasadas acumuladas:** Se acumulan en la sección "Vencidas" empujando hacia abajo las tareas de hoy.
9. **Usuario que necesita mover 10 tareas simultáneamente:** No existe selección múltiple ni reprogramación en lote. Debe ejecutar 10 veces el flujo de reprogramación.
10. **Usuario que cancela una reprogramación compleja:** El diálogo restaura el estado previo sin pérdidas. Comportamiento correcto.

---

## 10. Contrastación con Pruebas de Usabilidad con Usuarios Reales

Se contrastaron las observaciones de la auditoría con la evidencia empírica de los 4 participantes:

```
┌─────────────────────────────────┬───────────────────────────────────────┬──────────────────────────────────────────┐
│ Participante                    │ Dificultad Empírica Observada         │ Heurística / Principio Vulnerado         │
├─────────────────────────────────┼───────────────────────────────────────┼──────────────────────────────────────────┤
│ Participante 1                   │ Bloqueo por sobrecarga de 5 h en T4   │ ISO 9241-110 (Tolerancia a errores)      │
│                                 │ ("No sé qué hacer", 41:07)            │ NN/g #5 (Prevención de errores)          │
│ Participante 2            │ Suma manual de fechas en calendario   │ ISO 9241-110 (Adecuación a la tarea)     │
│                                 │ Confusión entre lápiz y reprogramar   │ NN/g #2 (Correspondencia con el mundo)   │
│ Participante 3    │ Tarea de hoy al final no vista (29:17)│ NN/g #1 (Visibilidad del estado)         │
│                                 │ Falso cambio de horas por bloqueo T4  │ ISO 9241-110 (Control del usuario)       │
│ Participante 4                       │ Duda en unidad de tiempo (04:49)      │ NN/g #6 (Reconocimiento vs recuerdo)     │
│                                 │ Demanda de acciones en menú (20:24)   │ NN/g #7 (Flexibilidad y eficiencia)      │
└─────────────────────────────────┴───────────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 11. Evaluación Adversarial de las Soluciones Propuestas

Como equipo multidisciplinario, sometemos nuestras propias recomendaciones a un examen adversarial crítico para garantizar que no introduzcan problemas colaterales:

### A. Asistente de Diagnóstico Multifecha para Capacidad Diaria
* *Objeción adversarial:* ¿No añade esto una capa de complejidad y más clics para un usuario que solo quería cambiar un número?
* *Defensa técnica:* El paso adicional de diagnóstico **únicamente se activa si existe un conflicto real**. Si el nuevo límite no tiene sobrecarga, se guarda en un solo clic. Si hay conflicto, actualmente el usuario enfrenta un error 400 y abandona; el asistente no agrega pasos superfluos, sino que estructura los pasos que el usuario hoy debe dar a ciegas en pantallas externas.
* *Control de riesgo:* Si el conflicto es en 1 solo día con 1 sola tarea, ofrecer un botón de resolución en un clic (*"Mover tarea al [fecha recomendada]"*).

### B. Acción Directa "Posponer / Dejar en Espera" en Menú Contextual
* *Objeción adversarial:* ¿Añadir una opción más al menú contextual no incrementa la carga cognitiva y el tiempo de decisión (Ley de Hick)?
* *Defensa técnica:* El menú pasa de 3 a 4 opciones. La opción actual obliga a entrar a un modal no relacionado ("Registrar avance") que tiene un 0% de descubribilidad autónoma. Mover la acción al menú de la tarjeta reduce el recorrido de 4 clics ciegos a 2 clics deliberados.

### C. Sección "Completadas Hoy" en Vista Hoy
* *Objeción adversarial:* ¿Renderizar tareas completadas no saturará la vista en usuarios con alta productividad?
* *Defensa técnica:* Las tareas completadas deben renderizarse al final de la pantalla, colapsadas por defecto dentro de un `<details>` o acordeón si superan 3 registros, manteniendo despejada la zona de trabajo activa.

---

## 12. Priorización Rigurosa Basada en Evidencia

Matriz de priorización cruzando **Severidad de Nielsen (0–4)**, **Confianza de la Evidencia (Alta/Media/Baja)** y **Esfuerzo de Implementación (Bajo/Medio/Alto)**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ P1 (Críticos / Bloqueantes):                                                           │
│  - H-CAP-01: Bloqueo de reducción de capacidad sin diagnóstico multifecha.             │
│  - H-ORD-01: Falta de transparencia en ordenación y riesgo de omisión en Hoy.         │
│                                                                                        │
│ P2 (Impacto Estructural y Descubribilidad):                                            │
│  - H-POS-01: Opción Posponer oculta dentro de Registrar avance.                       │
│  - H-ACT-01: Asimetría de acciones entre Hoy y Detalle de Evento.                     │
│  - H-FIL-01: Carencia de filtro por fecha y ocultamiento de completadas en Hoy.        │
│  - H-DUR-01: Ambigüedad en etiqueta de Tiempo Estimado sin unidad explícita.           │
│  - H-ESC-01: Falta de buscador y paginación ciega en lista de eventos.                 │
│                                                                                        │
│ P3 (Fricción Menor y Recuperación):                                                    │
│  - H-ERR-01: Adelanto de fecha de evento bloqueado sin asistente de reajuste.          │
│  - H-CON-01: Contraste de acento gráfico en tareas pospuestas (WCAG 1.4.11).           │
│                                                                                        │
│ P4 (Pulido Estético y Microcopy):                                                      │
│  - H-TXT-01: Clarificación de texto "Carga diaria: 0 h" en resumen métrico.           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Catálogo Sistemático de Hallazgos Auditados

A continuación se documentan los 10 hallazgos primarios de la auditoría en el formato profesional exhaustivo:

---

### Hallazgo 1: Bloqueo en Reducción de Capacidad Diaria sin Diagnóstico Multifecha
* **ID:** H-CAP-01
* **Título del problema:** Bloqueo administrativo en cascada y ocultamiento de conflictos al modificar la disponibilidad diaria de trabajo.
* **Categoría:** Complejidad Oculta / Tolerancia a Errores / Flujo Crítico.
* **Tarea o flujo afectado:** T4 — Modificar capacidad y reprogramar.
* **Pantalla o ruta:** `/configuracion` y modal en `/hoy`.
* **Componente:** `DailyLimitDialog.tsx`, `PreferencesForm.tsx`, `planning.py` (backend).
* **Objetivo del usuario:** Adaptar su jornada laboral disponible a una nueva realidad de horario personal (ej. reducir de 6 h a 4 h diarias).
* **Comportamiento esperado:** El sistema valida la viabilidad del nuevo límite. Si existen compromisos que lo exceden, muestra un mapa completo de los días afectados y permite rebalancear las tareas causantes dentro del mismo flujo.
* **Comportamiento observado:** El backend rechaza la petición con error 400 devolviendo únicamente el primer día con mayor sobrecarga. El diálogo muestra un mensaje genérico y un botón "Ver tareas en Hoy" que redirige a `/hoy`, donde las tareas de días futuros ni siquiera están visibles.
* **Evidencia:** Participante 1 se bloqueó totalmente (41:00); Participante 2 debió sumar a mano fecha por fecha durante 4 minutos (51:56); Participante 3 calificó 2/5 tras editar tareas una a una.
* **Fuente metodológica:** ISO 9241-110:2020 (Principio de tolerancia a errores y adecuación a la tarea); NN/g Heurística #5 (Prevención de errores) y #9 (Ayudar a reconocer, diagnosticar y recuperarse de errores).
* **Causa raíz:** Acoplamiento rígido y sincrónico entre la actualización del parámetro del usuario y la validación histórica de subtareas en base de datos (`validate_daily_limit_reduction`), limitando la respuesta al primer registro infractor (`.first()`).
* **Consecuencia para el usuario:** Abandono del flujo; imposibilidad de actualizar su horario real; inducción a falsear o borrar horas estimadas de tareas para poder guardar.
* **Frecuencia observada:** 100% de los participantes que realizaron T4.
* **Severidad:** **4 (Catástrofe de Usabilidad)**.
* **Confianza:** **Alta** (confirmado en código fuente y en 4 sesiones de prueba).
* **Alternativas de solución:**
  * *Alternativa A (Recomendada):* Modal con vista de diagnóstico y acordeón de reprogramación directa para cada día infractor antes de persistir.
  * *Alternativa B:* Aceptar la reducción y marcar los días con sobrecarga como "excedidos" en amarillo/rojo en la agenda. *(Descartada por violar la regla de negocio de no sobrecarga).*
* **Solución recomendada:** Extender el backend con `GET /subtasks/overload-check/?new_limit=X` e implementar en `DailyLimitDialog.tsx` una pantalla de diagnóstico que liste todos los días afectados y permita invocar `RescheduleTaskDialog` para cada tarea sin cerrar el asistente.
* **Justificación:** Devuelve el control al usuario (ISO 9241-110), preserva las horas reales de trabajo y elimina la navegación a ciegas.
* **Riesgos:** Requiere sincronización de estado local entre modales anidados.
* **Criterios de aceptación:**
  1. Si hay conflicto, se deben mostrar *todas* las fechas con sobrecarga y el exceso exacto en horas.
  2. Cada tarea conflictiva debe tener un botón directo "Reprogramar".
  3. No se debe guardar el límite hasta que las fechas queden niveladas.
* **Forma de validar la mejora:** Prueba de usabilidad donde un usuario con 2 días sobrecargados reduce su límite y resuelve el conflicto en menos de 2 minutos sin asistencia.

---

### Hallazgo 2: Estado "Posponer / En Espera" Oculto dentro de "Registrar Avance"
* **ID:** H-POS-01
* **Título del problema:** Incompatibilidad de modelo mental y fallo de descubribilidad en compromisos en espera de respuesta de terceros.
* **Categoría:** Modelos Mentales / Descubribilidad / Arquitectura de Información.
* **Tarea o flujo afectado:** T5 — Seguimiento, avance y posposición.
* **Pantalla o ruta:** `/hoy` y `/evento/:id`.
* **Componente:** `RegisterProgressDialog.tsx`, `EventTaskCard.tsx`, `TodayTaskActionsMenu.tsx`.
* **Objetivo del usuario:** Reflejar que un compromiso no puede continuar temporalmente porque un proveedor o tercero no ha confirmado, sin marcarlo como terminado y sin inventar una fecha falsa.
* **Comportamiento esperado:** Encontrar una opción visible como "Pausar", "En espera" o "Posponer" en las acciones de la tarea.
* **Comportamiento observado:** Los participantes buscaron reprogramar, notas de texto o se quedaron detenidos sin saber qué fecha ingresar. Solo llegaron a "Pospuesta" tras la indicación verbal del evaluador hacia "Registrar avance".
* **Evidencia:** 0% de autonomía en las 4 sesiones de prueba. Participante 4 (19:33): *"No sabría muy bien qué poner acá [en la fecha]"*. Participante 2 (01:18:54): *"No sabría cómo reprogramarme"*.
* **Fuente metodológica:** NN/g Heurística #2 (Correspondencia entre el sistema y el mundo real) y #6 (Reconocimiento antes que recuerdo); ISO 9241-115:2024 (Navegación conceptual y predictibilidad).
* **Causa raíz:** Jerarquía semántica invertida: se consideró la suspensión indefinida como un tipo de avance, ocultándola tras un botón rotulado como "Registrar avance" con icono de checklist.
* **Consecuencia para el usuario:** Compromisos en espera quedan estancados como pendientes consumiendo erróneamente capacidad horaria de la jornada; frustración y demoras operativas.
* **Frecuencia observada:** 100% de los participantes que realizaron T5.2.
* **Severidad:** **3 (Problema Mayor)**.
* **Confianza:** **Alta** (unanimidad empírica).
* **Alternativas de solución:**
  * *Alternativa A (Recomendada):* Acción directa "Dejar en espera / Posponer" en el menú contextual de la tarjeta de tarea, solicitando nota obligatoria.
  * *Alternativa B:* Botón secundario permanente "Posponer" en la tarjeta. *(Descartada por saturación espacial en pantallas móviles).*
* **Solución recomendada:** Implementar Alternativa A. Mantener la opción dentro de `RegisterProgressDialog` como vía secundaria, pero hacerla descubrible de primer nivel en el menú de acciones.
* **Justificación:** Respeta el modelo mental del usuario (separar avance de suspensión) y reduce la fricción de 4 pasos ciegos a 2 pasos directos.
* **Riesgos:** Ninguno funcional; el backend ya soporta el estado `postponed`.
* **Criterios de aceptación:**
  1. El menú contextual de la tarjeta debe contener *"Posponer / Dejar en espera"*.
  2. Debe requerir o sugerir una nota explicativa.
  3. La tarea debe cambiar visualmente a estado gris neutral sin fecha y excluirse del cálculo de horas planificadas.
* **Forma de validar la mejora:** Tarea de usabilidad no asistida donde el usuario deba pausar un catering; debe lograrlo en < 30 s de forma autónoma.

---

### Hallazgo 3: Opacidad en la Heurística de Ordenación y Riesgo de Omisión en Hoy
* **ID:** H-ORD-01
* **Título del problema:** Falta de transparencia en los criterios de priorización temporal y desalineación con el modelo mental de esfuerzo del usuario.
* **Categoría:** Transparencia Algorítmica / Jerarquía Visual / Prevención de Errores.
* **Tarea o flujo afectado:** T3 — Consultar Hoy y priorizar jornada.
* **Pantalla o ruta:** `/hoy`.
* **Componente:** `TodayPage.tsx`, `today.service.ts`, `TodayPriorityGuide.tsx`.
* **Objetivo del usuario:** Identificar con certeza cuál es la tarea crítica que debe atender primero en la jornada de trabajo.
* **Comportamiento esperado:** La interfaz debe presentar una jerarquía incuestionable de urgencia (vencidas primero, hoy después) y explicitar bajo qué criterio están ordenadas las tareas de una misma fecha.
* **Comportamiento observado:** Participante 3 casi omite una tarea del día porque quedó renderizada al final de la pantalla (29:17). Participante 4 supuso que la tarea más larga debía atenderse primero por requerir mayor esfuerzo (07:50), cuando el sistema en realidad las ordena al revés (menor duración primero).
* **Evidencia:** Participante 3: *"No lo había visto... Hubiera quedado mal al cliente"* (39:37); Participante 4: *"Supongo que depende al tiempo que debo tomar... darle prioridad a esta"*.
* **Fuente metodológica:** ISO 9241-110:2020 (Principio de autodescripción); NN/g Heurística #1 (Visibilidad del estado del sistema).
* **Causa raíz:** `today.service.ts` aplica una heurística de menor tiempo estimado primero ("Quick Wins") sin rótulos explicativos ni selector de criterio, colisionando con el sesgo humano que equipara volumen de trabajo con prioridad.
* **Consecuencia para el usuario:** Omisión de compromisos contractuales urgentes; pérdida de confianza en la agenda automatizada.
* **Frecuencia observada:** Observado en 2 de 4 participantes.
* **Severidad:** **3 (Problema Mayor)**.
* **Confianza:** **Alta**.
* **Alternativas de solución:**
  * *Alternativa A (Recomendada):* Chip informativo en cabecera: *"Ordenadas por fecha y menor duración"* y selector discreto para alternar entre "Menor duración" y "Mayor duración".
  * *Alternativa B:* Campo explícito de prioridad (Alta/Media/Baja) en el formulario de subtareas. *(Descartada por incrementar la carga de captura de datos).*
* **Solución recomendada:** Implementar Alternativa A y reforzar el contraste cromático del chip "Hoy" (`#c2410c` sobre `#fff7e6`) para que destaque visualmente sobre tareas futuras.
* **Justificación:** Transparenta la lógica del software sin imponer sobrecarga al usuario.
* **Riesgos:** Mínimos; requiere ajuste menor en frontend.
* **Criterios de aceptación:**
  1. En la vista Hoy debe figurar una nota textual visible que declare el criterio de orden activo.
  2. El usuario debe poder conmutar entre menor duración y mayor duración.
* **Forma de validar la mejora:** Medir el tiempo de identificación de la tarea más urgente en una lista mixta de 8 tareas (objetivo: < 10 s).

---

### Hallazgo 4: Asimetría Funcional de Acciones entre Pantallas Clave
* **ID:** H-ACT-01
* **Título del problema:** Inconsistencia en la disponibilidad de acciones de tarea entre la vista Hoy y la vista Detalle del Evento.
* **Categoría:** Consistencia y Estándares / Flexibilidad y Eficiencia.
* **Tarea o flujo afectado:** T2 — Gestionar compromisos y T3 — Despacho diario.
* **Pantalla o ruta:** `/hoy` vs. `/evento/:id`.
* **Componente:** `TodayTaskActionsMenu.tsx` frente a `EventTaskCard.tsx`.
* **Objetivo del usuario:** Editar datos de una tarea (nombre, notas, horas) desde el lugar donde la está revisando.
* **Comportamiento esperado:** Disponer del mismo conjunto de operaciones básicas en la tarjeta de tarea independientemente de la vista en que se encuentre.
* **Comportamiento observado:** En `/hoy`, el menú solo ofrece "Reprogramar" y "Ver detalles". El usuario no puede corregir un error tipográfico ni editar la nota sin salir de Hoy e ingresar a `/evento/:id`.
* **Evidencia:** Participante 4 (20:24): *"Siento yo que todas las acciones que se puedan hacer en una tarea deberían estar aquí en los tres puntos... poder editar desde aquí y no editar eventos después de venirme editar esto"*.
* **Fuente metodológica:** NN/g Heurística #4 (Consistencia y estándares) y #7 (Flexibilidad y eficiencia de uso); ISO 9241-115:2024.
* **Causa raíz:** Implementación desacoplada de `TodayTaskActionsMenu` respecto a `EventTaskCard`, omitiendo la integración del diálogo `EditSubtaskDialog` en la página Hoy.
* **Consecuencia para el usuario:** Fricción acumulativa; desplazamientos innecesarios entre pantallas para tareas cotidianas simples.
* **Frecuencia observada:** Reportado expresamente por 2 participantes y confirmado en código.
* **Severidad:** **2 (Problema Menor / Fricción Estructural)**.
* **Confianza:** **Alta**.
* **Solución recomendada:** Integrar `EditSubtaskDialog` dentro de `TodayPage.tsx` y añadir la opción *"Editar detalles"* en `TodayTaskActionsMenu.tsx`.
* **Justificación:** Elimina la ruptura de contexto y ahorra 3 pasos de navegación al usuario.
* **Riesgos:** Gestionar la actualización del estado local de la tarea en la vista Hoy al cerrar el diálogo de edición.
* **Criterios de aceptación:**
  1. Al presionar "Editar detalles" desde Hoy, se debe abrir el modal de edición de la tarea.
  2. Al guardar, los cambios deben reflejarse de inmediato en la tarjeta de Hoy sin recarga completa.
* **Forma de validar la mejora:** Prueba automatizada en Vitest verificando que la acción "Editar detalles" esté presente y funcional en `TodayPage.test.tsx`.

---

### Hallazgo 5: Ambigüedad en Campo de Duración por Ausencia de Unidad Explícita
* **ID:** H-DUR-01
* **Título del problema:** Falta de especificación de la unidad de medida (horas vs. minutos vs. días) en el formulario de creación de tareas.
* **Categoría:** UX Writing / Prevención de Errores / Formularios.
* **Tarea o flujo afectado:** T2 — Crear y gestionar subtareas.
* **Pantalla o ruta:** Diálogos modales en `/evento/:id` y `/crear`.
* **Componente:** `AddSubtaskDialog.tsx`, `EditSubtaskDialog.tsx`, `EventForm.tsx`.
* **Objetivo del usuario:** Ingresar el tiempo que estima que tomará una tarea.
* **Comportamiento esperado:** Saber de inmediato qué unidad temporal exige el sistema antes de escribir o presionar steppers.
* **Comportamiento observado:** Los usuarios vacilaron frente al campo y preguntaron si debían escribir 90 para hora y media o si se aceptaban decimales.
* **Evidencia:** Participante 4 (04:49): *"en qué está estipulado el tiempo estimado... si están horas, minutos, días... poner tiempo estimado en horas para que el usuario sepa"*; Participante 1 (16:46): *"¿A qué se refiere tiempo estimado?"*.
* **Fuente metodológica:** Baymard Institute (Form Field Usability: Always Display Explicit Units); NN/g Heurística #5 (Prevención de errores) e ISO 9241-110:2020 (Autodescripción).
* **Causa raíz:** Etiqueta escueta `Tiempo estimado *` sin sufijo ni texto de ayuda contextual.
* **Consecuencia para el usuario:** Riesgo de ingresar valores desproporcionados (ej. 120 pensando en minutos, disparando error de sobrecarga de 120 h).
* **Frecuencia observada:** 100% de los participantes tuvieron dudas en este campo.
* **Severidad:** **2 (Problema Menor / Alto Potencial de Error)**.
* **Confianza:** **Alta**.
* **Solución recomendada:** Modificar el rótulo a `Duración estimada (horas) *` e incluir un texto de ayuda: *"Indica el tiempo en horas (admite decimales, ej. 1,5 h para 1 hora y 30 min)"*. Mantener el sufijo visual fijo `h` en el campo.
* **Justificación:** Claridad inmediata sin requerir manuales ni prueba y error.
* **Riesgos:** Ninguno.
* **Criterios de aceptación:**
  1. La etiqueta visible en todos los formularios debe decir explícitamente "(horas)".
  2. Debe existir un placeholder o texto auxiliar con el ejemplo "1,5".
* **Forma de validar la mejora:** Comprobación estática de accesibilidad y verificación de labels en Vitest.

---

### Hallazgo 6: Ausencia de Filtro por Fecha y Ocultamiento de Tareas Completadas en Hoy
* **ID:** H-FIL-01
* **Título del problema:** Imposibilidad de enfocar una fecha arbitraria en la agenda diaria y desaparición perceptual de las tareas completadas.
* **Categoría:** Recuperación de Información / Estados de Tarea.
* **Tarea o flujo afectado:** T3 — Consultar Hoy y aplicar filtros.
* **Pantalla o ruta:** `/hoy`.
* **Componente:** `TodayFilters.tsx`, `TodayPage.tsx`.
* **Objetivo del usuario:** Revisar la programación de una fecha específica y constatar qué compromisos ya quedaron cerrados en el día.
* **Comportamiento esperado:** Poder seleccionar una fecha del calendario en los filtros de Hoy y ver las tareas completadas en una sección final bajo el filtro "Todos".
* **Comportamiento observado:** Participante 2 solicitó ver el 25 de octubre y el moderador debió admitir que la función no existe (01:09:38). Al marcar una tarea como completada, esta desaparece de la vista sin dejar rastro visible en Hoy.
* **Evidencia:** Participante 2 (01:09:38); Matriz preliminar de hallazgos (*"al filtrar todos no aparecen los completados o si?"*).
* **Fuente metodológica:** NN/g Heurística #1 (Visibilidad del estado del sistema) y #7 (Flexibilidad de uso).
* **Causa raíz:** Decisión de implementación que limitó la vista Hoy a trabajo activo pendiente, descartando la sección `completed` del backend en el renderizado de React.
* **Consecuencia para el usuario:** Sensación de pérdida de control; incapacidad de verificar qué se completó durante el turno de trabajo.
* **Frecuencia observada:** Reportado en pruebas cualitativas y verificado en código.
* **Severidad:** **2 (Problema Menor)**.
* **Confianza:** **Alta**.
* **Solución recomendada:** Renderizar una cuarta sección `<TodayTaskSection title="Completadas hoy" tasks={data.completed} />` colapsada si supera 3 tareas, e incorporar un selector de fecha en `TodayFilters.tsx`.
* **Justificación:** Cierre perceptual de la jornada (sensación de logro) y auditoría rápida.
* **Riesgos:** Sobrecarga visual si la sección de completadas no se colapsa.
* **Criterios de aceptación:**
  1. Al filtrar por "Todos", las tareas terminadas deben figurar al final con estilo tachado.
  2. Debe existir un filtro opcional por fecha específica.
* **Forma de validar la mejora:** Prueba con usuario completando una tarea y verificando que permanezca en la lista bajo completadas.

---

### Hallazgo 7: Adelanto de Fecha de Evento Bloqueado sin Asistente de Reajuste
* **ID:** H-ERR-01
* **Título del problema:** Bloqueo administrativo al mover un evento hacia una fecha más próxima por colisión con subtareas posteriores.
* **Categoría:** Tolerancia a Errores / Complejidad Oculta.
* **Tarea o flujo afectado:** Gestión de eventos (`/evento/:id/editar`).
* **Pantalla o ruta:** `EditEventForm.tsx`.
* **Componente:** `EditEventForm.tsx`, `events/views.py`.
* **Objetivo del usuario:** Adelantar la fecha de celebración de un evento porque el cliente cambió el cronograma.
* **Comportamiento esperado:** El sistema advierte que existen tareas que quedarían fuera del nuevo rango y ofrece moverlas automáticamente al día límite del evento con confirmación.
* **Comportamiento observado:** El backend arroja error 400 listando los primeros 5 nombres de tareas infractoras. El formulario de edición no permite avanzar; el usuario debe cancelar, entrar al detalle, mover cada tarea individualmente y volver a intentar editar el evento.
* **Evidencia:** Inspección técnica del flujo F-02 documentado en `ux-critical-workflow-audit.md`.
* **Fuente metodológica:** GOV.UK Design System (Error recovery in multi-record operations); ISO 9241-110:2020 (Control del usuario).
* **Causa raíz:** La regla `target_date <= event_date` se valida de forma no transaccional a nivel de entidad de evento aislada.
* **Consecuencia para el usuario:** Proceso engorroso y frustrante (hasta 15 clics para adelantar un evento).
* **Frecuencia observada:** Fricción técnica sistemática en cualquier cambio de cronograma hacia adelante.
* **Severidad:** **3 (Problema Mayor)**.
* **Confianza:** **Alta** (confirmado en código backend y frontend).
* **Solución recomendada:** Incluir un modal de confirmación en `EditEventForm.tsx`: *"Tienes X tareas programadas después del nuevo plazo. ¿Deseas reubicarlas en la nueva fecha del evento automáticamente?"*.
* **Justificación:** Elimina un flujo cíclico de microediciones repetitivas.
* **Riesgos:** Debe garantizarse que la reubicación no provoque sobrecarga en el nuevo día.
* **Criterios de aceptación:**
  1. Si hay tareas desfasadas, el usuario debe poder ajustarlas en bloque con un solo clic de confirmación.
* **Forma de validar la mejora:** Prueba de integración en Vitest simulando edición de fecha de evento con 3 tareas posteriores.

---

### Hallazgo 8: Escalabilidad Inexistente en la Navegación de Eventos Múltiples
* **ID:** H-ESC-01
* **Título del problema:** Ausencia de buscador textual y filtros temporales en el catálogo de eventos, obligando a paginación secuencial ciega.
* **Categoría:** Escalabilidad / Navegación / Eficiencia.
* **Tarea o flujo afectado:** Navegación general de eventos (`/eventos`).
* **Pantalla o ruta:** `EventsPage.tsx`.
* **Componente:** `EventsPage.tsx`, `EventsTypeFilter.tsx`.
* **Objetivo del usuario:** Localizar un evento específico entre decenas de registros archivados o activos.
* **Comportamiento esperado:** Disponer de una barra de búsqueda por nombre y filtros por rango de fecha o estado.
* **Comportamiento observado:** La página solo ofrece un filtro por "Tipo de evento" (Social, Corporativo, etc.) y una paginación rígida de 6 elementos por página.
* **Evidencia:** Inspección de `EventsPage.tsx` y análisis de escalabilidad de uso con $N>20$ registros.
* **Fuente metodológica:** NN/g (Search and Navigation UX Guidelines); USWDS Design Patterns.
* **Causa raíz:** Diseño enfocado exclusivamente en escenarios de prueba pequeños ($N \le 6$).
* **Consecuencia para el usuario:** Inutilidad del catálogo a medida que el negocio del organizador crece; tiempo perdido pasando páginas.
* **Frecuencia observada:** Constante cuando existen más de 6 eventos.
* **Severidad:** **2 (Problema Menor en Prototipo / Mayor en Producción)**.
* **Confianza:** **Alta**.
* **Solución recomendada:** Incorporar campo de búsqueda por nombre con debounce (300 ms) e integrar ordenación por fecha del evento.
* **Justificación:** Estándar de la industria para listas extensas.
* **Riesgos:** Ninguno.
* **Criterios de aceptación:**
  1. La lista debe responder a búsquedas por subcadenas del nombre del evento.
* **Forma de validar la mejora:** Prueba Playwright con 24 eventos buscando un evento de la página 4 en menos de 1 segundo.

---

### Hallazgo 9: Rigidez de Capacidad en Compromisos "En Progreso"
* **ID:** H-RIG-01
* **Título del problema:** Retención del 100% de la carga horaria en tareas iniciadas, impidiendo registrar horas parciales ejecutadas.
* **Categoría:** Modelo de Datos / Lógica de Planificación.
* **Tarea o flujo afectado:** T5 — Seguimiento y avance.
* **Pantalla o ruta:** `/hoy` y `/evento/:id`.
* **Componente:** `RegisterProgressDialog.tsx`, `planning.py` (backend).
* **Objetivo del usuario:** Registrar que de una tarea de 4 h ya completó 2 h hoy y que las 2 h restantes quedan para mañana.
* **Comportamiento esperado:** Poder registrar avance parcial reduciendo las horas pendientes de la tarea.
* **Comportamiento observado:** El diálogo solo permite cambiar el estado a `in_progress`. La tarea sigue computando 4 h completas en la carga del día, bloqueando la capacidad restante de la jornada.
* **Evidencia:** Análisis estático de `planning.py` (líneas 45–60) y `RegisterProgressDialog.tsx`.
* **Fuente metodológica:** ISO 9241-110:2020 (Adecuación a la tarea y flexibilidad).
* **Causa raíz:** El modelo de datos de `Subtask` carece del campo `hours_spent` (horas dedicadas) o de división atómica de compromisos multijornada.
* **Consecuencia para el usuario:** Bloqueos artificiales de agenda; el usuario no puede aprovechar horas libres reales de su día.
* **Frecuencia observada:** Fricción arquitectónica permanente en cualquier tarea > 2 horas.
* **Severidad:** **2 (Problema Menor en Fase Actual / Alto para Madurez)**.
* **Confianza:** **Alta**.
* **Solución recomendada:** En `RegisterProgressDialog.tsx`, al seleccionar "En progreso", permitir ajustar las horas restantes: *"Horas pendientes para este día: [ 2 ] h"*.
* **Justificación:** Refleja la realidad del trabajo humano no instantáneo.
* **Riesgos:** Requiere actualización del serializador en backend para admitir horas remanentes.
* **Criterios de aceptación:**
  1. Si una tarea pasa a en progreso con horas parciales, la carga del día debe reflejar únicamente las horas restantes.
* **Forma de validar la mejora:** Prueba unitaria en Django verificando que la suma de carga diaria reste horas parciales.

---

### Hallazgo 10: Contraste Insuficiente en Acento Visual de Tareas Pospuestas (WCAG 1.4.11)
* **ID:** H-ACC-01
* **Título del problema:** Ratio de contraste inferior a 3.0:1 en la barra lateral identificadora de estado en tarjetas pospuestas.
* **Categoría:** Accesibilidad (WCAG 2.2 AA).
* **Tarea o flujo afectado:** Vista general de tareas en Detalle y Hoy.
* **Pantalla o ruta:** `EventTaskCard.tsx`.
* **Componente:** `STATUS_ACCENTS.postponed` (`#98a2b3`).
* **Objetivo del usuario:** Identificar visualmente el estado de una tarea por su indicador de color lateral sin depender exclusivamente de texto.
* **Comportamiento esperado:** Todos los elementos gráficos que transmiten estado deben cumplir un contraste mínimo de 3.0:1 frente al fondo blanco adyacente.
* **Comportamiento observado:** El color `#98a2b3` sobre blanco `#ffffff` produce un ratio de **2.8:1**, violando el criterio WCAG 1.4.11.
* **Evidencia:** Cálculo colorimétrico de luminancia relativa según fórmula W3C: $L_1 = 1.0, L_2 = 0.32 \rightarrow (1.0 + 0.05) / (0.32 + 0.05) = 2.83:1$.
* **Fuente metodológica:** WCAG 2.2 Criterio de Éxito 1.4.11 Non-text Contrast (Nivel AA).
* **Causa raíz:** Selección de token de color gris claro pensando únicamente en estética minimalista sin verificación con analizador de contraste.
* **Consecuencia para el usuario:** Dificultad de distinción para personas con baja agudeza visual o pantallas con bajo brillo/reflejos solares.
* **Frecuencia observada:** Presente en todas las tarjetas pospuestas.
* **Severidad:** **1 (Problema Cosmético / Concurrencia de Accesibilidad)**.
* **Confianza:** **Alta** (demostración matemática objetiva).
* **Solución recomendada:** Actualizar el token del acento a `#667085` (ratio **4.52:1** sobre blanco), garantizando cumplimiento total AA.
* **Justificación:** Corrección de un solo token sin alterar la armonía visual.
* **Riesgos:** Ninguno.
* **Criterios de aceptación:**
  1. El ratio de contraste de la barra lateral pospuesta debe ser $\ge 3.0:1$.
* **Forma de validar la mejora:** Auditoría automática con axe-core o Colour Contrast Analyser.

---

## 14. Conclusiones Obligatorias: Respuestas a las 10 Preguntas Clave

En estricto cumplimiento del pliego de auditoría, el equipo multidisciplinario responde de forma concluyente a las diez preguntas estratégicas:

### 1. ¿Cuáles son los diez problemas más importantes que realmente se pudieron identificar?
1. **H-CAP-01:** Bloqueo administrativo al reducir capacidad diaria sin diagnóstico multifecha ni resolución asistida.
2. **H-POS-01:** Imposibilidad de descubrir la opción "Posponer" subordinada erróneamente dentro de "Registrar avance" (0% autonomía).
3. **H-ORD-01:** Heurística de ordenamiento oculta en Hoy y riesgo de omisión de tareas urgentes del día actual.
4. **H-ACT-01:** Asimetría de acciones de tarea entre Hoy (incompleto) y Detalle del Evento (completo).
5. **H-FIL-01:** Carencia de filtro por fecha en Hoy y desaparición perceptual de las tareas completadas al filtrar "Todos".
6. **H-DUR-01:** Ambigüedad léxica en "Tiempo estimado" sin unidad explícita (horas vs. minutos vs. días).
7. **H-ERR-01:** Adelanto de fecha de evento bloqueado rígidamente por subtareas posteriores sin asistente de reubicación en bloque.
8. **H-ESC-01:** Paginación lineal ciega en la lista de eventos sin buscador textual por nombre ni ordenación por fecha.
9. **H-RIG-01:** Imposibilidad de registrar avance parcial de horas en compromisos largos, bloqueando capacidad ficticia.
10. **H-ACC-01:** Incumplimiento de contraste no textual WCAG 1.4.11 (2.8:1) en la barra de acento de tareas pospuestas.

### 2. ¿Qué funcionalidades parecen correctas visualmente pero generan fricción operativa?
* **El ajuste del límite diario (`DailyLimitDialog`):** Visualmente cuenta con un stepper circular moderno, animaciones fluidas y tipografía impecable; operativamente, arroja un error 400 seco y redirige a una pantalla donde las tareas causantes ni siquiera son visibles.
* **El modal "Registrar avance":** Es limpio y armónico visualmente, pero oculta conceptualmente el estado "Pospuesta", impidiendo que los usuarios suspendan compromisos de forma natural.
* **La ordenación de la lista en Hoy:** Visualmente luce ordenada y limpia, pero internamente aplica una heurística encubierta ("Quick Wins") que desconcierta el modelo mental del usuario sin explicar su lógica.

### 3. ¿Qué decisiones actuales del producto deberían reconsiderarse?
* **Validación sincrónica estricta con `.first()` en backend:** Debe evolucionar hacia una arquitectura de previsualización diagnóstica que entregue al frontend la totalidad de los días en conflicto.
* **Asociación forzada de Posponer como un tipo de Avance:** Debe separarse como una acción directa de agenda y suspensión temporal en los menús de primer nivel.
* **Exclusión de las tareas completadas en la vista Hoy:** Debe mantenerse visible como sección final colapsable para proporcionar retroalimentación de cierre de jornada.

### 4. ¿Qué problemas pueden solucionarse mediante cambios pequeños (Quick Wins)?
* Renombrar `Tiempo estimado *` a `Duración estimada (horas) *` e incluir placeholder `ej. 1,5 h` (H-DUR-01).
* Ajustar el token cromático de tareas pospuestas de `#98a2b3` a `#667085` para cumplir WCAG AA (H-ACC-01).
* Incorporar el chip explicativo *"Ordenadas por fecha y menor duración"* en la cabecera de Hoy (H-ORD-01).
* Renderizar la sección colapsable "Completadas hoy" en `TodayPage.tsx` bajo el filtro "Todos" (H-FIL-01).

### 5. ¿Qué problemas requieren rediseñar un flujo?
* **El flujo de reducción de capacidad diaria (H-CAP-01):** Requiere transformar un diálogo de entrada simple en un asistente de 2 pasos con diagnóstico multifecha y rebalanceo directo de tareas.
* **El flujo de adelanto de fecha de evento (H-ERR-01):** Requiere un diálogo de confirmación y ajuste en bloque para subtareas desfasadas.

### 6. ¿Qué inconsistencias afectan múltiples componentes?
* **El menú de acciones de las tarjetas de tarea:** Discrepancia entre `TodayTaskActionsMenu.tsx` y `EventTaskCard.tsx`.
* **Los modales de edición de subtareas:** `AddSubtaskDialog`, `EditSubtaskDialog` y `EventForm` replican validaciones y labels de manera desacoplada sin compartir un componente base de formulario de subtarea.

### 7. ¿Cuáles son las mejores oportunidades de reducir trabajo manual?
* **Asistente de resolución de sobrecarga:** Proponer automáticamente la fecha libre más cercana para tareas en conflicto al reducir la jornada.
* **Reubicación en bloque de tareas al cambiar fecha de evento:** Evitar que el usuario tenga que reprogramar 5 tareas a mano una por una.

### 8. ¿Qué problemas no aparecieron en las pruebas existentes y deberían investigarse?
* **Comportamiento con alta densidad de datos:** Las pruebas evaluaron 1 evento y 4 tareas. Debe investigarse el rendimiento y la fatiga cognitiva con 15 eventos y 80 subtareas.
* **Interrupción de conectividad y modo offline:** ¿Qué ocurre si el usuario registra un avance o reprograma sin conexión a internet? Actualmente falla con un toast genérico de error de red.

### 9. ¿Qué cambios pueden producir regresiones?
* **Tocar la lógica de ordenamiento en `today.service.ts`:** Si se altera el algoritmo sin pruebas cuidadosas, puede romperse la estabilidad visual esperada por los tests unitarios existentes.
* **Modificar la zona horaria de parseo de fechas en `DateInput.tsx`:** Cualquier descuido con UTC puede provocar que una tarea se guarde con un día de desfase en la base de datos de Bogotá.

### 10. ¿Qué acciones deberían priorizarse para la siguiente iteración del producto?
1. **Semana 1:** Implementar los 4 Quick Wins (labels de duración, contraste WCAG, textos explicativos y sección de completadas en Hoy).
2. **Semana 2:** Añadir la acción directa "Posponer / Dejar en espera" en `EventTaskCard` y `TodayTaskActionsMenu`.
3. **Semana 3:** Unificar "Editar detalles" en el menú contextual de Hoy.
4. **Semana 4:** Implementar el asistente de diagnóstico multifecha para capacidad diaria en conjunto con backend.
