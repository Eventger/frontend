# Microcopy y validaciones de autenticación

Este documento es la referencia para mantener alineados el frontend, las pruebas,
los prototipos de Figma y las evidencias UX. La política vigente para crear o
restablecer una contraseña es de **15 caracteres como mínimo**.

La constante implementada en el frontend es `PASSWORD_MIN_LENGTH = 15`. La
configuración de contraseñas de la instancia de Clerk debe aceptar el mismo mínimo;
el frontend no reemplaza la validación del proveedor de identidad.

## Mensajes junto a campos

| Flujo | Campo o control | Condición | Mensaje exacto |
| --- | --- | --- | --- |
| Inicio de sesión | Correo electrónico | Vacío | Ingresa tu correo electrónico. |
| Inicio de sesión | Correo electrónico | Formato inválido | Ingresa una dirección de correo válida. |
| Inicio de sesión | Contraseña | Vacía | Ingresa tu contraseña. |
| Crear cuenta | Nombre | Vacío | Ingresa tu nombre. |
| Crear cuenta | Apellido | Vacío | Ingresa tu apellido. |
| Crear cuenta | Correo electrónico | Vacío | Ingresa tu correo electrónico. |
| Crear cuenta | Correo electrónico | Formato inválido | Ingresa una dirección de correo válida. |
| Crear cuenta | Contraseña | Vacía | Ingresa una contraseña. |
| Crear cuenta | Contraseña | Menos de 15 caracteres | Usa al menos 15 caracteres. |
| Crear cuenta | Términos | Sin aceptar | Debes aceptar los Términos y condiciones y la Política de privacidad. |
| Verificación | Código | No tiene 6 dígitos | Ingresa el código de 6 dígitos. |
| Recuperación | Código | No tiene 6 dígitos | Ingresa el código de 6 dígitos que enviamos a tu correo. |
| Recuperación | Nueva contraseña | Menos de 15 caracteres | La nueva contraseña debe tener al menos 15 caracteres. |

## Criterios de presentación

- El mensaje se muestra junto al campo que requiere corrección y no depende
  exclusivamente del color.
- El campo inválido usa `aria-invalid="true"` y queda asociado a su mensaje con
  `aria-describedby` cuando el mensaje es inline.
- Tras enviar el formulario, el foco pasa al primer campo inválido.
- Los errores de credenciales no revelan si falló el correo o la contraseña.
- Los errores de red y del proveedor se presentan como mensajes generales, no
  como errores atribuibles a un campo concreto.
- Los rechazos específicos de contraseña se leen desde `error.errors` en un
  `ClerkAPIResponseError`; su código exterior `api_response_error` no identifica
  el campo que requiere corrección.
- El registro vuelve al inicio de sesión con la confirmación de cuenta creada
  cuando Clerk devuelve `status === 'complete'`. Si Clerk completa la cuenta al
  enviar el formulario, no se solicita un código adicional. Si requiere verificar
  el correo, se conserva el envío y la validación del código antes de confirmar.

## Lista de sincronización

Antes de publicar un cambio de validación, actualizar en conjunto:

1. La constante y los mensajes del frontend.
2. Las pruebas automatizadas.
3. Las capas de texto de Figma para registro y recuperación.
4. Las capturas o PDF de evidencia UX afectados.
5. La política de contraseñas en Clerk, si cambia el requisito real.
