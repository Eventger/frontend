# Guía de validación del Frontend

## Flujo del equipo

Ramas cortas desde main actualizado → aporte funcional pequeño → PR a main → checks
→ una revisión humana → squash merge → eliminar rama y actualizar main. No crear ni
utilizar develop para este flujo. No se necesita completar una HU para integrar una
parte que conserve el comportamiento existente.

Mateo y Fabián pueden hacer revisión técnica cruzada; QA revisa aceptación y
accesibilidad, y UX revisa interacción y diseño. Elegir un revisor distinto del autor
en cada PR. Tener Write permite revisar, pero no asigna automáticamente revisores.
Copilot es apoyo, no sustituye la aprobación humana.

Proponer en GitHub un ruleset Active para **main del repositorio Frontend**, sin bypass:
PR obligatorio, una aprobación, invalidar aprobaciones al añadir cambios, conversaciones
resueltas, rama actualizada, bloqueo de eliminación y force push. Checks obligatorios:
**Conventional Commits**, **Comprobaciones de Frontend**, **Build Frontend** y
**Pruebas Frontend**. Dejar **Análisis Sonar Frontend** opcional durante el diagnóstico.
Las protecciones del Backend no se heredan automáticamente en Frontend. Este trabajo
no configura reglas remotas ni elimina ramas existentes.

## Dependencias y validación local

Usar Node 24.18.0 y `npm ci --ignore-scripts`. package-lock.json fija el árbol completo y sus integridades;
las nuevas herramientas llevan versiones exactas. Los rangos existentes de React,
Vite, TypeScript y Oxlint se conservan. Versionar package.json y package-lock.json juntos
al añadir dependencias. No instalar herramientas globalmente para ejecutar CI. La instalación usa
`--ignore-scripts` para impedir scripts de ciclo de vida de las dependencias. Los
comandos explícitos `npm run build` y `npm test` se ejecutan normalmente. Si una
futura dependencia requiere un script de instalación, revisar su necesidad y alcance
antes de habilitarlo; no quitar esta protección sin comprobar el impacto.

`npm run validate` ejecuta toda la validación y se detiene ante fallos. Comandos
individuales disponibles en README. No existe un mínimo de cobertura arbitrario.
Un fallo en el build, lint con errores, tipos o una prueba devuelve código no exitoso.
No se permite una suite vacía. No se seleccionan pruebas por Jira o texto de commits.

Vitest se incorpora porque no había framework ni pruebas previas. Usa la configuración
Vite/React existente con jsdom, no un navegador real. Los tests verifican el contenido
actual y el montaje desde main.tsx usando el index.html real. No prueban HU futuras.
La configuración de tests desactiva la lectura de .env y hace fallar llamadas fetch
no simuladas. Esto no es un sandbox de red: al incorporar Axios/XHR/WebSocket u otros
clientes, añadir mocks y bloqueo de solicitudes no esperadas para ese transporte.
Nunca ejecutar escrituras contra Backend desplegado o Supabase desde estos tests.

Ubicar tests en `tests/**/*.test.ts(x)` o `src/**/*.test.ts(x)`. Añadir pruebas junto
con cada comportamiento y conservarlas como regresión. La cobertura incluye los TS/TSX
de src, incluso no importados; excluye tests y declaraciones de tipos. Una cobertura
alta del arranque mínimo no demuestra cobertura funcional del producto.

Resultados locales: `reports/junit.xml`, `coverage/lcov.info` y `coverage/index.html`.
Actions conserva `frontend-evidence-<SHA>` por 14 días, incluso al fallar si se generaron
archivos; el build exitoso se guarda como `frontend-build-<SHA>` por 7 días. Reportes
no se suben a Git. Si falla el proceso antes de crear evidencia, el log es la evidencia.

## Conventional Commits

Instalar hook opcional con `npm run hooks:install` (configura core.hooksPath de este
checkout; comprobar primero si el equipo ya tenía hooks). CI funciona sin hook.

```text
feat(eventos): mostrar formulario de creación

Refs: M1P-5
```

Scope y Jira opcionales; español y mayúsculas admitidos en la descripción. Tipos:
feat, fix, docs, test, refactor, perf, style, build, ci, chore, revert. Breaking changes:
`feat!: cambiar contrato` o pie `BREAKING CHANGE: explicación`. Mensajes automáticos
de merge reconocidos se omiten solo al validar commits; títulos de PR siempre se
validan, usando defaultIgnores=false en el archivo de configuración, no una opción CLI.

Actions revisa base.sha..head.sha del PR, no el merge sintético ni todo main histórico.
Se comprueba además el título al editarlo. Código/build/tests usan la revisión de
integración del checkout de GitHub. En push a main/manual no se revisa el historial de
commits. Ante un mensaje inválido, corregir el título o los commits propios de la rama;
no reescribir main y coordinar cualquier reescritura de una rama compartida.

## GitHub Actions

Triggers: PR hacia main, push a main y manual. No se duplican ejecuciones por push a
ramas cortas. Cancelación únicamente de ejecuciones antiguas del mismo PR; main no se
cancela automáticamente. Se usa pull_request, nunca pull_request_target. Permisos
contents:read, timeouts, actions fijadas por SHA verificado y caché npm por lockfile.
Los títulos y mensajes llegan por variables de entorno, sin interpolación en shell.
No se ocultan errores con continue-on-error ni filtros por paths que dejen checks pendientes.

Publicar la rama y abrir PR será el siguiente paso del equipo; no se hizo push ni merge.
Workflow dispatch aparece al integrar el archivo en la rama principal. Los cuatro
checks básicos funcionan sin secretos y aunque Sonar esté desactivado.

## Sonar: proyecto Frontend independiente

No usar SONAR_PROJECT_KEY del Backend: crear/seleccionar el proyecto Frontend en la
instancia existente. No se ha creado un proyecto, contratado un plan ni configurado
credenciales remotas. Variables del repositorio Frontend (Settings → Secrets and
variables → Actions → Variables):

| Nombre | Configuración |
| --- | --- |
| SONAR_ENABLED | Ausente/false inicialmente; `true` activa el scanner |
| SONAR_HOST_URL | URL HTTPS real del servidor/Cloud, alcanzable por el runner |
| SONAR_PROJECT_KEY | Clave exacta del proyecto Frontend |
| SONAR_ORGANIZATION | Organización si usan Cloud; omitir en Server |
| SONAR_PR_ENABLED | Ausente/false inicialmente; `true` solo tras confirmar soporte del plan/edición y confianza en los PR internos |

Secret del repositorio: **SONAR_TOKEN**, con permiso de análisis del proyecto Frontend.
No pegar tokens en chat, código, capturas, VITE_* ni artifacts. main/manual se analizan
solo después de pruebas exitosas. Para activar PR, primero analizar main como base;
confirmar capacidades del plan/edición, luego SONAR_PR_ENABLED=true. Solo PR del mismo
repositorio, excluyendo Dependabot, pueden ejecutar el scanner con secretos. Los forks
siguen ejecutando los checks básicos sin secretos, pero omiten Sonar. No habilitar esta
opción si se permite que colaboradores no confiables modifiquen workflows/scripts:
el código del PR podría acceder al token. No se usa pull_request_target como atajo.

Desactivado: el resumen de main/manual indica **análisis no ejecutado**. Activado con
configuración incompleta, URL no HTTPS o LCOV faltante: fallo explicativo. El token
se pasa por entorno y nunca se escribe en properties. Solo se descarga evidencia de
**este run y este SHA**, no el último artifact de otra ejecución. El checkout del scanner
y las pruebas corresponden a la misma revisión, también en PR.

`sonar.sources=src`: el ámbito de producto es la aplicación. `sonar.tests=tests,src`
y test.inclusions separan pruebas; las herramientas de CI están fuera de ese ámbito,
no se excluye código de negocio. Oxlint revisa también archivos de herramientas.
LCOV se importa mediante sonar.javascript.lcov.reportPaths. No confundir cobertura
global con cobertura de código nuevo.

**Usar un solo método de análisis.** En Sonar → proyecto → Administration → Analysis
Method, desactivar Automatic Analysis antes de ejecutar el scanner de Actions. El
automático no importa nuestro LCOV y entra en conflicto con CI. Un job verde que solo
informa desactivación no demuestra que el scanner corrió: comprobar el paso del scanner.

El workflow usa sonar.qualitygate.wait=false: un scanner exitoso indica envío, no
procesamiento terminado ni Quality Gate aprobado. Sonar puede publicar un check
independiente fallido por sus condiciones (por ejemplo cobertura en código nuevo).
No hacerlo obligatorio inicialmente. Más adelante acordar condiciones y referencia
estable de código nuevo, sin moverla ni excluir código para maquillar métricas.
Una instancia local requiere conectividad segura desde el runner; localhost no apunta
al computador del equipo. No se ha verificado conectividad ni ejecutado Sonar remotamente.

## Backend, Vercel y funcionalidades futuras

Frontend no necesita PostgreSQL: los tests de componentes usan datos sintéticos. El
esquema Supabase y su reconstrucción pertenecen al Backend. No poner DATABASE_URL,
contraseñas ni tokens privados en variables VITE_*: quedan expuestas al cliente.
Cuando exista API, acordar URL pública, autenticación, CORS, campos y errores. Usar
respuestas simuladas en la suite rápida, no conexiones a producción.

| HU | Pruebas a incorporar con la implementación |
| --- | --- |
| Crear evento | Campos, validaciones, envío, carga, éxito y errores de API |
| Crear subtarea | Evento asociado, horas numéricas positivas y errores |
| Editar/eliminar | Edición, validación, confirmación y actualización de la vista |
| Vista Hoy | Presentación, vacíos, carga y errores; probar filtros/orden si viven en Frontend |

Acordar con Backend el contrato: evento_id, horas_estimadas, fecha_objetivo y titulo
son nombres de referencia de la base, no una API ya implementada. No inventar endpoints.
La suite rápida no reemplaza QA manual, teclado, foco, lector de pantalla, responsive
ni E2E con ambas versiones identificadas. Añadir E2E cuando exista un flujo funcional
y un entorno aislado; no declarar HU terminadas por checks verdes.

Vercel puede crear previews por ramas/PR y desplegar main, independientemente de esta
CI. Revisar en su panel proyecto, repo, rama, runtime, directorio raíz, comandos,
variables y política de despliegue/checks. No asumir que CI fallida bloquea Vercel.
No hay Actions de deploy ni cambios a los comandos de producción. Proponer un smoke
test posterior de solo lectura con SHA identificado: carga de /, título Eventger,
recursos sin errores y, cuando exista integración, comportamiento de API. No se ejecuta
contra el servicio remoto como parte de esta tarea.

## Fuentes oficiales

- [Vitest: cobertura](https://vitest.dev/guide/coverage.html)
- [Vitest: reporters](https://vitest.dev/guide/reporters.html)
- [Commitlint: configuración](https://commitlint.js.org/reference/configuration.html)
- [Sonar: cobertura JS/TS](https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/test-coverage/javascript-typescript-test-coverage)
- [Sonar: análisis desde CI](https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/ci-based-analysis/overview-of-integrated-cis)
- [Vercel: integración Git](https://vercel.com/docs/git)

Versiones nuevas verificadas en npm y SHA en los repositorios oficiales de las Actions.
