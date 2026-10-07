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
| Acceso desde un navegador nuevo / segundo factor | Código | Incorrecto o vencido | El código no es válido o ya expiró. |
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
- La verificación del correo al registrar la cuenta y la confirmación de un
  navegador nuevo son pasos distintos. `needs_client_trust` y
  `needs_second_factor` muestran «Verifica tu acceso», no un error de credenciales.
  El usuario puede enviar y reenviar el código o usar el factor admitido por Clerk.
- El acceso a rutas privadas ocurre después de que `signIn.finalize()` termina
  correctamente. No se anuncia una sesión activa antes de completar ese paso.

## Eliminación de cuenta

- La tarjeta de Seguridad indica: «Se eliminarán tu cuenta, eventos y tareas.
  Esta acción no se puede deshacer.»
- El diálogo exige escribir «ELIMINAR» y explica: «Se eliminarán tu perfil y
  acceso en Clerk, además de tus eventos, tareas y preferencias de Eventger.»
- La reverificación se solicita antes de cualquier borrado. Cancelarla no borra
  datos. Un fallo del servicio muestra «No pudimos eliminar tu cuenta. Inténtalo
  de nuevo.» y permite reintentar.
- Si el borrado terminó pero falló el cierre de sesión, muestra «Tu cuenta se
  eliminó. No pudimos cerrar la sesión en este dispositivo. Inténtalo de nuevo.»
  y la acción pasa a «Cerrar sesión», sin volver a enviar el borrado.

## Lista de sincronización

Antes de publicar un cambio de validación, actualizar en conjunto:

1. La constante y los mensajes del frontend.
2. Las pruebas automatizadas.
3. Las capas de texto de Figma para registro y recuperación.
4. Las capturas o PDF de evidencia UX afectados.
5. La política de contraseñas en Clerk, si cambia el requisito real.

## Ajustes de la auditoría del 4 de octubre de 2026

- Una contraseña incorrecta o un identificador inexistente muestran el mismo
  mensaje junto a las credenciales: «El correo o la contraseña no son correctos.
  Revisa tus datos e inténtalo de nuevo.». Ambos campos se asocian al mensaje y
  el foco vuelve a la contraseña. No se propone crear otra cuenta como solución
  a una contraseña incorrecta. Los errores no reconocidos del proveedor siguen
  usando el feedback general.
- La recuperación asocia los errores de formato de código y longitud de
  contraseña al campo mediante `aria-describedby` y `aria-invalid`; también
  recupera el foco al repetir el mismo error. El mínimo de 15 caracteres se
  explica antes del envío de la nueva contraseña.
- Recuperar la contraseña utiliza la misma activación de sesión que el login:
  espera la respuesta, respeta los pasos adicionales de verificación y permite
  reintentar la activación sin volver a enviar una contraseña ya actualizada.
- La galería histórica `auth-feedback-review` todavía contiene el modal de
  «Cuenta no encontrada». Es una fixture visual, no el flujo vigente de login;
  debe sustituirse al actualizar las referencias Figma.
