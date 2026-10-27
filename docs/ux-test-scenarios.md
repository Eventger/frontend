# Protocolo y Escenarios de Validación UX: Automatización y Pruebas con Usuarios

**Documento:** Escenarios de Comprobación Técnica y Validación Empírica<br>
**Producto:** Eventger Web<br>
**Fecha:** 26 de Octubre de 2026<br>
**Enfoque Metodológico:** Doble vía de verificación — (1) Pruebas automatizadas de regresión y accesibilidad (Vitest / Playwright / axe-core) y (2) Protocolo estandarizado de pruebas de usabilidad con usuarios reales ($N=5$).<br>

---

## 1. Marco de Validación y Benchmarking de Usabilidad

Para asegurar que las remediaciones resuelvan la causa raíz sin trasladar fricción ni degradar la experiencia, se establecen métricas objetivas de referencia (Benchmarking según GOV.UK Service Manual y Sauro & Lewis, 2016):

```
┌─────────────────────────────────┬────────────────────────────┬─────────────────────────────┐
│ Métrica de Rendimiento          │ Estado Previo (Línea Base) │ Meta de Validación Aceptable│
├─────────────────────────────────┼────────────────────────────┼─────────────────────────────┤
│ Tasa de Éxito Autónomo (T4)     │ 0% sin ayuda externa       │ >= 90% sin ninguna pista    │
│ Tasa de Descubribilidad (T5.2)  │ 0% autónomo (100% pistas)  │ 100% en primer intento      │
│ Tiempo Medio en Reducción (T4)  │ > 4 min (cálculo manual)   │ < 90 segundos asistido      │
│ Errores de Validación (T2)      │ 50% dudas sobre minutos    │ 0% dudas léxicas de unidad  │
│ Omisión de Tareas Urgentes (T3) │ Observada en 1 de 4 (25%)  │ 0% omisiones de tareas hoy  │
│ Puntuación SUS (System Usab.)   │ Estimada: 62/100           │ >= 82/100 (Grado A - Bueno) │
└─────────────────────────────────┴────────────────────────────┴─────────────────────────────┘
```

---

## 2. Batería de Escenarios para Pruebas Automatizadas (Vitest / Playwright)

### 2.1 Escenario AUTO-01: Diagnóstico Multifecha en Reducción de Capacidad (Valida TKT-CAP-01)
* **Objetivo técnico:** Verificar que el diálogo intercepte el conflicto multifecha, renderice la lista de fechas excedidas y permita reprogramar.
* **Runner:** Vitest (`DailyLimitDialog.test.tsx`)
* **Precondiciones:**
  - Mock de API `GET /subtasks/overload-check/?new_limit=4` que retorna:
    ```json
    {
      "has_overload": true,
      "conflict_days": [
        { "day": "2026-10-24", "total_hours": 5.0, "excess": 1.0, "tasks": [{"id": 101, "name": "Catering", "hours": 3.0}] },
        { "day": "2026-10-28", "total_hours": 5.5, "excess": 1.5, "tasks": [{"id": 102, "name": "Decoración", "hours": 3.5}] }
      ]
    }
    ```
* **Pasos de Prueba:**
  1. Montar `DailyLimitDialog` con `currentHours={6}`.
  2. Simular cambio en input a `"4"` y hacer submit del formulario.
  3. `expect`: El diálogo no llama a `onOpenChange(false)` (no se cierra).
  4. `expect`: Se renderiza el encabezado `"Reorganiza tus tareas antes de reducir el límite"`.
  5. `expect`: Se encuentran en pantalla los textos `"24 de octubre"` y `"28 de octubre"`.
  6. `expect`: Cada tarea infractora tiene un botón con `aria-label="Reprogramar [nombre]"` accesible por teclado.

---

### 2.2 Escenario AUTO-02: Descubribilidad y Ejecución de Posponer desde Menú Contextual (Valida TKT-POS-01)
* **Objetivo técnico:** Garantizar que el menú contextual contenga "Dejar en espera (Posponer)" y transicione a estado `postponed`.
* **Runner:** Vitest (`EventTaskCard.test.tsx` y `TodayTaskActionsMenu.test.tsx`)
* **Pasos de Prueba:**
  1. Renderizar `EventTaskCard` con subtarea en estado `pending`.
  2. Simular clic en el botón de menú `aria-label="Acciones para [nombre]"`.
  3. `expect`: El menú flotante contiene un botón con texto `"Dejar en espera (Posponer)"`.
  4. Simular clic en `"Dejar en espera (Posponer)"`.
  5. `expect`: Se invoca el callback `onPostponeTask(subtask)` abriendo el modal de justificación.
  6. Introducir texto en la nota y confirmar.
  7. `expect`: La llamada a API PATCH envía `state: "postponed"` y `details: "nota"`.

---

### 2.3 Escenario AUTO-03: Renderizado de Completadas y Filtro en Hoy (Valida TKT-FIL-01)
* **Objetivo técnico:** Comprobar que bajo el filtro "Todos" se rendericen las tareas completadas y que no se oculten prematuramente.
* **Runner:** Vitest (`TodayPage.test.tsx`)
* **Precondiciones:**
  - Mock de `todayResponse` con 1 tarea vencida, 1 para hoy y 2 completadas.
* **Pasos de Prueba:**
  1. Montar `TodayPage`.
  2. `expect`: Se renderiza la sección `"Completadas hoy"`.
  3. `expect`: Las 2 tareas completadas están visibles en el DOM.
  4. Cambiar filtro de estado a `"Para hoy"`.
  5. `expect`: La sección de completadas desaparece de la vista.
  6. Restablecer filtro a `"Todos"`.
  7. `expect`: La sección de completadas reaparece en su posición final.

---

### 2.4 Escenario AUTO-04: Verificación de Accesibilidad WCAG 2.2 AA (Valida TKT-ACC-01)
* **Objetivo técnico:** Comprobar ausencia de violaciones automáticas de contraste, etiquetas y foco.
* **Runner:** Playwright con `@axe-core/playwright` (`tests/visual/responsive.spec.ts`)
* **Pasos de Prueba:**
  1. Navegar con Playwright a `/hoy` y `/evento/1`.
  2. Ejecutar `await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()`.
  3. `expect(results.violations).toEqual([])`.
  4. Verificar específicamente que el elemento `div.STATUS_ACCENTS[postponed]` tenga un color computado con ratio $\ge 3.0:1$ sobre `#ffffff`.

---

## 3. Protocolo Estandarizado de Pruebas de Usabilidad con Usuarios Reales

### 3.1 Diseño Experimental y Condiciones de Control
* **Muestra:** $N = 5$ participantes representativos (organizadores de eventos y estudiantes que gestionan proyectos).
* **Aislamiento de Cuentas:** Cada participante recibe una cuenta sintética individual creada en el momento (`test-user-N@eventger.test`) pre-poblada mediante un script idempotente (`seed_usability_fixture.py`).
* **Política de Neutralidad del Moderador (Strict Think-Aloud):**
  * El facilitador **no responde preguntas sobre cómo usar la interfaz** ("¿dónde hago clic?").
  * Respuesta estándar obligatoria del facilitador: *"¿Dónde esperarías encontrarlo?"* o *"Haz lo que considerarías natural si estuvieras solo en tu casa"*.
  * Si el participante se encuentra bloqueado por más de 120 segundos sin avanzar, el facilitador registra la tarea como **No Completada Autónomamente (Fallo Operativo)** antes de cualquier asistencia de rescate.

---

### 3.2 Guion de Tareas para la Sesión de Usabilidad

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GUION DE TAREAS VALIDATORIAS                    │
├────────────────────────────────────────────────────────────────────────┤
│ TAREA 1: Creación de Evento con Fechas y Contacto Claro                │
│ TAREA 2: Creación de Subtareas con Duraciones Decimales                │
│ TAREA 3: Priorización Diaria y Verificación de Cierre de Jornada       │
│ TAREA 4: Reducción Asistida de Capacidad Diaria con Conflicto Guiado  │
│ TAREA 5: Suspensión de Tarea por Falta de Respuesta de Terceros        │
│ TAREA 6: Gestión Rápida desde Menú Contextual en Hoy                   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Tarea 1: Creación de Evento y Duración
* **Consigna verbal:** *"Imagina que te han encargado coordinar la 'Feria de Emprendimiento 2026' que se celebrará dentro de 30 días. Registra este evento en Eventger indicando el lugar y el contacto del cliente."*
* **Foco de observación:** Facilidad de ingreso de fecha con `DateInput` (DD/MM/AAAA); comprensión del campo de contacto separado (nombre y celular); detección de la confirmación visual de guardado.

#### Tarea 2: Creación de Tareas con Unidades Explícitas
* **Consigna verbal:** *"Para esta feria necesitas registrar tres compromisos: 'Diseño de afiches' (2 horas), 'Cotizar sonido' (1 hora y media) y 'Enviar invitaciones' (1 hora)."*
* **Foco de observación:** Si el usuario reconoce que debe ingresar `1.5` en la duración estimada sin preguntar qué unidad se espera; ausencia de vacilación léxica.

#### Tarea 3: Priorización Diaria y Verificación en Hoy
* **Consigna verbal:** *"Comienzas tu jornada laboral. Entra a Eventger y determina cuál es la tarea prioritaria que debes resolver hoy. Luego, márcala como completada y comprueba si quedó registrada en tu agenda."*
* **Foco de observación:** Tiempo de identificación de la tarea más urgente; comprobación de que la tarea completada permanezca visible en la sección "Completadas hoy".

#### Tarea 4: Reducción de Capacidad Diaria con Conflicto Asistido (Clave)
* **Consigna verbal:** *"A partir de hoy, solo dispones de 4 horas diarias para trabajar en Eventger. Ajusta tu horario en la aplicación para que tu límite sea de 4 horas al día, resolviendo cualquier conflicto de horario que se presente."*
* **Condición de datos iniciales:** El día de mañana tiene 2 tareas programadas que suman 5.5 horas (exceso: 1.5 h). El resto de días tiene disponibilidad libre.
* **Foco de observación:**
  - Descubribilidad del ajuste en el diálogo.
  - Comprensión del mensaje de diagnóstico.
  - Uso autónomo del botón "Reprogramar" dentro del asistente.
  - Cero clics fuera de contexto buscando fechas a ciegas.
  - Guardado final exitoso en menos de 90 segundos.

#### Tarea 5: Suspensión de Tarea en Espera (Posponer)
* **Consigna verbal:** *"El proveedor de sonido te acaba de informar que no sabe cuándo tendrá listos los equipos y que no puede confirmar fecha por ahora. Refleja en la aplicación que este compromiso queda en pausa, indicando en una nota que estás esperando la respuesta del proveedor."*
* **Foco de observación:**
  - Descubribilidad de la acción "Posponer / Dejar en espera" en el menú contextual de la tarjeta.
  - Cero intentos fallidos entrando a "Registrar avance" o inventando fechas falsas.
  - Registro de la nota explicativa.

---

### 3.3 Preguntas Post-Tarea Estandarizadas (Single Ease Question - SEQ)

Inmediatamente al concluir cada una de las 5 tareas, se formula la pregunta estandarizada de facilidad percibida (Sauro & Dumas, 2009):

> *"En general, ¿qué tan difícil o fácil te resultó completar esta tarea en una escala de 1 a 7, donde 1 es Muy difícil y 7 es Muy fácil?"*

```
[ 1 ] Muy difícil  [ 2 ] Difícil  [ 3 ] Algo difícil  [ 4 ] Neutral  [ 5 ] Algo fácil  [ 6 ] Fácil  [ 7 ] Muy fácil
```

*Criterio de Aceptación Cuantitativo:* Cada tarea debe alcanzar una media de **SEQ $\ge 5.8 / 7$**.

---

### 3.4 Cuestionario Final System Usability Scale (SUS)

Al finalizar la sesión completa, el participante diligencia el cuestionario estándar de 10 preguntas de John Brooke (1986):

1. Creo que me gustaría utilizar este sistema con frecuencia.
2. Encontré el sistema innecesariamente complejo.
3. Pensé que el sistema era fácil de usar.
4. Creo que necesitaría el apoyo de una persona técnica para poder utilizar este sistema.
5. Encontré que las diversas funciones de este sistema estaban bien integradas.
6. Pensé que había demasiada inconsistencia en este sistema.
7. Imagino que la mayoría de las personas aprenderían a utilizar este sistema muy rápidamente.
8. Encontré el sistema muy engorroso de usar.
9. Me sentí muy seguro utilizando el sistema.
10. Necesité aprender muchas cosas antes de poder empezar a utilizar este sistema.

*Objetivo de Benchmark:* **Puntuación SUS $\ge 82.0$** (Percentil superior al 90%, clasificación de usabilidad "Excelente").
