export function isValidEmail(
  value: string,
) {
  const email = value.trim()

  if (!email || /\s/.test(email)) {
    return false
  }

  const atIndex = email.indexOf('@')

  if (
    atIndex <= 0 ||
    atIndex !== email.lastIndexOf('@') ||
    atIndex === email.length - 1
  ) {
    return false
  }

  const domain = email.slice(atIndex + 1)
  const dotIndex = domain.lastIndexOf('.')

  return (
    dotIndex > 0 &&
    dotIndex < domain.length - 1
  )
}
