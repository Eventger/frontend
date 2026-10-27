# Auditoría de Usabilidad y Plan de Remediación UX Basado en Evidencia Empírica de Pruebas con Usuarios Reales

**Producto:** Eventger — Plataforma de Gestión de Eventos y Planificación de Tareas<br>
**Rol:** Principal UX Researcher, Senior Product Designer, Interaction Designer, UX Analyst y Frontend Architect<br>
**Fecha:** 26 de Octubre de 2026<br>
**Entorno de Auditoría:** Frontend React / TypeScript / Vite / Tailwind CSS & Backend Django Rest Framework (DRF)<br>
**Estado:** Documento de Auditoría y Remediación Estratégica — *Sin modificaciones sobre el código de la aplicación en esta fase*<br>

---

## Índice General

1. [Resumen Ejecutivo y Contexto de la Evaluación](#1-resumen-ejecutivo-y-contexto-de-la-evaluación)
2. [Inventario de Fuentes, Insumos Disponibles y Faltantes](#2-inventario-de-fuentes-insumos-disponibles-y-faltantes)
3. [Diferenciación de Versiones de los Instrumentos de Evaluación](#3-diferenciación-de-versiones-de-los-instrumentos-de-evaluación)
4. [Perfiles de Participantes y Análisis Individual de Recorridos (T1–T6)](#4-perfiles-de-participantes-y-análisis-individual-de-recorridos-t1t6)
5. [Matriz Consolidada de Trazabilidad Participante–Tarea–Evidencia](#5-matriz-consolidada-de-trazabilidad-participantetareaevidencia)
6. [Separación Epistemológica: Hechos, Declaraciones, Inferencias y Propuestas](#6-separación-epistemológica-hechos-declaraciones-inferencias-y-propuestas)
7. [Contrastación Cruzada con el Frontend Actual](#7-contrastación-cruzada-con-el-frontend-actual)
8. [Investigación Profunda de las 6 Áreas Funcionales Críticas](#8-investigación-profunda-de-las-6-áreas-funcionales-críticas)
   - [A. Capacidad diaria, límites de trabajo y sobrecarga de tareas](#a-capacidad-diaria-límites-de-trabajo-y-sobrecarga-de-tareas)
   - [B. Descubribilidad, coherencia y arquitectura de acciones](#b-descubribilidad-coherencia-y-arquitectura-de-acciones)
   - [C. Prioridad, urgencia, modelo mental y ordenación de tareas](#c-prioridad-urgencia-modelo-mental-y-ordenación-de-tareas)
   - [D. Estados de tareas, posposición y compromisos en espera](#d-estados-de-tareas-posposición-y-compromisos-en-espera)
   - [E. Semántica temporal, fechas, duraciones y planificación](#e-semántica-temporal-fechas-duraciones-y-planificación)
   - [F. Autenticación, registro, verificación y aislamiento de cuentas](#f-autenticación-registro-verificación-y-aislamiento-de-cuentas)
9. [Matriz de Causas Raíz](#9-matriz-de-causas-raíz)
10. [Priorización Basada en Evidencia (P1 a P4)](#10-priorización-basada-en-evidencia-p1-a-p4)
11. [Fichas de Remediación Detallada por Hallazgo Prioritario](#11-fichas-de-remediación-detallada-por-hallazgo-prioritario)
12. [Matriz de Impacto en Componentes Compartidos y Riesgos de Regresión](#12-matriz-de-impacto-en-componentes-compartidos-y-riesgos-de-regresión)
13. [Reglas de Negocio e Integridad Funcional a Preservar](#13-reglas-de-negocio-e-integridad-funcional-a-preservar)
14. [Plan de Remediación por Etapas de Implementación](#14-plan-de-remediación-por-etapas-de-implementación)
15. [Auditoría Metodológica del Protocolo de Pruebas](#15-auditoría-metodológica-del-protocolo-de-pruebas)
16. [Plan de Validación Empírica con Nuevas Pruebas de Usabilidad](#16-plan-de-validación-empírica-con-nuevas-pruebas-de-usabilidad)
17. [Criterio Principal de Éxito: Respuestas a las 4 Preguntas Clave](#17-criterio-principal-de-éxito-respuestas-a-las-4-preguntas-clave)

---

## 1. Resumen Ejecutivo y Contexto de la Evaluación

La presente auditoría constituye una investigación técnica y analítica de experiencia de usuario (UX), diseño de interacción (IxD) y arquitectura de interfaz humana (HCI) para **Eventger**.<br>

El objetivo primordial no es formular rediseños cosméticos ni subjetivos, sino **analizar, sistematizar y contrastar la evidencia empírica directa derivada de las pruebas de usabilidad cualitativas realizadas con cuatro participantes reales** (Participante 1, Participante 2, Participante 3 y Participante 4) entre el 19 y el 22 de octubre de 2026.

### Principio Rector
Un participante puede declarar verbalmente una alta satisfacción (calificando una tarea con 5/5) mientras experimenta en la práctica severos bloqueos cognitivos, tropiezos en la interfaz, retrocesos cíclicos o necesidad de intervención directa del moderador para no abandonar la tarea. **La evaluación no confunde puntuaciones subjetivas con ejecución autónoma**. Las calificaciones expresan facilidad percibida; la usabilidad real se determina a través de comportamientos observables, tiempos de vacilación, errores de manipulación y solicitudes de asistencia.

---

## 2. Inventario de Fuentes, Insumos Disponibles y Faltantes

Para garantizar una trazabilidad documental verificable, se inspeccionaron los siguientes recursos en el entorno local:

```
├── Evidencia Primaria Usabilidad Eventger (Descargas/Analisis/):
│   ├── MATRICES.xlsx (Hojas: Matriz de Diseño de Tareas, Preguntas posteriores,
│   │   Matriz de Hallazgos, Instrumento de observación, Matriz de Resultados,
│   │   Cambios Recomendados, Señales y lenguaje Participante 1, Control y validez, Observaciones evaluador)
│   ├── User testing documento.docx (Consolidado de 728 párrafos con transcripciones y notas)
│   ├── Eventger_Transcripcion_Organizada_Juan_Toro_2026-10-22.txt (Transcripción sesión 4)
│   ├── Eventger_Informe_Analisis_UX_Juan_Toro_2026-10-22.pdf (Informe analítico sesión 4)
│   ├── Entrevista 4 - Participante 4.txt / Entrevista 4 - Participante 4.mp4 (Grabación audiovisual completa)
│   └── Meeting Transcription.txt (Registro complementario de sesiones de trabajo)
│
├── Instrumentos Previos y Respaldos (Raíz del Proyecto):
│   ├── Matrices.xlsx / Eventger_Matrices_Usabilidad_Criterios_Observaciones_Corregidos.xlsx
│   └── Respaldos históricos (Matrices.respaldo-*.xlsx)
│
├── Evidencias Visuales y Documentales Históricas (SPRINT-1 / SPRINT-2 / SPRINT-3):
│   ├── SPRINT-2/SPRINT 2/Evidencia UX-HCI/ (PDFs de flujos y estados)
│   └── docs/ (ux-audit.md, ux-critical-workflow-audit.md, ux-validation-and-regression-report.md)
│
└── Base de Código Actual:
    ├── frontend/frontend/src/ (Componentes React, hooks, páginas, servicios y pruebas)
    └── backend/apps/ (Modelos Django, serializadores, vistas y lógica de planificación)
```

### Fuentes Disponibles vs. Fuentes Faltantes

| Tipo de Insumo | Archivo / Ubicación | Estado | Observación Metodológica |
| :--- | :--- | :---: | :--- |
| **Matriz de Diseño de Tareas** | `Descargas/Analisis/MATRICES.xlsx` (Hoja 1) | **Disponible** | Contiene escenarios T1 a T6, criterios de éxito, historias de usuario (US-01 a US-12) y focos de observación. |
| **Matriz Consolidada de Hallazgos** | `Descargas/Analisis/MATRICES.xlsx` (Hoja 3) | **Disponible** | Registra 71 filas de hallazgos por participante, severidad preliminar y recomendaciones. |
| **Instrumento de Observación** | `Descargas/Analisis/MATRICES.xlsx` (Hoja 4) | **Disponible** | Registro paso a paso por participante con marcas temporales, completitud y ayudas. |
| **Preguntas Posteriores (Post-task)**| `Descargas/Analisis/MATRICES.xlsx` (Hoja 2) | **Disponible** | Respuestas textuales y escalas 1–5 de facilidad para T1–T6. |
| **Registro de Señales y Lenguaje** | `Descargas/Analisis/MATRICES.xlsx` (Hoja 7) | **Disponible** | Codificación de dudas, pausas y vacilaciones no verbales de Participante 1. |
| **Observaciones del Evaluador** | `Descargas/Analisis/MATRICES.xlsx` (Hoja 9) | **Disponible** | 12 observaciones normalizadas (O-01 a O-12) aportadas por el moderador. |
| **Informe Consolidado** | `Descargas/Analisis/User testing documento.docx` | **Disponible** | Análisis comparativo de las cuatro sesiones individuales. |
| **Grabación de Video Sesión 4** | `Descargas/Entrevista 4 - Participante 4.mp4` | **Disponible** | Archivo MP4 de 28 min 49 s con audio y video continuo. |
| **Transcripción Sesión 4** | `Descargas/Analisis/Eventger_Transcripcion...txt` | **Disponible** | Transcripción estructurada de la entrevista con Participante 4. |
| **Grabaciones Sesiones 1, 2 y 3** | Archivos multimedia `.mp4` / `.webm` | **No disponibles en disco** | Los archivos de video de Participante 1, Participante 2 y Participante 3 no están presentes como ficheros locales; la evidencia se reconstruye de los registros temporales sincronizados de Tactiq y transcripciones de las matrices. |

---

## 3. Diferenciación de Versiones de los Instrumentos de Evaluación

Al examinar los archivos del repositorio, se identifican dos versiones conceptualmente distintas de las matrices de usabilidad:

```
[VERSIÓN A: Prototipo Académico Preliminar]
  - Participantes: Luis Lucero, Joan Ramirez, Jhon Hermosa, Brayan Ceballos.
  - Dominio: "Planificación Académica" (términos: "Peso", "Examen", "Materias", "Cursos").
  - Ubicación: Eventger_Matrices_Usabilidad_Criterios_Observaciones_Corregidos.xlsx (raíz).
  - Alcance: Pruebas formativas tempranas de conceptos de capacidad y porcentaje.

[VERSIÓN B: Producto Eventger — Organización de Eventos]
  - Participantes: Participante 1, Participante 2, Participante 3, Participante 4.
  - Dominio: "Gestión de Eventos y Bodas" (Boda de Laura y Andrés, Catering, Invitaciones, Salón).
  - Ubicación: Descargas/Analisis/MATRICES.xlsx y User testing documento.docx.
  - Alcance: Batería completa de tareas T1 a T6 con 10 subescenarios operativos.
```

> [!IMPORTANT]
> **Delimitación estricta de alcance:**<br>
> Esta auditoría se enfoca exclusivamente en la **Versión B (Eventger — Organización de Eventos)**, respetando las dificultades reales observadas en el contexto de gestión de eventos con los 4 participantes reales. La Versión A se conserva únicamente como referencia histórica de la transición del concepto "Peso de actividad" hacia "Porcentaje de avance".

---

## 4. Perfiles de Participantes y Análisis Individual de Recorridos (T1–T6)

Las pruebas se desarrollaron de manera individual con los siguientes participantes:

```
┌─────────────────────────┬──────────────┬───────────────┬────────────────────────────────────────┐
│ Participante            │ Fecha Sesión │ Duración Est. │ Dispositivo / Condiciones              │
├─────────────────────────┼──────────────┼───────────────┼────────────────────────────────────────┤
│ 1. Participante 1        │ 19/10/2026   │ ~76 min       │ Computador de escritorio / Moderador   │
│ 2. Participante 2 │ 20/10/2026   │ ~91 min       │ Computador portátil / Videollamada     │
│ 3. Participante 3 A. Martínez  │ 21/10/2026   │ ~74 min       │ Computador portátil / Cuenta compartida│
│ 4. Participante 4            │ 22/10/2026   │ 28 min 49 s   │ Computador personal / Grabación directa│
└─────────────────────────┴──────────────┴───────────────┴────────────────────────────────────────┘
```

A continuación se auditan los 13 aspectos metodológicos requeridos para cada participante:

### 4.1 Participante 1: Participante 1 (Sesión 19/10/2026)

1. **Tarea que intentaba completar:** T1 (Crear boda), T2 (Compromisos), T3.1/T3.2 (Priorizar y filtrar en Hoy), T4.1/T4.2 (Reducir límite diario a 4 h y resolver conflicto de 2+3 h), T5.1/T5.2 (Registrar avance y posponer catering), T6.1/T6.2 (Acceso y registro).
2. **Resultado que debía alcanzar:** Crear el evento para dentro de 45 días; ingresar tareas respetando capacidad; priorizar compromisos en Hoy; reducir jornada a 4 h sin romper la planificación; registrar catering en espera con nota; validar acceso.
3. **Acciones que realizó realmente:** En T1 tardó en encontrar la confirmación; el formato de fecha bloqueó el envío inicial. En T2 alteró instrucciones al eliminar tareas. En T4.1 intentó guardar 4 h, pero el sistema le arrojó un error bloqueante de 5 h programadas; requirió pistas directas para encontrar la opción en el perfil. En T5.2 no supo cómo dejar una tarea "en espera" hasta que se le indicó "Registrar avance". En T6.2 contó caracteres con los dedos para cumplir con los 15 caracteres mínimos.
4. **Elementos que generaron dudas:** "¿Cómo le voy a agregar a crear evento?" (12:32); "¿Por qué no me deja?" (13:30); "¿A qué se refiere tiempo estimado?" (16:46); "¿Cuáles tareas debo quitar?" (20:39); "¿Dónde me meto?" (27:43).
5. **Errores y retrocesos observados:** Intentos reiterados de guardado de formulario de evento con formato de fecha incompatible; múltiples clics infructuosos al intentar bajar el límite diario bloqueado por sobrecarga preexistente; desorientación en el flujo de registro al no recibir el correo.
6. **Funcionalidades que no encontró:** No encontró de forma autónoma la configuración del límite diario en el perfil (requirió pista a las 30:53); no encontró una opción directa para "Posponer" o "Pausar" una tarea.
7. **Necesidad de ayuda del moderador:** **ALTA**. Requirió asistencia paso a paso en fechas (12:18, 13:34), en la decisión de qué tareas eliminar (20:39), en la localización de la disponibilidad (30:53) y en las credenciales de prueba de T6.1.
8. **Comentarios espontáneos:** "Normalmente es día, mes y año" (57:19); "No entiendo" (41:00); "No sé qué hacer" (41:07); "Ya tenemos el 20% adelantado" (01:01:22); "Y no me llega el correo" (01:16:18).
9. **Comentarios posteriores:** Manifestó que la plataforma requiere entenderse mejor ("hay que entender un poco más la plataforma", 22:20).
10. **Completitud de tareas:** T1: Sí (con ayuda); T2: Parcial; T3.1: Parcial (se tuvieron que reinyectar datos); T3.2: Parcial / No verificable; T4.1: **NO** (bloqueada por el sistema); T4.2: No verificable (se varió el límite); T5.1: Sí; T5.2: Parcial; T6.1: Sí (asistida); T6.2: Parcial (sin confirmación de correo).
11. **Calificaciones otorgadas:** T1 = 5/5; T2 = Sin nota numérica; T3 = 5/5; T4 = 3/5; T5 = 5/5; T6 = 4/5. *(Nótese la desconexión: otorga 5/5 en T1 y T3 habiendo requerido reconstrucción de datos y ayuda en cada paso).*
12. **Evidencia de dificultad:** Transcripción sincronizada Tactiq marcas 12:28, 25:01, 31:41 (advertencia de 5 h programadas), 41:00 (declaración explícita de bloqueo: "No sé qué hacer").
13. **Limitaciones metodológicas:** Intervenciones directas del moderador que indujeron las acciones; variación del límite de 4 a 5 h en vivo para destrabar el ensayo, alterando el escenario estándar.

---

### 4.2 Participante 2: Participante 2 (Sesión 20/10/2026)

1. **Tarea que intentaba completar:** T1–T6 siguiendo el protocolo de eventos.
2. **Resultado que debía alcanzar:** Mismos objetivos de planificación y resolución de sobrecarga.
3. **Acciones que realizó realmente:** En T1 creó el evento pero continuó agregando tareas durante la consigna de alta general. En T3.1 consultó Hoy pero solicitó ver una fecha específica (25 de octubre), descubriendo que la función no existía. En T4.1 debió navegar fecha por fecha sumando horas mentalmente para poder reducir su jornada a 4 h. En T4.2 se confundió entre el icono de editar (lápiz) y reprogramar. En T5.2 propuso agregar una nota textual y mover la tarea al final, descubriendo "Pospuesta" solo tras la pista del moderador. En T6.2 probó contraseña corta y correo duplicado.
4. **Elementos que generaron dudas:** "Esta parte sí me podrías explicar... este mensaje" (27:10); confusión entre el icono del lápiz y el botón de reprogramar (01:02:15); falta de filtro por fecha en Hoy.
5. **Errores y retrocesos observados:** Confusión de affordance entre "Editar datos" y "Reprogramar"; búsqueda manual repetitiva en múltiples fechas del calendario para encontrar qué día superaba las 4 horas.
6. **Funcionalidades que no encontró:** Filtro de tareas por fecha específica; opción visible y directa para posponer sin entrar al flujo de avance.
7. **Necesidad de ayuda del moderador:** **MEDIA-ALTA**. El moderador debió frenar la adición de tareas en T1 (hasta 18:32), indicar el traslado de la cotización en T2, orientar en T4 y dar la pista de "Registrar avance" en T5.2 (01:19:37).
8. **Comentarios espontáneos:** "Aunque aquí no está como el orden de las actividades" (19:30); "Me conviene más mirarlas todas" (37:13); "Todas tienen el mismo grado de importancia" (50:21); "Me toca ir... 24 de octubre" (51:56); "Me confundí un poquito el reprogramar y el lapicito" (01:02:15); "No sabría cómo reprogramarme" (01:18:54); "No me queda claro... caracteres especiales" (01:27:19).
9. **Comentarios posteriores:** Calificó T4 con 3/5 debido al excesivo trabajo manual requerido para encontrar las fechas en conflicto.
10. **Completitud de tareas:** T1: Parcial (desviado por alta prematura de tareas); T2: Parcial; T3.1: Sí (con condicionantes); T3.2: Parcial; T4.1: Sí (tras ajustes múltiples y demorados); T4.2: **No evaluable bajo consigna** (la carga exigida de 2+3 h superaba matemáticamente el límite de 4 h); T5.1: Sí; T5.2: Con ayuda; T6.1: Sí; T6.2: Registro observado, activación no comprobada.
11. **Calificaciones otorgadas:** T1 = 5/5; T2 = 5/5; T3 = 4/5; T4 = 3/5; T5 = 5/5; T6 = 5/5.
12. **Evidencia de dificultad:** Marcas 51:56–55:37 (cálculo mental iterativo), 01:02:15 (confusión de iconos), 01:09:38 (petición de filtro inexistente).
13. **Limitaciones metodológicas:** Consignas modificadas sobre la marcha por el moderador (58:28, 59:49) exigiendo una tercera tarea; contradicción intrínseca del guion en T4.2.

---

### 4.3 Participante 3: Participante 3 (Sesión 21/10/2026)

1. **Tarea que intentaba completar:** Protocolo completo T1 a T6 en entorno web.
2. **Resultado que debía alcanzar:** Registrar evento, gestionar tareas, organizar jornada, resolver conflictos de horario a 2 h, posponer catering y autenticar.
3. **Acciones que realizó realmente:** En T1 se detuvo en el campo "Contacto" sin saber si ingresar nombre o celular. En T2 tuvo problemas con las horas estimadas y el moderador alteró datos. En T3 casi omite una tarea del día porque apareció al final del listado. En T4.1 no encontró la disponibilidad en el perfil ("No veo la opción", 44:36) y al intentar reducir a 2 h tuvo que entrar a los eventos y modificar tareas una por una. En T4.2, al ser imposible encajar 3 h en un tope de 2 h, se vio obligado a reducir artificialmente las horas de la tarea para poder guardar. En T5.1 interpretó "Carga diaria: 0 h" como ausencia total de tareas pendientes. En T5.2 requirió indicación directa para llegar a "Pospuesta".
4. **Elementos que generaron dudas:** "¿Contacto sería quien organiza o el número?" (06:54); "¿Dónde está la disponibilidad?" (44:36); significado de "Carga diaria: 0 h" (01:05:40).
5. **Errores y retrocesos observados:** Omisión casi total de una tarea para hoy que quedó relegada al final; falsa edición de duraciones reales por imposibilidad del sistema; navegación errática buscando el ajuste de horario.
6. **Funcionalidades que no encontró:** Menú de disponibilidad/límite sin pistas; opción contextual de edición rápida en la lista (debió desplazarse hasta "Editar evento" en la cabecera); botón de posponer.
7. **Necesidad de ayuda del moderador:** **ALTA**. El moderador explicó Contacto (15:42), dio pista directa hacia el perfil (44:36), modificó condiciones en T4.2 y dictó la nota de catering en T5.2.
8. **Comentarios espontáneos:** "No lo había visto" (29:17, refiriéndose a la tarea de hoy al final); "Hubiera quedado mal al cliente" (39:37); "No veo la opción" (44:36); "Sentí que estaba haciendo las cosas mal" (57:26); "Reconoce que la opción está un poco escondida" (01:04:53).
9. **Comentarios posteriores:** Modificar horas fue "lo más complicado" (25:56); criticó la ubicación de "Editar evento" arriba que obliga a desplazarse constantemente (01:16:55). Calificó T4 con 2/5.
10. **Completitud de tareas:** T1: Sí (con observaciones); T2: Parcial; T3.1: Parcial (omisión de tarea); T3.2: Sí; T4.1: Con ayuda / Alta fricción; T4.2: **No evaluable** (consigna matemáticamente imposible); T5.1: Sí; T5.2: Con ayuda; T6.1: Sí; T6.2: Registro observado, activación no comprobada.
11. **Calificaciones otorgadas:** T1 = 5/5; T2 = 4/5; T3 = 4/5; T4 = 2/5; T5 = 5/5; T6 = 5/5.
12. **Evidencia de dificultad:** Marcas 29:17 (tarea no vista), 44:36 (búsqueda infructuosa de configuración), 57:26 (frustración por falso error personal en T4.2).
13. **Limitaciones metodológicas:** Cuenta compartida contaminada: el participante visualizó eventos creados por participantes previos (05:27, 31:34), afectando su comprensión del espacio de trabajo; guion defectuoso en T4.2.

---

### 4.4 Participante 4: Participante 4 (Sesión 22/10/2026)

1. **Tarea que intentaba completar:** Protocolo completo T1 a T6 (Grabación MP4 disponible, 28 min 49 s).
2. **Resultado que debía alcanzar:** Mismos hitos de creación, gestión, priorización, reprogramación, avance y registro.
3. **Acciones que realizó realmente:** En T1 creó el evento con fluidez y destacó la actualización en tiempo real sin recarga (09:03). En T2 creó las tareas e identificó de inmediato que "Tiempo estimado" no tenía unidad de medida ("en qué está estipulado el tiempo estimado... horas, minutos, días", 04:49). En T3 revisó Hoy pero asumió erróneamente que una tarea con más horas debe realizarse primero ("supongo que me daría un orden depende al tiempo que debo tomar para cada uno... darle prioridad a esta", 07:50, 11:55). En T4.1 comprendió el bloqueo de 5 h frente a 4 h ("No me deja por esta tarea", 15:36) y propuso redistribuir tareas. En T5.2 quedó perplejo al no saber qué fecha poner si el proveedor no confirmaba ("No sabría muy bien qué poner acá", 19:33); llegó a "Pospuesto" guiado por el moderador ("dale ahí en Registrar avance", 20:18). En T5 propuso que los tres puntos deberían permitir editar la tarea completa y no solo reprogramar (20:24). En T6.2 propuso agregar un campo de confirmación de contraseña para evitar errores tipográficos (27:37).
4. **Elementos que generaron dudas:** Ausencia de unidad de medida en tiempo estimado (04:49); criterio de ordenación en Hoy (07:50); qué fecha registrar para un compromiso pospuesto sin fecha fija (19:33).
5. **Errores y retrocesos observados:** Bloqueo momentáneo en T5.2 buscando una opción de estado en la tarjeta; deducción de orden basada en esfuerzo en lugar de urgencia en T3.
6. **Funcionalidades que no encontró:** Edición de detalles dentro del menú contextual de la tarea (solo vio "Reprogramar"); acción visible para suspender/posponer una tarea sin fecha.
7. **Necesidad de ayuda del moderador:** **BAJA-MEDIA**. Ejecutó con autonomía la mayoría de flujos, pero requirió intervención indispensable en T5.2 para encontrar "Pospuesta" dentro de "Registrar avance" (20:18).
8. **Comentarios espontáneos:** "Tiempo estimado en horas o algo por el estilo para que el usuario sepa" (05:04); "Darle prioridad a esta [tarea más larga]" (12:20); "No me deja por esta tarea" (15:36); "No sabría muy bien qué poner acá" (19:33); "Siento yo que todas las acciones que se puedan hacer en una tarea deberían estar aquí en los tres puntos" (20:24); "Agregar otro campo de confirmación de contraseña" (27:37).
9. **Comentarios posteriores:** Sugirió incluir "Duración estimada (horas)" y confirmación de contraseña; calificó T5 con 4.5/5 "por el tema de no haber puesto el pospuesto" (22:00).
10. **Completitud de tareas:** T1: Sí (autónomo); T2: Sí (con observación técnica); T3.1: Parcial (modelo mental invertido de prioridad); T3.2: Sí; T4.1: Sí (con conflicto diagnosticado); T4.2: Parcialmente observado; T5.1: Sí; T5.2: Con ayuda; T6.1: Parcialmente verificable (pausa por privacidad); T6.2: Registro observado, activación no comprobada.
11. **Calificaciones otorgadas:** T1 = 5/5; T2 = Sin puntuación numérica (el moderador saltó a T3 sin registrar la nota); T3 = 5/5; T4 = 5/5; T5 = 4.5/5; T6 = 5/5.
12. **Evidencia de dificultad:** Transcripción organizada marcas 04:49–05:47, 07:50–08:31, 15:36, 19:33–20:24, 27:37–28:23.
13. **Limitaciones metodológicas:** Grabación pausada en T6 entre 22:54 y 23:20 por ingreso de credenciales privadas; omisión del registro numérico de facilidad en T2; condiciones de horas en T4 no idénticas a las sesiones 1 a 3.

---

## 5. Matriz Consolidada de Trazabilidad Participante–Tarea–Evidencia

A continuación se indexan sistemáticamente los 12 hallazgos empíricos primarios extraídos de los instrumentos:

| ID Hallazgo | Tarea | Historia(s) | Participante(s) | Evidencia Observable y Cita Textual | Marca Temporal | Ayuda Mod. | Resultado Tarea |
| :--- | :---: | :---: | :--- | :--- | :---: | :---: | :---: |
| **H-CAP-01** | T4.1 | US-06, US-12 | Participante 1, Participante 2, Participante 3, Participante 4 | Rechazo de 4 h por tareas de 5 h. Suma manual y edición tarea por tarea. *"¿Dónde me meto?"* (Participante 1 27:43); *"Me toca ir... 24 oct"* (Participante 2 51:56); *"No veo la opción"* (Participante 3 44:36); *"No me deja"* (Participante 4 15:36). | Participante 1 25:01; Participante 2 51:56; Participante 3 44:36; Participante 4 15:36 | Sí (pistas directas de perfil) | Bloqueado (Participante 1) / Fricción severa |
| **H-MET-01** | T4.2 | Instrumento | Participante 2, Participante 3 | Guion exige tareas de 2+3 h (5 h) el mismo día con tope de 4 h o 2 h. Imposible matemáticamente. *"Sentí que estaba haciendo las cosas mal"* (Participante 3 57:26); fuerza a falsear horas. | Participante 2 56:49; Participante 3 53:51 | Sí (cambio de consignas) | No evaluable bajo consigna |
| **H-ORD-01** | T3.1 | US-04, US-05 | Participante 3, Participante 4, Participante 1 | Tarea de hoy aparece al final de la lista. En Hoy se confunde duración con prioridad. *"No lo había visto"* (Participante 3 29:17); *"Supongo que depende al tiempo [duración]"* (Participante 4 07:50). | Participante 3 29:17; Participante 4 07:50; Participante 1 49:32 | Leve | Parcial (Riesgo de omisión) |
| **H-FIL-01** | T3.2 | US-04, US-05 | Participante 2, Instrumento | Solicitud de ver tareas del 25/octubre; el moderador confirma que no hay filtro por fecha. Al filtrar "Todos" no se ven completadas. | Participante 2 01:09:38; Matriz preliminar | Sí (moderador aclara) | Parcial |
| **H-POS-01** | T5.2 | US-09 | Participante 1, Participante 2, Participante 3, Participante 4 | Estado de espera oculto dentro de "Registrar avance". *"No sabría cómo reprogramarme"* (Participante 2 01:18:54); *"No sabría muy bien qué poner acá"* (Participante 4 19:33). | Participante 1 01:01:34; Participante 2 01:19:37; Participante 3 01:03:33; Participante 4 20:18 | **Sí (indispensable)** | Con ayuda (0% autonomía) |
| **H-ACT-01** | T2, T4 | US-03, US-06 | Participante 4, Participante 2, Participante 3 | Acciones fragmentadas. Menú solo ofrece reprogramar. Confusión entre lápiz y reprogramar. *"Todas las acciones deberían estar en los tres puntos"* (Participante 4 20:24); *"Me confundí con el lapicito"* (Participante 2 01:02:15). | Participante 4 20:24; Participante 2 01:02:15; Participante 3 01:16:55 | No | Parcial (Inconveniencia) |
| **H-DUR-01** | T2 | US-02, US-03 | Participante 4, Participante 1, Participante 3 | "Tiempo estimado" sin unidad explícita (¿horas, minutos o días?). *"No hay información que me diga si son horas, minutos, días"* (Participante 4 04:49); *"¿A qué se refiere tiempo estimado?"* (Participante 1 16:46). | Participante 4 04:49; Participante 1 16:46; Participante 3 12:00 | Leve | Completado con dudas |
| **H-CON-01** | T1 | US-01 | Participante 3 | Campo "Contacto" ambiguo; duda si es organizador, cliente o teléfono. *"¿Contacto sería quien organiza o el número?"* (Participante 3 06:54). | Participante 3 06:54 | Sí (aclaración a las 15:42) | Completado con dudas |
| **H-FEC-01** | T1, T3 | US-01, US-04 | Participante 1, Evaluador | Error al registrar evento por formato de fecha. *"Normalmente es día, mes y año"* (Participante 1 57:19); Evaluador O-01 señala expectativa DD/MM/AAAA. | Participante 1 13:30, 57:19; Evaluador O-01 | Sí (asistencia de formato) | Completado con ayuda |
| **H-AUT-01** | T6.1, T6.2 | US-11 | Participante 1, Participante 2, Participante 3, Participante 4 | Envío de formulario sin comprobación de entrega de correo, activación ni primer acceso real. *"Y no me llega el correo"* (Participante 1 01:16:18). Pausa por privacidad en Participante 4 (22:54). | Participante 1 01:16:18; Participante 2 01:30:25; Participante 3 01:13:00; Participante 4 22:54 | Sí (credenciales sintéticas) | Registro visto, login nuevo no |
| **H-SEC-01** | T6.2 | US-11 | Participante 4, Participante 1, Participante 2 | Falta confirmación de contraseña y requisitos visibles de longitud (15 caracteres). *"Agregar otro campo de confirmación de contraseña para evitar errores"* (Participante 4 27:37); conteo con dedos (Participante 1 01:12:33). | Participante 4 27:37; Participante 1 01:12:33; Participante 2 01:24:19 | No | Completado con fricción |
| **H-PRG-01** | T5.1 | US-10 | Participante 3 | Carga diaria en "0 h" interpretada erróneamente como ausencia de tareas pendientes en el evento. | Participante 3 01:05:40 | No | Error de interpretación |

---

## 6. Separación Epistemológica: Hechos, Declaraciones, Inferencias y Propuestas

Para evitar sesgos interpretativos, cada hallazgo se descompone en sus cuatro niveles de validez:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ NIVELES EPISTEMOLÓGICOS DE ANÁLISIS:                                                   │
│ 1. OBSERVADO (Hecho): Conducta motriz o visual registrada objetivamente en el ensayo.   │
│ 2. DECLARADO (Cita): Lo que el usuario expresó explícitamente de forma verbal.         │
│ 3. INFERIDO (Diagnóstico): Deducción analítica de la causa cognitiva o heurística.     │
│ 4. PROPUESTO (Diseño): Solución técnica y proyectual recomendada para mitigar el fallo.│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Clasificación Rigurosa por Hallazgo

* **Capacidad y Sobrecarga (H-CAP-01):**
  * *OBSERVADO:* Participante 1 y Participante 3 intentaron guardar 4 h repetidamente; la interfaz mostró error bloqueante. Participante 3 abrió 4 pantallas distintas para editar subtareas una por una.
  * *DECLARADO:* Participante 1: *"No entiendo, no sé qué hacer"* (41:00); Participante 3: *"No veo la opción"* (44:36); Participante 2: *"Me toca ir... 24 de octubre"* (51:56); Participante 4: *"No me deja por esta tarea"* (15:36).
  * *INFERIDO:* El acoplamiento sincrónico e inflexible entre el ajuste de preferencia y la validación de tareas históricas traslada el costo del cálculo al usuario mediante prueba y error.
  * *PROPUESTO:* Modal de diagnóstico multifecha con asistente de redistribución de carga antes de aplicar la reducción.

* **Descubribilidad de Posponer (H-POS-01):**
  * *OBSERVADO:* Ningún participante hizo clic en "Registrar avance" cuando la consigna fue posponer el catering. Permanecieron inmóviles o intentaron cambiar la fecha en reprogramación.
  * *DECLARADO:* Participante 2: *"No sabría cómo reprogramarme"* (01:18:54); Participante 4: *"No sabría muy bien qué poner acá [en la fecha]"* (19:33); Participante 4: *"4.5 por el tema de no haber puesto el pospuesto"* (22:00).
  * *INFERIDO:* Violación de la heurística de correspondencia entre el sistema y el mundo real. "Registrar avance" evoca completar trabajo; ocultar la suspensión temporal dentro de ese control anula su descubribilidad.
  * *PROPUESTO:* Exponer la acción "Posponer / En espera" directamente en el menú de acciones de la tarea, con campo de nota explicativa y fecha de seguimiento opcional.

* **Prioridad y Orden (H-ORD-01):**
  * *OBSERVADO:* Participante 3 no vio la tarea para hoy y procedió a cerrar la vista hasta que casi al final del tiempo la descubrió desplazándose hacia abajo. Participante 4 ordenó su lectura verbal empezando por la tarea de mayor duración.
  * *DECLARADO:* Participante 3: *"No lo había visto... Hubiera quedado mal al cliente"* (29:17, 39:37); Participante 4: *"Supongo que depende al tiempo [duración]... Darle prioridad a esta"* (07:50, 11:55).
  * *INFERIDO:* La ausencia de indicadores visuales de ordenamiento hace que el usuario proyecte sus propios heurísticos (esfuerzo = prioridad), y la falta de jerarquía temporal estricta en el detalle del evento provoca ceguera de tareas urgentes.
  * *PROPUESTO:* Clasificación visual inequívoca: Vencidas (rojo) $\rightarrow$ Hoy (naranja) $\rightarrow$ Próximas (azul), explicitando el criterio de ordenamiento en la interfaz.

* **Tiempo Estimado (H-DUR-01):**
  * *OBSERVADO:* Participante 4 vaciló frente al campo de tiempo estimado antes de teclear.
  * *DECLARADO:* Participante 4: *"Tiempo estimado en horas o algo por el estilo para que el usuario sepa"* (05:04); Participante 1: *"¿A qué se refiere tiempo estimado?"* (16:46).
  * *INFERIDO:* Ambigüedad léxica por omisión de unidad de medida.
  * *PROPUESTO:* Renombrar la etiqueta a `Duración estimada (horas) *` e incluir placeholder `ej. 1,5 h`.

* **Confirmación de Contraseña (H-SEC-01):**
  * *OBSERVADO:* Participante 1 contó caracteres con los dedos frente a la pantalla.
  * *DECLARADO:* Participante 4: *"Agregar otro campo de confirmación de contraseña para escribirla una vez y después otra vez y estar seguro"* (27:37).
  * *INFERIDO:* Falta de mecanismos de prevención de errores en la captura de credenciales críticas.
  * *PROPUESTO:* Incluir campo de confirmación de contraseña, visibilidad conmutables (ojo) y checklist dinámico de requisitos.

---

## 7. Contrastación Cruzada con el Frontend Actual

Se inspeccionó la rama activa del repositorio (`frontend/frontend/src/` y `backend/apps/`) para evaluar el estado contemporáneo de cada dificultad identificada:

```
┌──────────────┬───────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ ID Hallazgo  │ Componente Actual Responsable             │ Estado Actual en Código                                │
├──────────────┼───────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ H-CAP-01     │ DailyLimitDialog.tsx / PreferencesForm.tsx│ PARCIALMENTE CORREGIDO (Persiste fricción diagnóstica) │
│ H-MET-01     │ Protocolo / Fixture de prueba             │ CONFIRMADO COMO SESGO METODOLÓGICO                    │
│ H-ORD-01     │ taskSort.ts / TodayPage.tsx               │ PARCIALMENTE CORREGIDO (Orden en evento, no en Hoy)    │
│ H-FIL-01     │ TodayFilters.tsx / TodayPage.tsx          │ PERSISTENTE Y CONFIRMADO                               │
│ H-POS-01     │ RegisterProgressDialog.tsx                │ PERSISTENTE Y CONFIRMADO (Oculto en Registrar avance)  │
│ H-ACT-01     │ EventTaskCard.tsx / TodayTaskActionsMenu  │ PARCIALMENTE CORREGIDO (Falta Editar en Hoy)           │
│ H-DUR-01     │ AddSubtaskDialog.tsx / EditSubtaskDialog  │ PERSISTENTE Y CONFIRMADO (Label sigue sin "(horas)")   │
│ H-CON-01     │ EventForm.tsx (líneas 842-926)            │ CORREGIDO FUNCIONALMENTE (Pendiente validación humana) │
│ H-FEC-01     │ DateInput.tsx                             │ CORREGIDO FUNCIONALMENTE (Pendiente validación humana) │
│ H-AUT-01     │ SignUpPage.tsx                            │ PERSISTENTE EN PROTOCOLO (Activación no controlada)    │
│ H-SEC-01     │ SignUpPage.tsx (líneas 1100-1250)         │ CORREGIDO FUNCIONALMENTE (Pendiente validación humana) │
│ H-PRG-01     │ TodaySummary.tsx / EventProgressCard.tsx  │ PARCIALMENTE CORREGIDO                                 │
└──────────────┴───────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

### Análisis Técnico del Estado Actual

1. **H-CAP-01 (Capacidad Diaria):**<br>
   En `DailyLimitDialog.tsx` se implementó un stepper interactivo y manejo del error `DailyLimitConflictError`. Sin embargo, cuando el backend rechaza la reducción (`apps/subtasks/planning.py`), únicamente devuelve el primer día conflictivo (`.order_by("-total", "day").first()`). El frontend muestra un cartel amarillo con un botón "Ver tareas en Hoy" que redirige a `/hoy`. Si el conflicto está en una fecha futura (ej. dentro de 15 días), `/hoy` **no muestra las tareas de ese día**, dejando al usuario sin información de qué debe corregir.
2. **H-ORD-01 (Orden de Tareas):**<br>
   En `taskSort.ts` se implementó `sortSubtasksForEventDetail`, que asegura que las tareas no completadas vayan primero en el detalle del evento. No obstante, en `TodayPage.tsx` el ordenamiento dentro de cada sección sigue dependiendo de `sortByPriority` en `today.service.ts`, el cual desempata por menor tiempo estimado (`first.estimatedHours - second.estimatedHours`), lo cual contradice el modelo mental expresado por Participante 4 (quien esperaba atender primero las tareas más largas o complejas) sin explicar jamás el criterio en la interfaz.
3. **H-FIL-01 (Filtros en Hoy):**<br>
   En `TodayFilters.tsx` solo existen filtros por Evento y por Estado (`all`, `today`, `upcoming`, `overdue`). No existe filtro por fecha específica. Además, en `TodayPage.tsx` **la sección de tareas completadas no se renderiza en la vista principal**, por lo que al seleccionar el filtro "Todos", las tareas completadas siguen sin aparecer, confirmando la queja histórica de la matriz.
4. **H-POS-01 (Descubribilidad de Posponer):**<br>
   En `RegisterProgressDialog.tsx` se mantiene el botón "Pospuesta: No se puede realizar por ahora". Para acceder a él, el usuario obligatoriamente debe presionar el botón primario "Registrar avance" en `EventTaskCard.tsx` o `TodayPage.tsx`. En ninguno de los menús contextuales (`TodayTaskActionsMenu.tsx` o `EventTaskCard.tsx`) existe una acción directa "Posponer" o "Pausar".
5. **H-ACT-01 (Acciones Fragmentadas):**<br>
   En `EventTaskCard.tsx` el menú de tres puntos evolucionó a un menú flotante con "Reprogramar", "Ver detalle", "Editar tarea" y "Eliminar tarea". Sin embargo, en `TodayTaskActionsMenu.tsx` (vista Hoy) **únicamente figuran "Reprogramar" y "Ver detalles"**; la opción "Editar tarea" no está disponible desde Hoy, obligando al usuario a navegar hasta el evento para cambiar un nombre o nota.
6. **H-DUR-01 (Unidad de Duración):**<br>
   En `AddSubtaskDialog.tsx`, `EditSubtaskDialog.tsx` y `EventForm.tsx`, el campo continúa etiquetado como `Tiempo estimado *`. No se ha incorporado la indicación `(horas)` en la etiqueta visible.
7. **H-CON-01 (Campo Contacto):**<br>
   En `EventForm.tsx` (líneas 842–926) se resolvió dividiendo la sección en "Contacto del cliente" con dos campos específicos: "Nombre del contacto *" (`#event-contact`) y "Número de teléfono *" (`#event-contact-phone`) con icono de teléfono.
8. **H-SEC-01 (Confirmación de Contraseña):**<br>
   En `SignUpPage.tsx` se integró el campo "Confirmar contraseña" (`#signup-confirm-password`), visibilidad conmutables (mostrar/ocultar) y checklist de seguridad.

---

## 8. Investigación Profunda de las 6 Áreas Funcionales Críticas

### A. Capacidad diaria, límites de trabajo y sobrecarga de tareas

#### Dificultad Demostrada
Modificar la disponibilidad diaria es la operación con mayor tasa de fricción y fracaso en el estudio:
- Participante 1 se bloqueó totalmente (41:00); el moderador debió alterar el guion a 5 h.
- Participante 2 debió examinar el calendario día a día sumando horas manualmente (3/5).
- Participante 3 debió ingresar a los eventos y editar individualmente cada tarea (2/5).
- Participante 4 descubrió el conflicto pero reconoció que debió adivinar qué reorganizar.

#### Diagnóstico Técnico y de Interacción
1. **Falta de visibilidad del conflicto:** El sistema valida la integridad de forma binaria. Al fallar, solo emite un mensaje genérico o el nombre del día con mayor sobrecarga. No presenta una lista de tareas infractoras.
2. **Carencia de herramientas masivas:** Si un usuario reduce su jornada de 8 h a 4 h y tiene 6 días con 6 horas, debe ejecutar al menos 6 ciclos independientes de error, navegación, apertura de modales de reprogramación y reintento.
3. **Peligro de inducir falseamiento de datos:** Al no existir una reprogramación asistida, Participante 3 redujo las horas estimadas de la tarea para poder guardar, rompiendo la estimación real del compromiso.

#### Alternativas de Diseño Comparadas

* **Alternativa A.1 — Asistente de Diagnóstico y Redistribución Guiada (Recomendada):**<br>
  Al detectar sobrecarga al intentar guardar un nuevo límite, el modal no se cierra ni arroja un error seco. En su lugar, se expande a un paso 2 ("Diagnóstico de sobrecarga") mostrando una tabla de los días que superan el nuevo límite, las tareas causantes y opciones para:
  1. *Reprogramar individualmente:* Enlace directo que abre el diálogo de reprogramación sin salir del asistente.
  2. *Sugerencia automática de reubicación:* El motor de planificación calcula las fechas libres más próximas y las presenta como propuesta.
  * *Ventajas:* Mantiene el control humano (Nielsen #3), preserva las horas estimadas reales, elimina la navegación ciega.
  * *Riesgos:* Requiere coordinar el estado de múltiples tareas antes de persistir la preferencia.

* **Alternativa A.2 — Reprogramación Automática Silenciosa:**<br>
  El sistema desplaza automáticamente hacia adelante las tareas que excedan la capacidad.<br>
  * *Descarte:* **CRÍTICO — INACEPTABLE.** Viola la regla de negocio fundamental: *No modificar compromisos con clientes sin autorización explícita del usuario*.

* **Alternativa A.3 — Desacoplamiento de Regla (Advertencia "Soft"):**<br>
  Permitir guardar el límite de 4 h y marcar visualmente en la agenda los días sobrecargados con un estado de alerta rojo.<br>
  * *Descarte:* Aunque reduce la fricción inmediata, rompe la garantía de integridad del backend de Eventger, cuyo principio rector es impedir la sobrecarga operativa.

---

### B. Descubribilidad, coherencia y arquitectura de acciones

#### Dificultad Demostrada
Los participantes confunden constantemente qué herramienta utilizar para cada fin:
- Participante 2 confundió el icono de editar con reprogramar (01:02:15).
- Participante 3 subió hasta la cabecera ("Editar evento") para gestionar tareas de la lista.
- Participante 4 exigió que todas las operaciones de una tarea estuvieran en el menú de acciones (20:24).

#### Diagnóstico
Existe una asimetría funcional entre la vista de Detalle del Evento y la vista Hoy:

```
Vista Detalle del Evento:
  Tarjeta de Tarea ──> Botón "Registrar avance"
                  └──> Menú Acciones [Reprogramar | Ver detalle | Editar tarea | Eliminar tarea]

Vista Hoy:
  Tarjeta de Tarea ──> Botón "Registrar avance"
                  └──> Menú Acciones [Reprogramar | Ver detalle]  <── ¡FALTA "Editar tarea"!
```

Además, la acción "Editar tarea" (que abre `EditSubtaskDialog`) permite cambiar la fecha pero carece de la matriz de sugerencias de sobrecarga que sí tiene "Reprogramar" (`RescheduleTaskDialog`), provocando errores 400 opacos cuando el usuario edita la fecha desde el formulario general.

#### Solución Fundamentada
1. **Unificación simétrica:** Incluir "Editar detalles" en `TodayTaskActionsMenu.tsx`.
2. **Especialización semántica:**
   - `Editar detalles:` Permite modificar Nombre, Duración estimada y Notas. Si el usuario intenta cambiar la fecha aquí, un mensaje contextual le orienta: *"Para cambiar la fecha considerando tu disponibilidad, usa Reprogramar"*.
   - `Reprogramar:` Especializada exclusivamente en reubicación temporal asistida.
   - `Registrar avance:` Dedicada a registrar ejecución de la tarea.

---

### C. Prioridad, urgencia, modelo mental y ordenación de tareas

#### Dificultad Demostrada
- Participante 3 casi pierde una tarea programada para hoy porque apareció al final (29:17).
- Participante 4 dedujo que una tarea de 4 horas debía atenderse antes que una de 1 hora porque "requiere más esfuerzo" (07:50, 11:55).
- Participante 1 declaró espontáneamente que su regla mental era atender primero las vencidas (49:32).

#### Diagnóstico
1. **Confusión esfuerzo vs. urgencia:** En la psicología del trabajo, los usuarios sin entrenamiento en matrices de Eisenhower suelen equiparar volumen de trabajo con urgencia. El sistema ordena por menor duración primero (`first.estimatedHours - second.estimatedHours`) para maximizar tareas completadas (técnica "Quick Wins"), pero no comunica esta lógica al usuario.
2. **Visibilidad en Hoy:** Al no existir una indicación explícita del orden ni un selector de criterios (ej. ordenar por urgencia / ordenar por duración), el orden parece arbitrario o erróneo para el usuario.
3. **Invisibilidad de completadas:** En Hoy se ocultan totalmente las tareas completadas, impidiendo al usuario tener la retroalimentación de cierre de jornada.

#### Solución Fundamentada
1. En `TodayPage.tsx`, incorporar una cabecera explicativa o chip informativo: *"Ordenadas por fecha y menor duración"*.
2. Añadir la sección colapsable *"Completadas hoy"* al final de la vista Hoy cuando el filtro sea "Todos", permitiendo comprobar el progreso alcanzado en el día.
3. Garantizar que en el detalle del evento las tareas vencidas y de hoy tengan insignias de estado con contraste cromático suficiente (rojo/ámbar) para evitar la omisión experimentada por Participante 3.

---

### D. Estados de tareas, posposición y compromisos en espera

#### Dificultad Demostrada
El 100% de los participantes que debieron reflejar un proveedor que no confirmó (T5.2) fracasó en encontrar la opción "Pospuesta" de forma autónoma. Todos requirieron la pista explícita del moderador hacia "Registrar avance".

#### Diagnóstico
La acción primaria de la tarjeta se llama `Registrar avance` con un icono de lista de chequeo (`ListTodo`).
- En el modelo mental del usuario, registrar avance significa: "hice el 50%", "ya terminé", "avancé 2 horas".
- Suspender un compromiso indefinidamente porque un tercero no responde es un cambio de *estado operativo*, no un *avance*.
- Al esconder "Pospuesta" dentro de un modal de avance, se genera una barrera de reconocimiento insalvable (Nielsen #6).

#### Alternativas de Diseño Comparadas

* **Alternativa D.1 — Acción Explícita "Posponer / Dejar en espera" en Menú de Acciones (Recomendada):**<br>
  Incluir la opción *"Dejar en espera (Posponer)"* tanto en el menú contextual de la tarjeta como dentro de `RegisterProgressDialog.tsx`. Al seleccionarla, se abre un diálogo enfocado que:
  - Explica que la tarea saldrá de la carga diaria programada y no sumará horas al límite.
  - Solicita obligatoriamente una nota de seguimiento (*"¿Por qué se pone en espera?"*, ej. *Esperando confirmación de catering*).
  - Ofrece un campo opcional de *"Fecha de revisión"* para volver a alertar al organizador.
  * *Ventajas:* Cumple directamente con la expectativa expresada por Participante 4 y Participante 2; preserva la nota y el progreso del evento; descubre la funcionalidad sin necesidad de ayuda.

* **Alternativa D.2 — Nuevo Estado "En Espera" Independiente de "Pospuesta":**<br>
  Crear un estado adicional en base de datos (`on_hold`) diferenciado de `postponed`.<br>
  * *Descarte:* Innecesario a nivel de esquema backend en esta etapa; `postponed` ya cumple técnicamente con la exclusión de carga horaria. El problema es 100% de descubribilidad y semántica en la interfaz frontend.

---

### E. Semántica temporal, fechas, duraciones y planificación

#### Dificultad Demostrada
- Participante 4 no supo si 1.5 eran horas, minutos o días (04:49).
- Participante 1 tropezó con el formato de fecha y reclamó el estándar local DD/MM/AAAA (57:19).
- Participante 3 no distinguió si Contacto era el organizador o el teléfono (06:54).

#### Diagnóstico y Estado
1. **Unidades de medida:** Los campos numéricos sin sufijo o unidad explícita violan la prevención de errores (Nielsen #5). Un usuario podría ingresar "90" pensando en minutos y superar el límite de 4 horas con un error 400 confuso.
2. **Formato de fecha:** La discrepancia cultural entre ISO (AAAA-MM-DD), estándar anglosajón (MM/DD/AAAA) y latinoamericano (DD/MM/AAAA) provoca fricción si el campo de texto es libre.

#### Solución Fundamentada
1. En todos los modales de subtareas (`AddSubtaskDialog`, `EditSubtaskDialog`, `EventForm`), actualizar la etiqueta a: `Duración estimada (en horas) *` e incorporar un sufijo visual fijo `h` dentro del input o un texto de ayuda `ej. 1,5 h equivale a 1 hora y 30 minutos`.
2. Consolidar el uso de `DateInput.tsx` (con máscara visual `dd/mm/aaaa` y selector gráfico) en todos los formularios del sistema, eliminando cualquier input nativo desprotegido.

---

### F. Autenticación, registro, verificación y aislamiento de cuentas

#### Dificultad Demostrada
- Participante 4 sugirió confirmar contraseña para evitar bloqueos por erratas (27:37).
- Participante 1 contó caracteres con los dedos para llegar a 15 y no recibió el correo (01:16:18).
- Participante 3 se vio expuesto a eventos de otros usuarios por reutilización de cuentas (05:27).

#### Diagnóstico Técnico y de Seguridad
1. **Desacoplamiento de hitos:** El protocolo de prueba consideró "exitosa" la creación de la cuenta únicamente porque el formulario se envió. Sin embargo, en un sistema de producción, el ciclo completo comprende:
   $$\text{Envío Formulario} \longrightarrow \text{Creación Auth} \longrightarrow \text{Entrega Correo} \longrightarrow \text{Activación Token} \longrightarrow \text{Primer Login} \longrightarrow \text{Aislamiento BD}$$
2. **Requisitos de contraseña tardíos:** Exigir 15 caracteres mínimos sin comunicarlo antes de que el usuario empiece a escribir genera frustración inmediata.
3. **Contaminación de datos:** Realizar pruebas de usabilidad sobre cuentas compartidas sin purga de datos invalida las pruebas de priorización (Participante 3 vio bodas ajenas).

#### Solución Fundamentada
1. En `SignUpPage.tsx`, mantener el campo "Confirmar contraseña" y la lista de chequeo progresiva ya implementados.
2. Establecer un protocolo de pruebas que utilice cuentas sintéticas individuales preconfiguradas con fixture limpio para cada sesión.

---

## 9. Matriz de Causas Raíz

Para cada problema confirmado, se analiza la causa raíz específica en el diseño de interacción o en las reglas de implementación:

```
┌──────────────┬───────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ ID Hallazgo  │ Tipo de Causa Raíz                        │ Explicación Causal Específica                          │
├──────────────┼───────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ H-CAP-01     │ Falta de visibilidad y proceso repetitivo │ Backend acopla validación sincrónica con `.first()`;   │
│              │                                           │ Frontend no ofrece diagnóstico ni redistribución guiada│
│ H-POS-01     │ Acción oculta / Jerarquía incorrecta      │ Se subordinó un cambio de estado ("Pospuesta") dentro  │
│              │                                           │ de un diálogo rotulado como "Registrar avance"         │
│ H-ORD-01     │ Modelo mental incompatible y orden opaco │ Se asume heurística de menor duración sin explicarla;  │
│              │                                           │ Detalle de evento no separa visualmente vencidas/hoy   │
│ H-FIL-01     │ Carencia funcional y filtro inconsistente │ Falta parámetro de fecha en API/UI de Hoy;             │
│              │                                           │ Componente TodayPage omite la sección completed        │
│ H-ACT-01     │ Inconsistencia entre pantallas            │ Menú contextual incompleto en Hoy frente a EventDetail │
│ H-DUR-01     │ Terminología ambigua / Falta de unidad    │ Etiqueta "Tiempo estimado" sin sufijo "(horas)"        │
│ H-CON-01     │ Semántica insuficiente en formulario      │ Etiqueta monolítica "Contacto" sin separar nombre/tel  │
│ H-FEC-01     │ Localización y formato no adaptado        │ Entrada de fecha dependiente de locale del navegador   │
│ H-SEC-01     │ Prevención de errores insuficiente        │ Ausencia de confirmación de clave y reglas anticipadas │
│ H-AUT-01     │ Ambigüedad de retroalimentación           │ Mensaje de registro no precisa estado de verificación  │
│ H-MET-01     │ Error en el instrumento de evaluación     │ Escenario T4.2 planteó restricciones físicamente nulas │
│ H-MET-02     │ Sesgo del moderador y fixture contaminado │ Pistas directas transformaron fracaso en falso éxito   │
└──────────────┴───────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 10. Priorización Basada en Evidencia (P1 a P4)

La priorización se estructura combinando la **severidad técnica**, la **recurrencia empírica en las 4 sesiones**, el **bloqueo del objetivo principal** y el **costo de implementación**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CRITERIOS DE CLASIFICACIÓN:                                                            │
│ P1 (Crítico / Bloqueante): Impide completar la tarea; provoca abandono o corrupción.    │
│ P2 (Alto / Impacto Estructural): Genera severa fricción, demoras o requiere asistencia.│
│ P3 (Medio / Fricción Recuperable): Duda léxica o molestia menor que no frena la meta.  │
│ P4 (Bajo / Pulido Estético): Sugerencia estética o mejora menor de microcopy.          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

| Prioridad | ID Hallazgo | Descripción Sintética del Problema | Justificación Basada en Evidencia |
| :---: | :---: | :--- | :--- |
| **P1** | **H-CAP-01** | Bloqueo en ajuste de capacidad diaria sin diagnóstico multifecha ni resolución asistida. | Bloqueó a Participante 1 (abandono); requirió cálculos manuales en Participante 2 (3/5) y edición individual en Participante 3 (2/5). |
| **P1** | **H-ORD-01** | Orden temporal no visible y riesgo de omisión de compromisos urgentes del día. | Participante 3 casi omite una tarea de hoy ("Hubiera quedado mal al cliente"); Participante 4 invierte prioridades. |
| **P1** | **H-MET-01** | Incompatibilidad matemática del guion de prueba T4.2. | Forzó a Participante 3 a falsear horas reales; imposibilita medir usabilidad real. Requiere estandarización inmediata. |
| **P2** | **H-POS-01** | Imposibilidad de descubrir la opción "Posponer" oculta en "Registrar avance". | 0% de autonomía: 4 de 4 participantes requirieron intervención verbal del moderador para encontrarla. |
| **P2** | **H-ACT-01** | Inconsistencia de acciones entre Hoy y Detalle de Evento (falta Editar en Hoy). | Fragmenta la gestión; Participante 4 y Participante 2 reclamaron acceso unificado a las operaciones de la tarea. |
| **P2** | **H-FIL-01** | Imposibilidad de filtrar por fecha en Hoy y no visualización de tareas completadas. | Solicitado expresamente por Participante 2 (25/oct); detectado en matriz preliminar de estados. |
| **P2** | **H-DUR-01** | Ambigüedad en "Tiempo estimado" sin unidad de medida explícita (horas/minutos). | Reclamado por Participante 4 (04:49), Participante 1 (16:46) y Participante 3 (12:00). Alto riesgo de introducir errores 400. |
| **P2** | **H-AUT-01** | Flujo de registro, verificación y primer acceso no comprobados ni guiados. | Fricción con correo no recibido en Participante 1; necesidad de separar hitos de autenticación. |
| **P3** | **H-SEC-01** | Requisitos de contraseña tardíos y falta de campo de confirmación. | Expresado por Participante 4 (27:37) y Participante 1 (conteo de dedos). Corregido funcionalmente en frontend. |
| **P3** | **H-CON-01** | Ambigüedad del campo "Contacto" en formulario de creación de eventos. | Preguntado por Participante 3 (06:54). Corregido funcionalmente separando nombre y teléfono. |
| **P3** | **H-FEC-01** | Expectativa del formato tradicional DD/MM/AAAA. | Declarado por Participante 1 (57:19). Corregido funcionalmente con `DateInput.tsx`. |
| **P4** | **H-PRG-01** | Interpretación de "Carga diaria: 0 h" como ausencia total de trabajo pendiente. | Confusión conceptual puntual de Participante 3; requiere pulido de microcopy en resumen de métricas. |

---

## 11. Fichas de Remediación Detallada por Hallazgo Prioritario

A continuación se desarrollan las especificaciones completas para cada hallazgo crítico, conforme a la estructura analítica obligatoria:

---

### Ficha 1: H-CAP-01 — Capacidad Diaria y Resolución de Conflictos

* **ID del hallazgo:** H-CAP-01
* **Tarea y participante:** T4.1 / T4.2 — Participante 1, Participante 2, Participante 3, Participante 4.
* **Evidencia original:**<br>
  Participante 1: Bloqueo total por alerta de 5 h programadas al bajar a 4 h (*"¿Dónde me meto?"* 27:43; *"No entiendo"* 41:00). Participante 2: 51:56–55:37 navegó buscando fechas a mano (*"Me toca ir... 24 de octubre"*). Participante 3: 44:59–50:40 editó tareas una por una (*"No veo la opción"*, calificó 2/5). Participante 4: 15:36 (*"No me deja por esta tarea"*).
* **Tipo de evidencia:** OBSERVADO (conductas de búsqueda ciega e intentos repetidos) y DECLARADO (frustración explícita en transcripciones).
* **Problema observado:** La reducción del límite de horas diarias falla con un error 400 bloqueante que oculta la magnitud real del conflicto, obligando al usuario a localizar manualmente las fechas sobrecargadas y reprogramar individualmente tarea por tarea.
* **Estado en frontend actual:** **PARCIALMENTE CORREGIDO**. `DailyLimitDialog.tsx` maneja el stepper y captura `DailyLimitConflictError`, pero redirige a `/hoy` con un botón "Ver tareas en Hoy". Si la fecha conflictiva es futura, `/hoy` no la muestra.
* **Causa raíz:** Regla de negocio en backend (`validate_daily_limit_reduction`) sincrónica y acoplada a `.first()`, sin endpoint de previsualización de sobrecarga multifecha ni asistente guiado de resolución.
* **Impacto en el usuario:** Imposibilidad de actualizar la jornada de trabajo; abandono del flujo; inducción a falsear las estimaciones de tareas para sortear la restricción.
* **Severidad y confianza:** **SEVERIDAD ALTA (P1)** | **CONFIANZA ALTA** (demostrado en los 4 participantes).
* **Soluciones alternativas:**
  * *Alternativa 1 (Recomendada):* Modal de Diagnóstico y Asistente de Redistribución. Al intentar reducir el límite, si hay conflicto, el diálogo pasa a una vista detallada: lista todas las fechas afectadas, la suma de horas de cada una y un acordeón interactivo para reprogramar las tareas directamente sin salir del flujo.
  * *Alternativa 2 (Descartada):* Reprogramación automática hacia adelante por algoritmo. Se descarta porque violaría compromisos ya pactados con clientes sin consentimiento explícito.
* **Solución recomendada:** Implementar en `DailyLimitDialog.tsx` una vista de diagnóstico que consuma un nuevo endpoint de inspección `GET /subtasks/overload-check/?new_limit=X`. Si hay sobrecarga, presenta una tabla de resolución guiada con acceso directo al modal de reprogramación de cada tarea conflictiva.
* **Componentes afectados:** `DailyLimitDialog.tsx`, `PreferencesForm.tsx`, `usePlanningPreferences.ts`, `apps/subtasks/planning.py` (backend).
* **Criterios de aceptación:**
  1. Si un usuario reduce su capacidad y existen fechas sobrecargadas, el sistema debe mostrar *todas* las fechas en conflicto con su exceso exacto de horas.
  2. El usuario debe poder invocar la reprogramación de cada tarea infractora desde el mismo diálogo.
  3. No se debe permitir guardar un límite incompatible sin haber resuelto o confirmado las tareas causantes.
  4. Ninguna tarea debe ver alterada su duración estimada original sin confirmación del usuario.
* **Prueba de validación:** Participante con límite de 6 h y dos días futuros con 5 h intenta reducir a 4 h. Debe visualizar el diagnóstico de ambos días, reprogramar una tarea de cada fecha hacia días con disponibilidad y confirmar el nuevo límite en menos de 3 minutos sin ayuda externa.
* **Riesgos y limitaciones:** Requiere sincronización en tiempo real del estado de tareas entre el modal de reprogramación y el diálogo de capacidad.

---

### Ficha 2: H-POS-01 — Descubribilidad del Estado "Pospuesta / En Espera"

* **ID del hallazgo:** H-POS-01
* **Tarea y participante:** T5.2 — Participante 1, Participante 2, Participante 3, Participante 4.
* **Evidencia original:**<br>
  Ningún participante descubrió de manera autónoma cómo posponer el catering. Participante 2 propuso escribir una nota y moverla al final (01:17:07). Participante 4 no supo qué fecha poner al no haber confirmación del proveedor (19:33). Los cuatro requirieron que el moderador les dijera: *"dale en Registrar avance"* (Participante 1 01:03:32; Participante 2 01:19:37; Participante 3 01:03:33; Participante 4 20:18). Participante 4 calificó 4.5/5 *"por el tema de no haber puesto el pospuesto"*.
* **Tipo de evidencia:** OBSERVADO (incapacidad de localizar el control sin pista) y DECLARADO (dudas expresas sobre qué fecha asignar).
* **Problema observado:** La opción para suspender o posponer una tarea sin fecha confirmada está oculta dentro del flujo de "Registrar avance", violando el principio de reconocimiento sobre recuerdo.
* **Estado en frontend actual:** **PERSISTENTE Y CONFIRMADO**. `RegisterProgressDialog.tsx` sigue siendo la única puerta de entrada a `postponed`. `TodayTaskActionsMenu.tsx` y `EventTaskCard.tsx` no tienen opción directa de posposición.
* **Causa raíz:** Jerarquía de interacción deficiente: se modeló la suspensión temporal como una variante de avance en lugar de una acción de gestión de estado o de agenda.
* **Impacto en el usuario:** Confusión operativa; tareas que quedan estancadas como pendientes consumiendo erróneamente capacidad diaria de la jornada.
* **Severidad y confianza:** **SEVERIDAD ALTA (P2)** | **CONFIANZA MÁXIMA** (4 de 4 participantes fallaron autónomamente).
* **Soluciones alternativas:**
  * *Alternativa 1 (Recomendada):* Incorporar la acción *"Dejar en espera / Posponer"* directamente en el menú de acciones de `EventTaskCard.tsx` y `TodayTaskActionsMenu.tsx`. Al hacer clic, abre un modal simplificado que solicita la nota justificativa y cambia el estado a `postponed`.
  * *Alternativa 2 (Descartada):* Agregar un botón visible permanente "Posponer" al lado de "Registrar avance" en la tarjeta. Se descarta porque satura visualmente la tarjeta de la tarea y degrada la jerarquía en pantallas móviles.
* **Solución recomendada:** Añadir la opción en el menú contextual con icono de pausa (`Pause`), manteniendo también la opción dentro de `RegisterProgressDialog` para redundancia positiva. Al posponer, mostrar un banner informativo confirmando que la tarea no computará en la carga horaria.
* **Componentes afectados:** `EventTaskCard.tsx`, `TodayTaskActionsMenu.tsx`, `RegisterProgressDialog.tsx`.
* **Criterios de aceptación:**
  1. El menú contextual de la tarea debe incluir la opción *"Posponer / Dejar en espera"*.
  2. Al seleccionarla, debe exigirse o solicitarse una nota explicativa sobre el motivo de la espera.
  3. La tarea debe transicionar a estado `postponed`, visualizándose con insignia gris neutral y la indicación *"Sin fecha · No cuenta en la carga planificada"*.
  4. La operación debe poder revertirse fácilmente desde el mismo menú mediante la opción *"Reprogramar / Reanudar"*.
* **Prueba de validación:** Se instruye al usuario reflejar que un proveedor de sonido no responderá hasta la próxima semana. El usuario debe poder localizar "Posponer" y registrar la nota en menos de 30 segundos sin intervención del evaluador.
* **Riesgos y limitaciones:** Asegurar que el backend no exija una fecha futura válida cuando la tarea pasa a `postponed` (el backend actual ya admite `target_date=null` o conserva la fecha previa sin computarla en carga).

---

### Ficha 3: H-ORD-01 — Orden y Priorización en Vista Hoy y Detalle de Evento

* **ID del hallazgo:** H-ORD-01
* **Tarea y participante:** T3.1 / T3.2 — Participante 3, Participante 4, Participante 1.
* **Evidencia original:**<br>
  Participante 3 casi omite una tarea programada para hoy porque apareció al fondo de la lista (*"No lo había visto... Hubiera quedado mal al cliente"*, 29:17, 39:37). Participante 4 supuso que una tarea más larga tenía mayor prioridad y debía atenderse primero (*"como requiere mucho más trabajo... darle prioridad a esta"*, 07:50, 11:55). Participante 1 afirmó que su prioridad natural son las vencidas (49:32).
* **Tipo de evidencia:** OBSERVADO (omisión de tarea en pantalla) y DECLARADO (raciocinio de esfuerzo vs. urgencia).
* **Problema observado:** Las tareas urgentes no tienen una diferenciación perceptual suficiente en listas largas, y el criterio de ordenamiento en la vista Hoy es invisible, colisionando con el modelo mental del usuario.
* **Estado en frontend actual:** **PARCIALMENTE CORREGIDO**. En `EventDetailContent.tsx` se integró `sortSubtasksForEventDetail` (ordena completadas al final y activas por fecha). En `TodayPage.tsx` se divide en Vencidas, Hoy y Próximas, pero el criterio de orden interno (menor duración) sigue sin comunicarse.
* **Causa raíz:** Falta de affordance y transparencia algorítmica: el sistema aplica una heurística de optimización temporal ("Quick Wins") sin rótulos explicativos ni soporte para prioridades explícitas.
* **Impacto en el usuario:** Omisión involuntaria de compromisos con clientes; estrés operativo por desorganización percibida.
* **Severidad y confianza:** **SEVERIDAD ALTA (P1)** | **CONFIANZA ALTA** (reproducido en Participante 3 y Participante 4).
* **Soluciones alternativas:**
  * *Alternativa 1 (Recomendada):* Transparencia heurística y destacados visuales. En Hoy, incluir un selector de orden secundario discreto: *"Ordenar por: Menor duración (predeterminado) | Mayor duración | Nombre"* y un chip que explique el criterio activo. En el detalle del evento, reforzar el borde lateral de acento cromático (rojo para vencidas, ámbar para hoy).
  * *Alternativa 2 (Descartada):* Introducir un campo obligatorio de prioridad (Alta, Media, Baja) en la creación de subtareas. Se descarta en esta fase para no elevar la carga cognitiva en la creación rápida de eventos.
* **Solución recomendada:** Implementar Alternativa 1. Garantizar que en cualquier vista de lista, las tareas del día actual o vencidas tengan prioridad espacial estricta (arriba del pliegue) y contraste visual reforzado.
* **Componentes afectados:** `TodayPage.tsx`, `today.service.ts`, `TodayPriorityGuide.tsx`, `EventTaskCard.tsx`.
* **Criterios de aceptación:**
  1. En la vista Hoy, las secciones Vencidas y Para hoy deben preceder físicamente a Próximas en el DOM.
  2. Cada sección debe indicar el número de tareas y las horas acumuladas.
  3. Si una tarea vence hoy, su tarjeta debe incluir la insignia visual *"Hoy"* en tono ámbar de alto contraste (`#c2410c`).
  4. Debe mostrarse una nota sutil: *"Tareas ordenadas por fecha y menor duración estimada"*.
* **Prueba de validación:** Se cargan 8 tareas mixtas (2 vencidas, 2 para hoy de distinta duración, 4 futuras). El participante debe identificar en menos de 10 segundos cuáles son los dos compromisos obligatorios de la jornada.
* **Riesgos y limitaciones:** Ninguno funcional; cambio puramente de presentación y transparencia informativa.

---

### Ficha 4: H-ACT-01 — Simetría de Acciones y Menú Contextual Completo

* **ID del hallazgo:** H-ACT-01
* **Tarea y participante:** T2 / T4 — Participante 4, Participante 2, Participante 3.
* **Evidencia original:**<br>
  Participante 4 verbalizó enfáticamente: *"aquí solamente me da una opción de reprogramar verdad pero entonces siento yo que todas las acciones que se puedan hacer en una tarea deberían estar aquí en los tres puntos... no puedo editar como tal la tarea desde aquí"* (20:24). Participante 2 se confundió entre el lápiz y reprogramar (01:02:15). Participante 3 se quejó de tener que subir a "Editar evento" para modificar detalles de subtareas (01:16:55).
* **Tipo de evidencia:** DECLARADO (demanda explícita de Participante 4) y OBSERVADO (desplazamientos innecesarios en Participante 3).
* **Problema observado:** Las acciones operativas sobre una tarea están fragmentadas: algunas en la tarjeta, otras en el menú contextual, otras ocultas en el formulario del evento general, y con menús inconsistentes entre `/hoy` y `/evento/:id`.
* **Estado en frontend actual:** **PARCIALMENTE CORREGIDO**. `EventTaskCard.tsx` ya incluye "Editar tarea", pero `TodayTaskActionsMenu.tsx` (vista Hoy) todavía carece de ella.
* **Causa raíz:** Desarrollo desacoplado de componentes entre páginas que atienden al mismo objeto de dominio (`Subtask`).
* **Impacto en el usuario:** Pérdida de tiempo navegando entre pantallas; desorientación sobre dónde corregir un error tipográfico o cambiar una nota.
* **Severidad y confianza:** **SEVERIDAD MEDIA-ALTA (P2)** | **CONFIANZA ALTA** (confirmado en código y pruebas).
* **Soluciones alternativas:**
  * *Alternativa 1 (Recomendada):* Menú contextual unificado y compartido. Utilizar un único componente de acciones para tarjetas de tareas tanto en Hoy como en Detalle de Evento que exponga: *Registrar avance, Reprogramar, Editar detalles, Posponer, Eliminar*.
  * *Alternativa 2 (Descartada):* Añadir múltiples botones iconográficos en la tarjeta. Se descarta porque colapsa el espacio en viewports móviles (320px–375px).
* **Solución recomendada:** Implementar Alternativa 1 integrando `EditSubtaskDialog` dentro de `TodayPage.tsx` mediante `TodayTaskActionsMenu.tsx`.
* **Componentes afectados:** `TodayTaskActionsMenu.tsx`, `TodayPage.tsx`, `EventTaskCard.tsx`.
* **Criterios de aceptación:**
  1. El menú de acciones en `/hoy` debe contener: *Registrar avance (en móvil), Reprogramar, Editar detalles, Ver notas*.
  2. Al pulsar *Editar detalles* desde Hoy, se debe abrir el modal de edición de la subtarea sin redirigir al evento.
  3. Los cambios de nombre, duración o notas guardados desde Hoy deben reflejarse de inmediato en la lista sin recarga completa de página.
* **Prueba de validación:** El participante se encuentra en `/hoy` y se le pide corregir una errata en el nombre de una tarea. Debe completarlo desde la misma pantalla en menos de 20 segundos sin ingresar al detalle del evento.
* **Riesgos y limitaciones:** Manejo del estado local y revalidación de caché en `TodayPage`.

---

### Ficha 5: H-DUR-01 — Claridad Semántica de la Duración Estimada

* **ID del hallazgo:** H-DUR-01
* **Tarea y participante:** T2 — Participante 4, Participante 1, Participante 3, Evaluador (O-02).
* **Evidencia original:**<br>
  Participante 4 dedicó un minuto completo a explicar la ambigüedad: *"en qué está estipulado el tiempo estimado... si están horas, minutos, días... para un usuario que tal vez no sepa y no sea tan intuitivo, tiempo estimado le puede poner 60 minutos o un día... aclarar en esta parte tiempo estimado en horas"* (04:49–05:47, 10:57). Participante 1 preguntó: *"¿A qué se refiere tiempo estimado?"* (16:46).
* **Tipo de evidencia:** DECLARADO (análisis verbal espontáneo de Participante 4) y OBSERVADO (pausas de vacilación).
* **Problema observado:** El campo de duración carece de la unidad de medida explícita en su rótulo principal, induciendo a error sobre si se esperan horas, minutos o jornadas de trabajo.
* **Estado en frontend actual:** **PERSISTENTE Y CONFIRMADO**. El label sigue siendo `Tiempo estimado *` en `AddSubtaskDialog.tsx`, `EditSubtaskDialog.tsx` y `EventForm.tsx`.
* **Causa raíz:** Omisión de microcopy descriptivo en el diseño de formularios básicos.
* **Impacto en el usuario:** Dudas de entrada; riesgo de introducir valores inválidos (ej. ingresar 120 por 120 minutos, disparando error de sobrecarga de límite).
* **Severidad y confianza:** **SEVERIDAD MEDIA (P2)** | **CONFIANZA MÁXIMA** (unanimidad de participantes).
* **Solución recomendada:** Modificar el texto visible a: `Duración estimada (horas) *` e incluir texto de ayuda o placeholder: `ej. 1,5 (1 hora y 30 min)`. En los inputs con stepper, mantener el sufijo visual `h` junto al número.
* **Componentes afectados:** `AddSubtaskDialog.tsx`, `EditSubtaskDialog.tsx`, `EventForm.tsx`.
* **Criterios de aceptación:**
  1. Todos los formularios de subtareas deben rotular el campo como `Duración estimada (horas) *`.
  2. Debe existir un texto descriptivo visible: *"Indica el tiempo en horas (admite decimales, ej. 1,5 h)"*.
* **Prueba de validación:** Usuario nuevo sin experiencia previa crea su primera tarea; debe ingresar la duración de 2 horas y media sin preguntar qué unidad se espera.
* **Riesgos y limitaciones:** Ninguno. Corrección puramente de interfaz y microcopy.

---

### Ficha 6: H-FIL-01 — Filtro por Fecha y Visualización de Completadas en Hoy

* **ID del hallazgo:** H-FIL-01
* **Tarea y participante:** T3.2 — Participante 2, Matriz preliminar de hallazgos.
* **Evidencia original:**<br>
  Participante 2 solicitó filtrar para revisar específicamente los compromisos del 25 de octubre; el moderador confirmó que la función no existía (01:09:38). La matriz preliminar consignó: *"Revisar filtro de estados, al filtrar todos no aparecen los completados o si?"*.
* **Tipo de evidencia:** DECLARADO (petición de función) y OBSERVADO (ausencia de sección de completadas en DOM).
* **Problema observado:** La vista Hoy no permite acotar la agenda a una fecha futura concreta, y el filtro "Todos" no muestra las tareas completadas, generando la falsa impresión de que se borraron.
* **Estado en frontend actual:** **PERSISTENTE Y CONFIRMADO**. `TodayFilters.tsx` no tiene selector de fecha, y `TodayPage.tsx` no renderiza `todayResponse.data.completed`.
* **Causa raíz:** Decisión de diseño que asumió que `/hoy` solo debía mostrar trabajo pendiente activo, descartando la necesidad de auditoría de jornada y consulta retrospectiva.
* **Impacto en el usuario:** Imposibilidad de planificar jornadas específicas; incertidumbre sobre si las tareas completadas fueron registradas exitosamente.
* **Severidad y confianza:** **SEVERIDAD MEDIA-ALTA (P2)** | **CONFIANZA ALTA**.
* **Solución recomendada:**
  1. En `TodayPage.tsx`, renderizar una cuarta sección colapsable al final: `<TodayTaskSection title="Completadas hoy" tasks={data.completed} />` visible cuando el filtro sea "Todos".
  2. Incorporar un control de filtro por fecha en `TodayFilters.tsx` que permita enfocar una fecha arbitraria de la agenda.
* **Componentes afectados:** `TodayPage.tsx`, `TodayFilters.tsx`, `today.service.ts`.
* **Criterios de aceptación:**
  1. Al seleccionar el filtro "Todos", las tareas finalizadas durante el día deben listarse en una sección "Completadas hoy" con estilo tachado o insignia verde.
  2. El usuario debe poder filtrar tareas de una fecha determinada para revisar la carga de ese día.
* **Prueba de validación:** El usuario completa una tarea en Hoy y verifica que la misma permanezca visible en la sección de completadas sin desaparecer abruptamente.
* **Riesgos y limitaciones:** Asegurar que las tareas completadas no abulten innecesariamente la vista en pantallas móviles pequeñas (deben presentarse colapsadas por defecto si superan 3 elementos).

---

## 12. Matriz de Impacto en Componentes Compartidos y Riesgos de Regresión

Toda modificación de usabilidad debe considerar su repercusión sobre componentes transversales:

```
┌───────────────────────────────┬────────────────────────────────────────┬──────────────────────────────────────────┐
│ Componente Compartido         │ Puntos de Uso en la Aplicación         │ Riesgo de Regresión Identificado         │
├───────────────────────────────┼────────────────────────────────────────┼──────────────────────────────────────────┤
│ DateInput.tsx                 │ EventForm, EditEventForm, SubtaskModal │ Incompatibilidad de parseo UTC/Bogotá    │
│ EventTaskCard.tsx             │ EventDetailPage, EventProgressModal    │ Desborde de menú contextual en móviles   │
│ TodayTaskActionsMenu.tsx      │ TodayPage (Tarjetas de Hoy)            │ Pérdida de accesibilidad por teclado     │
│ RegisterProgressDialog.tsx    │ EventDetailPage, TodayPage             │ Bloqueo de modal si falla llamada a API  │
│ RescheduleTaskDialog.tsx      │ EventDetailPage, TodayPage             │ Inconsistencia en matriz de sugerencias  │
│ DailyLimitDialog.tsx          │ TodayPage, SettingsPage, ProfileMenu   │ Ciclo infinito de revalidación de límites│
│ today.service.ts              │ TodayPage, Hooks de sincronización     │ Ruptura de orden en pruebas unitarias    │
└───────────────────────────────┴────────────────────────────────────────┴──────────────────────────────────────────┘
```

### Medidas Preventivas de Arquitectura
1. **Contrato de Fecha Inmutable:** Cualquier fecha que viaje hacia el backend debe normalizarse a través de `getCalendarDate()` (`YYYY-MM-DD` en zona horaria `America/Bogota`), impidiendo desviaciones por huso horario del navegador.
2. **Encapsulamiento de Menús Flotantes (Portals):** Los menús de acciones de `TodayTaskActionsMenu` y `EventTaskCard` deben renderizarse en el nodo raíz del DOM mediante `createPortal`, evitando cortes de overflow (`overflow: hidden`) en tarjetas o tablas contenedoras.
3. **Manejo de Errores No Destructivo:** Si una actualización de estado o reprogramación falla en red, el modal debe permanecer abierto reteniendo los datos ingresados para evitar la frustración de reescribir notas o fechas.

---

## 13. Reglas de Negocio e Integridad Funcional a Preservar

La remediación de usabilidad **no debe vulnerar bajo ninguna circunstancia** las reglas de negocio del sistema:

1. **Regla de Capacidad Inviolable:** Ningún día puede superar el `daily_limit_hours` del usuario sin una confirmación explícita o resolución asistida. No se debe relajar la validación en backend.
2. **Conservación del Esfuerzo Estimado:** Las herramientas de reprogramación o resolución de conflictos no deben alterar automáticamente el campo `estimated_hours` de las tareas. Si una tarea dura 3 horas, debe seguir durando 3 horas al ser movida de fecha.
3. **Horizonte Temporal del Evento:** Ninguna tarea puede programarse para una fecha posterior a la fecha de celebración del evento asociado (`target_date <= event_date`).
4. **Determinismo en Métricas de Progreso:** El progreso de un evento se calcula de forma determinista por el backend (`apps/events/services.py`). Una tarea `postponed` no suma como completada pero tampoco penaliza como atrasada; queda excluida de la carga planificada.
5. **Aislamiento Multiusuario Estricto:** Cada usuario autenticado a través de Clerk únicamente tiene visibilidad y acceso a sus propios eventos y configuraciones, filtrados a nivel de queryset en Django por `user_id`.

---

## 14. Plan de Remediación por Etapas de Implementación

Para asegurar una entrega incremental y controlada, se proyectan 4 etapas de ejecución:

```
[ETAPA 1: Microcopy, Semántica y Prevención Inmediata (P2 / P3)]
  ├── Actualizar rótulo "Duración estimada (horas) *" en AddSubtaskDialog, EditSubtaskDialog y EventForm.
  ├── Explicitar formato DD/MM/AAAA y ayuda textual de conversión de minutos a decimales.
  ├── Incorporar tooltip / banner explicativo de ordenación en TodayPage ("Quick Wins").
  └── Esfuerzo estimado: Bajo (Frontend puro) — Riesgo: Mínimo.

[ETAPA 2: Descubribilidad y Acciones de Tarea (P2)]
  ├── Unificar TodayTaskActionsMenu incorporando la opción "Editar detalles".
  ├── Añadir la acción directa "Posponer / Dejar en espera" en menús contextuales de tarjetas.
  ├── Mejorar RegisterProgressDialog para que la posposición refuerce la no-computación de carga.
  └── Esfuerzo estimado: Medio (Frontend) — Riesgo: Bajo.

[ETAPA 3: Asistente de Capacidad y Diagnóstico Multifecha (P1)]
  ├── Extender backend con endpoint /subtasks/overload-check/ para inspección previa de límite.
  ├── Implementar vista de diagnóstico en DailyLimitDialog con listado de fechas conflictivas.
  ├── Integrar enlaces directos a reprogramación individual dentro del modal de diagnóstico.
  └── Esfuerzo estimado: Alto (Fullstack) — Riesgo: Medio (requiere pruebas de integración).

[ETAPA 4: Filtros Avanzados y Cierre de Jornada en Hoy (P2)]
  ├── Renderizar sección colapsable "Completadas hoy" en TodayPage bajo el filtro "Todos".
  ├── Diseñar e integrar filtro por fecha específica en TodayFilters.
  └── Esfuerzo estimado: Medio (Fullstack) — Riesgo: Bajo.
```

---

## 15. Auditoría Metodológica del Protocolo de Pruebas

Antes de planificar nuevas evaluaciones, es imprescindible auditar las debilidades metodológicas del estudio analizado:

1. **Sesgo por Inducción del Moderador (Efecto Clever Hans):**<br>
   En múltiples ocasiones (Participante 1 30:53; Participante 2 01:19:37; Participante 3 44:36; Participante 4 20:18), el moderador ofreció pistas directas que transformaron un fracaso operativo en una tarea completada. En futuros estudios, el facilitador debe mantener una política estricta de silencio (*"Think Aloud" puro*); si el participante no encuentra la función tras 2 minutos de búsqueda, la tarea debe registrarse como **No completada autónomamente**.
2. **Contradicción Matemática del Guion (T4.2):**<br>
   Exigir acomodar 5 horas en un límite de 4 horas el mismo día sin permitir mover de fecha ni dividir el trabajo fue un error de diseño experimental. El participante no falló por incompetencia, sino porque el problema planteado carecía de solución admisible bajo las reglas del software.
3. **Contaminación de Datos por Cuentas Compartidas:**<br>
   Participante 3 visualizó datos de sesiones previas. Las pruebas con usuarios exigen **cuentas sintéticas aisladas con fixtures automatizados limpios** (`seeding` idempotente antes de cada participante).
4. **Desconexión entre Puntuación de Facilidad y Desempeño:**<br>
   Se constató que participantes que sufrieron bloqueos severos otorgaron calificaciones de 5/5 por complacencia social con el evaluador. Las métricas primarias de usabilidad deben ser objetivas: **Tasa de éxito autónomo**, **Número de errores**, **Tiempo neto en tarea** y **Solicitudes de auxilio**, relegando la escala de facilidad a una métrica secundaria de percepción.
5. **Integridad del Registro Audiovisual:**<br>
   La pausa de la grabación en Participante 4 para ingresar credenciales impidió verificar el flujo completo de autenticación. Se debe proveer credenciales ficticias de prueba preestablecidas que puedan grabarse sin comprometer la privacidad del usuario.

---

## 16. Plan de Validación Empírica con Nuevas Pruebas de Usabilidad

Para verificar que las correcciones recomendadas resuelven efectivamente las dificultades sin introducir regresiones, se define el siguiente protocolo para una nueva ronda de pruebas ($N=5$ usuarios representativos):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PROTOCOLO ESTANDARIZADO DE PRUEBA DE USABILIDAD VALIDATORIA                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Tarea V-01: Reducción de Capacidad con Sobrecarga Guiada (Valida H-CAP-01)             │
│   - Objetivo: Reducir disponibilidad de 6 a 4 h existiendo dos días con 5 h.           │
│   - Condición inicial: Evento "Feria Empresarial" cargado con tareas preexistentes.    │
│   - Criterio de éxito: El usuario visualiza el diagnóstico de los dos días,            │
│     reprograma una tarea de cada fecha y completa el guardado sin ayuda en < 3 min.   │
│   - Evidencia a capturar: Tiempo en tarea, clics en reprogramación, cero errores 400.   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Tarea V-02: Suspensión de Tarea por Falta de Respuesta de Tercero (Valida H-POS-01)    │
│   - Objetivo: Dejar en espera la tarea "Confirmar catering" con nota explicativa.      │
│   - Condición inicial: Tarea visible en la vista Hoy.                                  │
│   - Criterio de éxito: El usuario utiliza la acción "Posponer / Dejar en espera"       │
│     desde el menú de la tarjeta y guarda la nota en < 45 s de forma 100% autónoma.     │
│   - Evidencia a capturar: Descubribilidad en menú de acciones, cero ingresos a editar. │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Tarea V-03: Despacho y Reconocimiento de Prioridades en Hoy (Valida H-ORD-01 / H-FIL-01)│
│   - Objetivo: Identificar la tarea más urgente de la jornada y verificar completadas.  │
│   - Criterio de éxito: Reconocimiento inmediato de la tarea de hoy (arriba de lista),   │
│     marcado de avance y comprobación de su presencia en "Completadas hoy".             │
│   - Evidencia a capturar: Secuencia visual de lectura, verbalización de comprensión.   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Tarea V-04: Creación de Tarea con Duración Decimal (Valida H-DUR-01)                   │
│   - Objetivo: Registrar tarea "Revisión técnica" que tomará 1 hora y media.            │
│   - Criterio de éxito: Ingreso de "1.5" reconociendo la unidad explícita (horas).      │
│   - Evidencia a capturar: Cero dudas verbalizadas sobre minutos vs. horas.             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 17. Criterio Principal de Éxito: Respuestas a las 4 Preguntas Clave

Como síntesis metodológica de la auditoría, cada una de las soluciones propuestas responde rigurosamente a las cuatro preguntas fundamentales de diseño centrado en el usuario:

### 1. Asistente de Capacidad y Diagnóstico Multifecha (H-CAP-01)
1. **¿Qué comportamiento real demuestra la dificultad?**<br>
   Participante 1 declaró bloqueo total (*"No sé qué hacer"*, 41:07) tras ser rechazada por 5 h programadas; Participante 2 debió calcular a mano revisando fecha por fecha en el calendario durante más de 4 minutos (51:56); Participante 3 debió salir de la pantalla y editar subtareas una a una (44:59).
2. **¿Qué característica de la aplicación explica la dificultad?**<br>
   El backend ejecuta una validación binaria sincrónica que rechaza con error 400 devolviendo solo la primera fecha sobrecargada, mientras que el frontend carece de un mapa de conflicto multifecha y redirige ciegamente a `/hoy` sin herramientas de rebalanceo asistido.
3. **¿Cómo modifica la propuesta la interacción para resolver el problema?**<br>
   Transforma el error 400 en un asistente guiado de diagnóstico: despliega todas las fechas que superan el nuevo límite, lista las tareas causantes y ofrece enlaces directos de reprogramación modal dentro del mismo flujo sin perder el borrador de horas.
4. **¿Qué evidencia permitirá comprobar que la solución funcionó?**<br>
   En la prueba de validación V-01, el 100% de los participantes reducirá su límite diario resolviendo los conflictos asociados en menos de 3 minutos, con cero abandonos y sin necesidad de indicaciones externas.

### 2. Acción Contextual Directa "Posponer / Dejar en Espera" (H-POS-01)
1. **¿Qué comportamiento real demuestra la dificultad?**<br>
   El 100% de los participantes que intentaron reflejar un proveedor que no podía confirmar fracasó en encontrar la opción de manera autónoma; todos permanecieron bloqueados hasta que el moderador les ordenó verbalmente entrar a "Registrar avance".
2. **¿Qué característica de la aplicación explica la dificultad?**<br>
   La opción "Pospuesta" está subordinada internamente dentro de un modal titulado "Registrar avance", contradiciendo el modelo mental del usuario (que asocia "avance" a progreso o finalización, no a suspensión temporal de actividades).
3. **¿Cómo modifica la propuesta la interacción para resolver el problema?**<br>
   Expone la acción *"Dejar en espera (Posponer)"* directamente en el menú de acciones de la tarjeta de tarea (`EventTaskCard` y `TodayTaskActionsMenu`), abriendo un diálogo dedicado que solicita la nota explicativa y aclara visualmente que no consumirá horas de la agenda.
4. **¿Qué evidencia permitirá comprobar que la solución funcionó?**<br>
   En la prueba V-02, los participantes pospondrán la tarea con una tasa de autonomía del 100% en menos de 45 segundos, sin que el moderador deba intervenir.

### 3. Transparencia de Orden y Destacados de Urgencia en Hoy (H-ORD-01)
1. **¿Qué comportamiento real demuestra la dificultad?**<br>
   Participante 3 pasó por alto una tarea urgente para el día de hoy porque quedó renderizada al final de la pantalla (*"No lo había visto... Hubiera quedado mal al cliente"*, 29:17); Participante 4 asumió erróneamente que una tarea más larga es más urgente (07:50).
2. **¿Qué característica de la aplicación explica la dificultad?**<br>
   La vista Hoy ordena de forma encubierta por menor tiempo estimado ("Quick Wins") sin transparentar el criterio al usuario, y en el detalle del evento las tareas activas carecían de agrupación temporal por pliegues de urgencia.
3. **¿Cómo modifica la propuesta la interacción para resolver el problema?**<br>
   Establece una jerarquía visual estricta en el DOM (Vencidas $\rightarrow$ Hoy $\rightarrow$ Próximas), acompaña la lista con un chip informativo del criterio activo de ordenación y refuerza el contraste de las insignias cromáticas de fecha.
4. **¿Qué evidencia permitirá comprobar que la solución funcionó?**<br>
   En la prueba V-03, ningún participante omitirá tareas de la jornada actual y el tiempo de identificación del compromiso prioritario se reducirá a menos de 10 segundos.

### 4. Explicitación de Unidades en Duración Estimada (H-DUR-01)
1. **¿Qué comportamiento real demuestra la dificultad?**<br>
   Participante 4 vaciló antes de escribir y dedicó un análisis completo a la ausencia de unidad (*"si son horas, minutos o días"*, 04:49); Participante 1 preguntó directamente a qué se refería tiempo estimado (16:46).
2. **¿Qué característica de la aplicación explica la dificultad?**<br>
   La etiqueta del formulario dice escuetamente `Tiempo estimado *` sin ninguna indicación textual ni sufijo de medida en el campo de captura.
3. **¿Cómo modifica la propuesta la interacción para resolver el problema?**<br>
   Renombra la etiqueta a `Duración estimada (horas) *`, añade un texto de ayuda `ej. 1,5 h (1 hora y 30 min)` y fija el sufijo visual `h` en los inputs.
4. **¿Qué evidencia permitirá comprobar que la solución funcionó?**<br>
   En la prueba V-04, el 100% de los usuarios ingresará duraciones decimales válidas sin titubeos verbales ni preguntas al evaluador sobre la unidad esperada.

---

## 18. Conclusión

La auditoría demuestra que **Eventger cuenta con una arquitectura técnica robusta y una presentación visual cuidada, pero traslada una carga operativa y cognitiva excesiva al usuario en situaciones de conflicto y reorganización horaria**.

Al corregir la visibilidad de los estados de espera, explicitar las unidades temporales, transparentar la heurística de ordenación y dotar al sistema de un asistente de diagnóstico para la capacidad diaria, la aplicación alcanzará un nivel de usabilidad armónico con su excelencia técnica, garantizando que organizadores de eventos planifiquen sus jornadas con total autonomía, previsibilidad y sin fricción.
