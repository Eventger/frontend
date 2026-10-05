/** Focus follows the visual field order, including custom select triggers. */
export function focusFirstError<T extends string>(
  errors: Partial<Record<T, string>>,
  fields: Record<T, string>,
) {
  for (const field of Object.keys(fields) as T[]) {
    if (errors[field]) {
      document.getElementById(fields[field])?.focus()
      return
    }
  }
}
