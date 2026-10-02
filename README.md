# Eventger Frontend

React 19 + TypeScript + Vite, con React Compiler, Oxlint y autenticación mediante
Clerk. Incluye las vistas de hoy, eventos, creación y detalle de eventos.

## Desarrollo

Node 24.18.0 (ver `.nvmrc`). Si usas nvm, ejecuta `nvm install` y `nvm use`.

```bash
npm ci --ignore-scripts
cp .env.example .env
npm run dev
```

Configura `VITE_API_URL` con la URL del backend y
`VITE_CLERK_PUBLISHABLE_KEY` con la publishable key de tu instancia de Clerk.
No guardes claves secretas en variables `VITE_*`, porque Vite las expone al
navegador.

## Antes de abrir un PR

```bash
npm run validate
```

Ejecuta lint, tipos, pruebas con cobertura y build. Las pruebas sustituyen Clerk
y las llamadas HTTP, por lo que no requieren Backend ni credenciales reales. Para
instalar el hook opcional de mensajes:

```bash
npm run hooks:install
```

Consulta [la guía de contribución y CI](docs/validacion-frontend.md) para el flujo
trunk-based, resultados, Sonar, protección de main y Vercel. Las verificaciones
locales y límites están en [el informe de verificación](docs/verificacion-ci.md).
La redacción exacta de validaciones y la regla de contraseña están en la
[guía de microcopy de autenticación](docs/microcopy-autenticacion.md).
Los criterios para distinguir listas vacías y errores están en la
[guía de estados de carga](docs/estados-carga.md).

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run lint` | Oxlint existente |
| `npm run typecheck` | TypeScript de aplicación, configuración y pruebas |
| `npm test` | Suite completa una vez |
| `npm run test:responsive` | Auditoría visual en Chrome para seis tamaños de viewport |
| `npm run test:watch` | Pruebas durante desarrollo |
| `npm run test:coverage` | JUnit, LCOV y HTML de cobertura |
| `npm run build` | Build original: TypeScript + Vite, salida dist/ |
| `npm run preview` | Previsualización local del build |

La matriz, los criterios de reflow y las reglas para conservar la consistencia
entre pantallas están documentados en la [guía responsive](docs/responsive.md).

## Despliegue

El historial del repositorio menciona Vercel. No hay configuración de despliegue
versionada y no se ha inspeccionado el panel. Se mantienen `build`, `dev` y `preview`;
Actions no despliega ni modifica proyectos remotos. Confirmar en Vercel repositorio,
rama de producción, directorio raíz, runtime y comportamiento de previews/checks.
