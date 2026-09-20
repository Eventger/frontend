# Eventger Frontend

React 19 + TypeScript + Vite, con React Compiler y Oxlint. Actualmente muestra
la pantalla inicial «Eventger / Frontend en construcción»; todavía no implementa
las historias de usuario ni integración con Backend.

## Desarrollo

Node 24.18.0 (ver `.nvmrc`). Si usas nvm, ejecuta `nvm install` y `nvm use`.

```bash
npm ci
npm run dev
```

## Antes de abrir un PR

```bash
npm run validate
```

Ejecuta lint, tipos, pruebas con cobertura y build. No requiere Backend, Supabase
ni secretos. Para instalar el hook opcional de mensajes:

```bash
npm run hooks:install
```

Consulta [la guía de contribución y CI](docs/validacion-frontend.md) para el flujo
trunk-based, resultados, Sonar, protección de main y Vercel. Las verificaciones
locales y límites están en [el informe de verificación](docs/verificacion-ci.md).

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run lint` | Oxlint existente |
| `npm run typecheck` | TypeScript de aplicación, configuración y pruebas |
| `npm test` | Suite completa una vez |
| `npm run test:watch` | Pruebas durante desarrollo |
| `npm run test:coverage` | JUnit, LCOV y HTML de cobertura |
| `npm run build` | Build original: TypeScript + Vite, salida dist/ |
| `npm run preview` | Previsualización local del build |

## Despliegue

El historial del repositorio menciona Vercel. No hay configuración de despliegue
versionada y no se ha inspeccionado el panel. Se mantienen `build`, `dev` y `preview`;
Actions no despliega ni modifica proyectos remotos. Confirmar en Vercel repositorio,
rama de producción, directorio raíz, runtime y comportamiento de previews/checks.
