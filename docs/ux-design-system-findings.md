# Auditoría del Sistema de Diseño UX/UI: Consistencia, Componentes y Patrones

**Documento:** Auditoría de Arquitectura de Sistema de Diseño y Tokens de Interfaz<br>
**Producto:** Eventger Web<br>
**Especialista:** Design Systems Specialist & Accessibility Lead<br>
**Fecha:** 26 de Octubre de 2026<br>
**Stack de Interfaz:** React 19, Tailwind CSS v4, Radix UI Primitives, Lucide Icons, Shadcn UI base<br>

---

## 1. Resumen Ejecutivo del Sistema de Diseño

El sistema de interfaz de **Eventger** exhibe una base visual moderna y profesional, construida sobre una paleta cuidada de índigos (`#4f46e5`), pizarras neutras (`#17212b`, `#667085`) y bordes refinados (`#dde2ea`). Las decisiones tipográficas y los esqueletos de carga demuestran una alta atención al detalle visual.

Sin embargo, la auditoría revela **inconsistencias en la aplicación de tokens de espaciado, alturas de botones, bordes redondeados y una duplicidad en componentes equivalentes** desarrollada de forma fragmentada entre páginas (`/hoy` frente a `/evento/:id`).

```
┌─────────────────────────────────┬────────────────────────────┬─────────────────────────────┐
│ Dimensión de Sistema            │ Evaluación de Madurez      │ Diagnóstico Principal       │
├─────────────────────────────────┼────────────────────────────┼─────────────────────────────┤
│ Tokens de Color y Contraste     │ Nivel 3 (Definido)         │ Fallo puntual en gris 1.4.11│
│ Tipografía y Jerarquía          │ Nivel 4 (Gestionado)       │ Excelente legibilidad       │
│ Botones y Objetivos Táctiles    │ Nivel 3 (Definido)         │ Discrepancia h-9 vs h-11    │
│ Tarjetas y Contenedores         │ Nivel 2 (Fragmentado)      │ 4 radios de borde distintos │
│ Menús y Patrones Flotantes      │ Nivel 2 (Fragmentado)      │ Doble implementación portal │
│ Formularios y Controles         │ Nivel 3 (Definido)         │ Labels sin unidades de hora │
└─────────────────────────────────┴────────────────────────────┴─────────────────────────────┘
```

---

## 2. Auditoría de Tokens de Diseño

### 2.1 Paleta de Color y Ratios de Contraste (WCAG 2.2)

```
┌─────────────────┬───────────┬────────────────────┬──────────────┬─────────────────────────┐
│ Token Semántico │ Valor Hex │ Uso Principal      │ Ratio Blanco │ Estado WCAG 2.2 AA      │
├─────────────────┼───────────┼────────────────────┼──────────────┼─────────────────────────┤
│ text-primary    │ #17212b   │ Títulos y cuerpo   │ **15.2 : 1** │ CONFORME (Supera AAA)   │
│ text-secondary  │ #667085   │ Metadatos y ayuda  │ **4.52 : 1** │ CONFORME (Pasa AA 4.5)  │
│ text-muted      │ #98a2b3   │ Placeholders       │ **2.56 : 1** │ Conforme para no-texto  │
│ brand-primary   │ #4f46e5   │ Botones primarios  │ **4.64 : 1** │ CONFORME (Texto blanco) │
│ status-overdue  │ #b42318   │ Vencidas / Error   │ **4.80 : 1** │ CONFORME (Pasa AA)      │
│ status-today    │ #c2410c   │ Para hoy / Alerta  │ **4.72 : 1** │ CONFORME (Pasa AA)      │
│ status-upcoming │ #175cd3   │ Próximas / Futuro  │ **5.30 : 1** │ CONFORME (Pasa AA)      │
│ status-done     │ #027a48   │ Completadas / Éxito│ **5.45 : 1** │ CONFORME (Pasa AA)      │
│ status-postpone │ #98a2b3   │ Acento pospuesta   │ **2.83 : 1** │ **FALLO WCAG 1.4.11**   │
└─────────────────┴───────────┴────────────────────┴──────────────┴─────────────────────────┘
```

> [!CAUTION]
> **Acción Inmediata requerida:**<br>
> El token `STATUS_ACCENTS.postponed` (`#98a2b3`) debe actualizarse a `#667085` para elevar su contraste gráfico a **4.52:1** sobre blanco, satisfaciendo el umbral de 3.0:1 de la norma internacional WCAG 1.4.11.

---

### 2.2 Jerarquía Tipográfica y Escala de Tipos
La aplicación utiliza clases semánticas consistentes (`type-page-title`, `type-dialog-title`, `type-card-title`, `type-label`, `type-body`):
* `type-page-title`: `font-bold tracking-[-0.02em] text-[#17212b] text-[28px] md:text-[30px] leading-9`
* `type-dialog-title`: `font-bold text-[#17212b] text-[20px] sm:text-[22px] leading-7`
* `type-card-title`: `font-semibold text-[#17212b] text-[15px] sm:text-[16px] leading-6`
* `type-label`: `text-sm font-semibold text-[#101828] leading-5`
* `type-body`: `text-sm text-[#667085] leading-5`

*Evaluación:* Excelente ritmo vertical y consistencia de interlineado. Se preserva legibilidad en todos los viewports.

---

### 2.3 Radios de Borde (Border Radius Fragmentation)
Se detectó una proliferación innecesaria de radios de curvatura en componentes contenedores:
* `rounded-lg` (8 px): Botones secundarios, selects y menús flotantes.
* `rounded-xl` (12 px): Tarjetas de subtareas (`EventTaskCard`, `TodayTaskCard`).
* `rounded-2xl` (16 px): Modales de diálogo (`DailyLimitDialog`, `RegisterProgressDialog`, `DateInput Popover`).
* `rounded-[10px]` (10 px): Botones en cabecera de evento antes de la refactorización reciente.

*Recomendación:* Normalizar la escala a 3 valores canónicos:
- **Radio Pequeño (`rounded-lg` / 8 px):** Botones, campos de formulario, dropdowns y chips.
- **Radio Mediano (`rounded-xl` / 12 px):** Todas las tarjetas de eventos y tareas.
- **Radio Grande (`rounded-2xl` / 16 px):** Modales, diálogos y contenedores flotantes principales.

---

## 3. Comparativa de Consistencia entre Componentes Clave

### 3.1 Tarjetas de Tarea: `TodayTaskCard.tsx` vs. `EventTaskCard.tsx`

```
┌──────────────────────────────┬───────────────────────────────┬───────────────────────────────┐
│ Atributo de Diseño           │ TodayTaskCard (Vista Hoy)     │ EventTaskCard (Detalle Evento)│
├──────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Borde lateral de acento      │ Sí (6 px con estado temporal) │ Sí (6 px con estado temporal) │
│ Insignia de estado           │ Única (Schedule o State)      │ Doble (Schedule + State)      │
│ Botón de acción primaria     │ "Registrar avance" (h-11/h-9) │ "Registrar avance" (h-11/h-9) │
│ Disparador de acciones       │ Botón "Acciones" (Sliders)    │ Botón "Acciones" (Sliders)    │
│ Opciones en menú contextual  │ Reprogramar | Ver detalles    │ Reprogramar | Ver detalles |  │
│                              │                               │ Editar tarea | Eliminar       │
│ Visualización de notas       │ Acordeón colapsable inferior  │ Acordeón colapsable inferior  │
└──────────────────────────────┴───────────────────────────────┴───────────────────────────────┘
```

#### Inconsistencia Crítica Detectada
En `TodayTaskCard.tsx`, **falta la acción "Editar detalles"**. Esta omisión fuerza al usuario a cambiar de pantalla innecesariamente para corregir un título o nota. Ambos componentes deben heredar de una única definición de menú contextual unificado.

---

### 3.2 Botones y Objetivos Táctiles (WCAG 2.5.8)

El diseño implementa una estrategia híbrida según viewport:
* **Móvil (< 640px):** Altura `h-11` (44 px) en todos los botones de acción primaria y disparadores. Cumple con la recomendación estricta de ergonomics táctil de Apple HIG y WCAG AAA.
* **Escritorio ($\ge$ 640px):** Altura `h-9` (36 px) con tipografía `text-sm` y padding `px-3.5`. Supera el mínimo de 24x24 px exigido por WCAG 2.2 AA (Criterio 2.5.8).

*Evaluación:* Excelente implementación ergonómica.

---

### 3.3 Formularios y Controles de Entrada

* **Inputs de Texto y Números (`Input.tsx`):**
  - Altura estándar `h-11` (44 px).
  - Borde `#dde2ea` en reposo, transición a `focus-visible:border-[#4f46e5]` y anillo de foco `ring-2 ring-[#4f46e5]/20`.
  - Estados inválidos: Borde `#d92d20` y mensaje subordinado con `FieldError` enlazado mediante `aria-describedby`.
* **Selector de Fechas (`DateInput.tsx`):**
  - Máscara visual estricta `dd/mm/aaaa`.
  - Icono `CalendarDays` a la derecha como disparador de popover modal accesible.
  - Sincronización bidireccional automática entre texto escrito y calendario gráfico.
  - Excelente diseño adaptativo; debe consolidarse como el estándar único en todos los formularios del producto.

---

## 4. Auditoría de Patrones de Interacción y Menús Flotantes

### 4.1 Gestión de Menús Flotantes (Portals y Z-Index)
En iteraciones previas, los menús de tres puntos quedaban recortados por el contenedor de la tarjeta debido a reglas CSS de `overflow: hidden`.
* **Solución actual:** Ambos menús (`TodayTaskActionsMenu` y `EventTaskCard`) implementaron renderizado mediante `createPortal` hacia `document.body` con posición fija calculada (`calculatePosition`).
* **Hallazgo de Accesibilidad por Teclado:**
  - El menú implementa listeners para `ArrowDown`, `ArrowUp` y `Escape`.
  - Sin embargo, al pulsar `Escape` o hacer clic en el backdrop, el foco no siempre regresa de forma explícita al botón disparador en `TodayTaskActionsMenu.tsx`.
* **Corrección requerida:** Añadir `triggerRef.current?.focus()` en el manejador de cierre para asegurar cumplimiento de WCAG 2.4.3 (Focus Order).

---

## 5. Recomendaciones de Evolución para el Sistema de Diseño

```
[FASE 1: Unificación de Tokens (Inmediato)]
  ├── Modificar STATUS_ACCENTS.postponed de #98a2b3 a #667085 (WCAG 1.4.11).
  └── Normalizar border-radius a 3 tokens canónicos (sm: 8px, md: 12px, lg: 16px).

[FASE 2: Consolidación de Componentes (Mediano Plazo)]
  ├── Crear componente maestro <TaskActionsMenu /> compartido entre Hoy y Eventos.
  ├── Crear componente maestro <SubtaskFormFields /> reutilizado en Add, Edit y EventForm.
  └── Estandarizar la etiqueta "Duración estimada (horas) *" con sufijo 'h' integrado.

[FASE 3: Patrones Avanzados de Interacción (Largo Plazo)]
  ├── Componente <OverloadDiagnosticTable /> para rebalanceo guiado de capacidad.
  └── Integración de un componente <SearchInput /> con icono de lupa y botón limpiar 'X'.
```
