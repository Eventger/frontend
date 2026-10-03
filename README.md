# Eventger Frontend

React 19 + TypeScript + Vite, con React Compiler, Oxlint y autenticación mediante
Clerk. Incluye las vistas de hoy, eventos, creación y detalle de eventos.

Eventos muestra hasta 6 tarjetas por página y el total. Si hay varias páginas,
agrupa «Anterior», el indicador de página y «Siguiente»; con una sola página
muestra únicamente el contador de eventos. `/eventos?page=2` carga esa página desde la API y
conserva la selección al volver con el historial. Hoy recibe el nombre del evento
en cada tarea de `/hoy/`, sin descargar la lista completa de eventos.
El filtro «Tipo de evento» utiliza el catálogo existente y consulta al backend
antes de paginar. Cambiar o limpiar el tipo vuelve a la primera página; la URL
conserva `type` junto con `page` y distingue un filtro sin coincidencias de una
cuenta sin eventos.

La tarjeta de usuario abre `/configuracion`; `/configuracion/seguridad` permite
administrar la contraseña y las sesiones con el diseño de Eventger. Perfil y
correo usan formularios propios; el nuevo correo se verifica antes de hacerlo
principal. Las acciones sensibles usan la
[reverificación de Clerk](https://clerk.com/docs/react/reference/hooks/use-reverification),
incluidos los factores que admita la cuenta.

El límite diario se guarda por organizador en la API y se aplica al resumen de
Hoy y a la reprogramación. Su valor predeterminado es 6 horas y admite de 1 a 16
horas, con hasta dos decimales. Una preferencia anterior válida de Clerk se importa
una sola vez, sin modificar sus demás metadatos. Consulta el flujo, decisiones UX
y evidencia reproducible en [docs/sprint-3.md](docs/sprint-3.md).
La [API de usuario de Clerk](https://clerk.com/docs/react/reference/objects/user)
define las operaciones utilizadas y los ajustes que deben estar habilitados en
la instancia: nombre/apellido, correo, contraseña y eliminación de cuenta.

**Alcance del borrado:** la confirmación elimina la cuenta de Clerk y su acceso.
El backend actual sólo expone `GET /api/auth/me/` para el perfil; no implementa la
eliminación de la cuenta y sus eventos/tareas. La interfaz explica que estos datos
no se borran con esta acción. Ese borrado requiere un endpoint o webhook del
backend; no se simula ni se orquesta eliminando eventos desde el navegador.

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
