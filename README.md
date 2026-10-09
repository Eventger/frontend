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

«Lugar» sugiere direcciones al crear y editar eventos mediante
[Photon (OpenStreetMap)](https://github.com/komoot/photon), sin clave de mapas.
Espera 500 ms tras escribir al menos tres caracteres y muestra hasta cinco
resultados. Permite seleccionar con ratón, pantalla táctil o flechas y Enter.
La dirección seleccionada se guarda
como texto en `location` (máximo 255 caracteres), usando el contrato existente.
Si la búsqueda falla, el campo permite escribir y guardar el lugar completo.
Las consultas al proveedor no incluyen el token de Clerk ni cookies de Eventger.
El servicio público admite uso moderado y no garantiza disponibilidad; para un
volumen mayor se debe configurar una instancia de Photon o un proveedor propio.

La tarjeta de usuario abre `/configuracion`; `/configuracion/seguridad` permite
administrar la contraseña y las sesiones con el diseño de Eventger. Perfil y
correo usan formularios propios; el nuevo correo se verifica antes de hacerlo
principal. Las acciones sensibles usan la
[reverificación de Clerk](https://clerk.com/docs/react/reference/hooks/use-reverification),
incluidos los factores que admita la cuenta.

El límite diario se guarda por organizador en la API y se aplica al resumen de
Hoy y a la reprogramación. Su valor predeterminado es 6 horas y admite de 1 a 16
horas, con hasta dos decimales.

Al reducirlo desde Configuración, se consulta la carga actual de las tareas propias
y se suman las pendientes y en progreso por fecha, entre todos los eventos
(incluidas las vencidas). Si algún día supera el nuevo límite, el cambio no se
guarda y el campo muestra la fecha de mayor carga y el mínimo necesario; las
completadas no cuentan. Los aumentos y guardar el mismo valor se permiten. Si la
consulta falla, se conserva el límite guardado y se puede reintentar. Esta
comprobación se realiza en el frontend antes del PUT; no garantiza cambios
concurrentes en otras sesiones ni sustituye una validación en el backend.

Una preferencia anterior válida de Clerk se importa
una sola vez, sin modificar sus demás metadatos. Consulta el flujo, decisiones UX
y evidencia reproducible en [docs/sprint-3.md](docs/sprint-3.md).
La [API de usuario de Clerk](https://clerk.com/docs/react/reference/objects/user)
define las operaciones utilizadas y los ajustes que deben estar habilitados en
la instancia: nombre/apellido, correo, contraseña y eliminación de cuenta.

**Alcance del borrado:** la confirmación «ELIMINAR» llama a `DELETE /api/auth/me/`
con la sesión del organizador y el encabezado `X-Account-Deletion-Confirmation`.
El backend elimina la identidad en Clerk, el
usuario de Eventger y sus eventos, tareas y preferencias; sólo después de su
respuesta 204 el frontend limpia el borrador propio y cierra la sesión.
El endpoint exige una [reverificación reciente de Clerk](https://clerk.com/docs/guides/secure/reverification)
(`strict`), que el diálogo solicita mediante `useReverification`. Cada intento
obtiene un token actualizado. Si la eliminación falla, mantiene el diálogo para
reintentar; un fallo al cerrar sesión después del borrado no repite la eliminación.
Requiere desplegar el backend con este contrato antes del frontend. Las pruebas
usan HTTP/Clerk simulados; no eliminan cuentas reales.

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
