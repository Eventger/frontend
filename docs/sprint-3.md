# Sprint 3: reprogramar y resolver sobrecargas

Se reutilizan los clientes autenticados, formularios, tokens y componentes de
Eventger. `RescheduleTaskDialog` conecta el flujo 13 → 14 → 15 → 16 de Figma con
la API; la sección existente de preferencias cubre la pantalla 22.

## Referencias de diseño

| Pantalla de Figma | Implementación |
| --- | --- |
| [13 · Reprogramar tarea](https://www.figma.com/design/RLhwQXXnAa9gRGHhrE60hl/?node-id=4-68) | Selección de fecha y vista previa de carga. |
| [14 · Conflicto detectado](https://www.figma.com/design/RLhwQXXnAa9gRGHhrE60hl/?node-id=4-87) | Total, límite, exceso y tareas involucradas. |
| [15 · Resolver conflicto](https://www.figma.com/design/RLhwQXXnAa9gRGHhrE60hl/?node-id=4-113) | Alternativas con recálculo antes de aplicar. |
| [16 · Conflicto resuelto](https://www.figma.com/design/RLhwQXXnAa9gRGHhrE60hl/?node-id=4-138) | Confirmación después de persistir el cambio. |
| [22 · Configuración](https://www.figma.com/design/RLhwQXXnAa9gRGHhrE60hl/?node-id=56-8) | Límite diario dentro del formulario existente. |

## Recorrido

1. En Hoy, elegir **Reprogramar** en una gestión; desde un evento, entrar a
   **Editar evento** y utilizar la acción de su fila.
2. Elegir fecha. La vista previa muestra horas existentes, horas de la gestión,
   total previsto y límite. No guarda aún.
3. Confirmar. Si existe sobrecarga, el diálogo enumera las gestiones del día y
   muestra las cifras; cancelar conserva la tarea original.
4. Resolver moviendo al día recomendado, seleccionando otra fecha o reduciendo
   horas. La alternativa se recalcula; **Aplicar opción** requiere un plan viable.
5. Confirmar éxito; Hoy vuelve a consultar sus grupos y el editor vuelve a cargar
   las tareas sin descartar el borrador del evento.

También se intercepta el conflicto al editar fecha/horas en el formulario ya
existente. Sus campos se conservan al cancelar y nombre, nota y estado se incluyen
al confirmar la resolución. El backend comprueba nuevamente la carga al guardar
y un 409 actualizado vuelve al diálogo de conflicto.

## Decisiones UX/HCI y bitácora

| Criterio | Decisión y comprobación |
| --- | --- |
| C1 | Acción accesible en Hoy y editor; PATCH persistente y recarga después del éxito. |
| C2 | Ajustar el rango previo 0,5–24 a 1–16; guardar mediante GET/PUT de preferencias. Importar valores anteriores válidos solo si la BD aún no tiene una elección. |
| C3 | Añadir vista previa y conflicto de la fecha destino, con total y límite explícitos; evitar contar la misma tarea dos veces. |
| C4 | Implementar fecha recomendada, fecha manual y reducción. No ofrecer una acción ficticia de “Posponer” que todavía no tiene estado en el contrato actual. |
| C5 | Reutilizar paneles, colores y feedback de Figma; radios con labels, foco visible, cancelación por Escape y retorno de foco. Bloquear doble envío y conservar datos ante error. |
| C6 | Registrar contratos en el backend, decisiones aquí y capturas reproducibles en Playwright. |

El cambio de almacenamiento conserva Clerk para perfil, correo, sesiones y
autenticación. El límite almacenado en BD manda sobre el valor anterior de Clerk;
un valor anterior fuera de 1–16 no se importa y se usa el predeterminado hasta
que el organizador elija otro. Si la API falla, la interfaz informa el error y
no presenta un límite desconocido como confirmado.

## Verificación y evidencias

```bash
npm run validate
npm run test:responsive
```

La suite de componentes cubre reprogramación sin conflicto, cifras 7/6,
resolución por fecha/horas, estimación insuficiente, conflicto recibido al guardar
y error de red. Las pruebas de preferencias cubren la importación y la prioridad
del valor de BD. La matriz responsive incluye vista previa y conflicto en seis
tamaños, además de resolución, éxito y foco en móvil.

Las capturas quedan en `reports/responsive-artifacts` y el informe en
`reports/responsive-report/index.html`. Usan fixtures aisladas con autenticación y
HTTP sustituidos: demuestran interacción y responsive, no una sesión real de
Clerk. El backend prueba persistencia, aislamiento y concurrencia sobre
PostgreSQL de pruebas. La comprobación local de inicio de sesión sí abre la
aplicación con Clerk real, sin iniciar una cuenta ni crear datos privados.

Resultado local del 3 de octubre de 2026: 317 pruebas de frontend, 128 de backend
y 109 comprobaciones responsive aprobadas. Se verificó adicionalmente Hoy con la
acción de reprogramar visible en los seis tamaños. TypeScript, lint, build y
comprobación de migraciones completados. Se mantienen tres advertencias de lint
anteriores y el aviso de tamaño del bundle.

Capturas conservadas para anexar al Documento Único (componentes reales con
fixtures de pruebas; no representan datos de una cuenta real):

| Estado | Evidencia |
| --- | --- |
| Reprogramar | [Escritorio](evidencias/sprint-3/reprogramar-desktop.png) |
| Conflicto | [Móvil](evidencias/sprint-3/conflicto-mobile.png) |
| Resolver | [Móvil con scroll interno](evidencias/sprint-3/resolver-mobile.png) |
| Resuelto | [Móvil](evidencias/sprint-3/resuelto-mobile.png) |

Antes de la entrega del equipo: añadir al Documento Único enlaces al PR,
capturas del flujo con una cuenta real, endpoints y estas decisiones; verificar
el despliegue. No se creó PR ni se desplegó desde este trabajo.
