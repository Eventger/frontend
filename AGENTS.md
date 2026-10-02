# Eventger frontend

- Stack: React 19, TypeScript, Vite con React Compiler, Tailwind 4, Radix/shadcn, React Router y Clerk. Reutiliza componentes, hooks y servicios existentes; este repositorio contiene frontend.
- Conserva la composición Figma, tokens de `src/index.css` y microcopy. Antes de cambios visuales lee `docs/responsive.md`; para autenticación, `docs/microcopy-autenticacion.md`. Usa las skills de diseño existentes cuando correspondan.
- Node y scripts: consulta `.nvmrc`, `package.json` y README.md. Para cambios relevantes ejecuta los checks afectados; antes de PR, `npm run validate`, según `docs/validacion-frontend.md`.
- Git: todos los commits nuevos y títulos de PR deben seguir Conventional Commits. Valida el rango de commits con `npm run commitlint` y el título con `ci/commitlint-pr.config.cjs`, según `docs/validacion-frontend.md`.
- Pruebas: Vitest/Testing Library; para responsive, `npm run test:responsive` usa fixtures aisladas en `tests/visual`. No introduzcas mocks o rutas de demostración en producción.
- Respeta clientes API, contratos y aislamiento de usuario. Ninguna clave secreta debe entrar en `VITE_*`; las pruebas sustituyen Clerk y HTTP y no verifican servicios de producción.
- Conserva CI, hooks y configuración de despliegue. No hagas push, despliegues ni cambios remotos sin autorización.
- Si se transfiere trabajo, usa agent-handoff y un estado compacto; no guardes conversaciones completas ni dupliques documentación existente.
