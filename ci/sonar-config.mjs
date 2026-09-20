import { appendFileSync, existsSync } from 'node:fs'

if (process.env.SONAR_ENABLED !== 'true') {
  const message = 'Sonar: análisis no ejecutado (SONAR_ENABLED no es true).\n'
  console.log(message)
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, message)
} else {
  for (const name of ['SONAR_HOST_URL', 'SONAR_PROJECT_KEY', 'SONAR_TOKEN']) {
    if (!process.env[name]?.trim()) throw new Error(`Falta configurar ${name}.`)
  }
  let host
  try {
    host = new URL(process.env.SONAR_HOST_URL)
  } catch {
    throw new Error('SONAR_HOST_URL debe ser una URL HTTPS válida.')
  }
  if (host.protocol !== 'https:' || host.username || host.password) {
    throw new Error('SONAR_HOST_URL debe usar HTTPS sin credenciales en la URL.')
  }
  if (['sonarcloud.io', 'sonarqube.us'].includes(host.hostname) && !process.env.SONAR_ORGANIZATION?.trim()) {
    throw new Error('SonarQube Cloud requiere SONAR_ORGANIZATION.')
  }
  if (!existsSync('coverage/lcov.info')) throw new Error('Falta LCOV de esta ejecución y revisión.')
  const escape = (value) => value.replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll('\r', '\\r')
  for (const [key, variable] of [
    ['sonar.projectKey', 'SONAR_PROJECT_KEY'],
    ['sonar.organization', 'SONAR_ORGANIZATION'],
  ]) {
    if (process.env[variable]) appendFileSync('sonar-project.properties', `\n${key}=${escape(process.env[variable])}\n`)
  }
}
