# Verificación local de Frontend CI

Rama de trabajo: **ci/frontend-validation**. Árbol inicialmente limpio.
Base local y remota comprobada mediante git ls-remote:
`697bdc754c11d1fea0ac3d8d8cdb6ddbca906674`.
No se hicieron commits, push, merge, despliegues ni cambios a servicios remotos.

## Archivos y propósito

- `.github/workflows/frontend.yml`: checks separados de commits, lint/tipos, build,
  pruebas y Sonar opcional; artifacts, timeouts, caché y permisos mínimos.
- `package.json`, `package-lock.json`, `.nvmrc`: comandos y dependencias reproducibles.
- `commitlint.config.cjs`, `ci/commitlint-pr.config.cjs`, `.githooks/commit-msg`:
  mensajes y títulos en español, hook local opcional.
- `vitest.config.ts`, `tsconfig.test.json`, `tests/`: pruebas de arranque, tipos de
  pruebas, JUnit, cobertura V8/LCOV y guardia de fetch no simulado.
- `sonar-project.properties`, `ci/sonar-config.mjs`: alcance de aplicación/pruebas,
  cobertura e identidad Frontend con validaciones de configuración.
- `.gitignore`, `README.md`, `docs/`, `.github/pull_request_template.md`: resultados
  y secretos fuera de Git, comandos del equipo y evidencia por aporte.

## Resultado

| Validación | Resultado |
| --- | --- |
| npm ci con Node 24.18.0 | Correcto; 217 paquetes instalados, auditoría npm sin vulnerabilidades reportadas en esa ejecución |
| Versiones anteriores del lockfile | Ninguna cambió; solo se incorporaron herramientas de desarrollo y sus dependencias |
| npm run lint | Correcto con Oxlint existente |
| npm run typecheck | Correcto para aplicación, configuración y tests |
| npm run test:coverage | 2 tests exitosos: pantalla inicial y montaje real del entrypoint |
| Cobertura | 100 % de líneas (4/4), sentencias (6/6), ramas (2/2) y funciones (1/1) del código actual instrumentado; no es evidencia de HU futuras |
| JUnit y LCOV | Generados; LCOV contiene rutas relativas src/App.tsx y src/main.tsx |
| npm run build | Correcto, dist/ generado con el comando original |
| npm run validate | Lint → tipos → cobertura/pruebas → build: correcto |
| actionlint 1.7.12 | Workflow válido |
| git diff --check | Correcto |
| Commitlint con títulos válidos | Español, scope opcional y breaking change con ! aceptados |
| Commitlint con títulos inválidos | Rechazados por reglas (no por argumentos CLI desconocidos) |
| Suite inexistente | Código 1; no se acepta suite vacía |
| Aserción fallida temporal | Código 1; archivo temporal eliminado después |
| Sonar desactivado | Código 0 e informa análisis no ejecutado |
| Sonar con configuración incompleta | Código 1 |
| URL HTTP, inválida o con credenciales | Código 1 sin revelar el valor de la URL |
| Cloud sin organización / LCOV ausente | Código 1 |
| Parámetros sintéticos completos | Preparación local correcta, sin escribir token en properties; no se invocó servidor |

El primer ensayo detectó una incompatibilidad de import.meta.url bajo jsdom al leer
index.html. Se corrigió la prueba para importar el HTML real mediante Vite `?raw`;
la suite final pasa sin cambiar la aplicación. Las pruebas temporales negativas no
modificaron el reporte de cobertura exitoso.

Los archivos de la aplicación, estilos, vite.config.ts y los comandos dev/build/preview
se conservaron. No se cambió la configuración de autenticación ni se implementaron HU.

## Pendientes externos

- Publicar la rama y abrir PR para comprobar Actions remotamente.
- Configurar reglas de protección propias de Frontend (las del Backend no se heredan).
- Elegir el proyecto Sonar Frontend independiente; configurar SONAR_HOST_URL,
  SONAR_PROJECT_KEY, SONAR_ORGANIZATION si corresponde y el secret SONAR_TOKEN.
- Desactivar Automatic Analysis del proyecto cuando se vaya a usar CI; activar
  SONAR_ENABLED=true. Tras validar main y el soporte del plan/edición, activar
  SONAR_PR_ENABLED=true para PR internos confiables. Sonar no es obligatorio inicialmente.
- No se comprobó scanner remoto, procesamiento ni Quality Gate.
- Confirmar Vercel: repo, rama de producción, runtime, directorio, variables y espera
  de checks. No se verificó ni ejecutó un despliegue.
- Acordar contrato API y entorno E2E con Backend. Actualmente solo hay arranque de UI.

Mensaje sugerido:
`ci(frontend): configurar validación, pruebas y Sonar opcional`
