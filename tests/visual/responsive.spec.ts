import {
  expect,
  test,
} from '@playwright/test'
import { dayPlan } from '../features/events/planning.fixtures'
import { subtaskApiFixture } from '../features/events/subtask.fixtures'
import { addressApiFixture, addressFixture } from '../features/events/address.fixtures'

test.beforeEach(async ({ page }) => {
  await page.route('**/event-types/', route => route.fulfill({ json: { success: true, data: [
    { id: 1, name: 'Boda', description: '' }, { id: 2, name: 'Social', description: '' },
    { id: 3, name: 'Corporativo', description: '' }, { id: 4, name: 'Cumpleaños', description: '' },
    { id: 5, name: 'Otro', description: '' },
  ] } }))
  await page.route('**/api/auth/preferences/', route => route.fulfill({ json: { success: true, data: { daily_limit_hours: '6.00', daily_limit_configured: true } } }))
  await page.route('**/subtasks/70/reschedule-preview/', route => {
    const input = route.request().postDataJSON()
    return route.fulfill({ json: { success: true, data: dayPlan(input.target_date, Number(input.estimated_hours)) } })
  })
  await page.route('**/subtasks/70/', route => {
    const input = route.request().postDataJSON()
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date(input.target_date))
    return route.fulfill({ json: { success: true, data: { ...subtaskApiFixture, id: 70, name: 'Buscar proveedores', ...input }, planning: dayPlan(date, Number(input.estimated_hours)) } })
  })
})

type NavigationFrame = {
  phase: 'today' | 'loading' | 'ready' | 'empty' | 'blank'
  mainWidth: number
}
type NavigationWindow = Window & typeof globalThis & {
  taskNavigation: { frames: NavigationFrame[]; transitions: number; animationFrame: number }
}

const taskNavigationScenarios = [
  { name: 'escritorio', width: 1440, height: 900, motion: 'no-preference', nativeTransition: true },
  { name: 'móvil', width: 390, height: 844, motion: 'no-preference', nativeTransition: true },
  { name: 'escritorio con movimiento reducido', width: 1440, height: 900, motion: 'reduce', nativeTransition: true },
  { name: 'móvil con movimiento reducido', width: 390, height: 844, motion: 'reduce', nativeTransition: true },
  { name: 'navegador sin View Transitions', width: 1440, height: 900, motion: 'no-preference', nativeTransition: false },
] as const

for (const scenario of taskNavigationScenarios) {
  test(`Ver tarea navega sin parpadeos en ${scenario.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: scenario.width, height: scenario.height })
    await page.emulateMedia({ reducedMotion: scenario.motion })

    const event = { id: 21, type: 0, name: 'Boda Backend', date: '2026-10-24T23:59:59-05:00', location: 'Cali', contact: 'Laura 3001234567' }
    const task = { id: 31, event: 21, event_name: event.name, name: 'Coordinar transporte', target_date: '2026-10-20T23:59:59-05:00', estimated_hours: '2.50', state: 'pending', details: 'Confirmar disponibilidad.' }
    const precedingTasks = Array.from({ length: 12 }, (_, index) => ({ ...task, id: 100 + index, name: `Seguimiento ${index + 1}`, estimated_hours: '1.00' }))
    let releaseTasks = () => {}
    const pendingTasks = new Promise<void>(resolve => { releaseTasks = resolve })

    await page.route('**/hoy/', route => route.fulfill({ json: { success: true, data: { overdue: [], today: [...precedingTasks, task], upcoming: [], completed: [] } } }))
    await page.route(url => url.pathname === '/events/', route => route.fulfill({ json: { success: true, data: [event], pagination: { page: 1, page_size: 6, total: 1, total_pages: 1 } } }))
    await page.route('**/event-types/', route => route.fulfill({ json: { success: true, data: [{ id: 0, name: 'Boda', description: 'Evento de boda.' }] } }))
    await page.route('**/events/21/', async route => {
      await new Promise(resolve => setTimeout(resolve, 300))
      await route.fulfill({ json: { success: true, data: event } })
    })
    await page.route('**/events/21/subtasks/', async route => {
      await pendingTasks
      await route.fulfill({ json: { success: true, data: [task] } })
    })

    await page.goto('/tests/visual/index.html?view=today-navigation')
    const openTask = page.getByRole('button', { name: `Ver tarea: ${task.name}` })
    await openTask.scrollIntoViewIfNeeded()
    const previousScroll = await page.evaluate(() => window.scrollY)
    expect(previousScroll).toBeGreaterThan(0)

    await page.evaluate(({ nativeTransition, taskName }) => {
      const navigationWindow = window as NavigationWindow
      const trace = { frames: [] as NavigationFrame[], transitions: 0, animationFrame: 0 }
      navigationWindow.taskNavigation = trace
      if (nativeTransition) {
        const startTransition = document.startViewTransition.bind(document)
        document.startViewTransition = options => {
          trace.transitions++
          return startTransition(options)
        }
      } else {
        Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true })
      }

      const record = () => {
        const main = document.querySelector('main')!
        const isToday = main.querySelector('h1')?.textContent === 'Hoy'
        const isLoading = Boolean(main.querySelector('[aria-label="Cargando evento"]'))
        const isReady = Array.from(main.querySelectorAll('h2, h3')).some(heading => heading.textContent === taskName)
        const isEmpty = main.textContent?.includes('Aún no tienes tareas para este evento')
        trace.frames.push({
          phase: isToday ? 'today' : isLoading ? 'loading' : isReady ? 'ready' : isEmpty ? 'empty' : 'blank',
          mainWidth: main.getBoundingClientRect().width,
        })
        trace.animationFrame = requestAnimationFrame(record)
      }
      record()
    }, { nativeTransition: scenario.nativeTransition, taskName: task.name })

    try {
      const taskRequest = page.waitForRequest('**/events/21/subtasks/')
      await openTask.click()
      await taskRequest
      await expect(page.getByRole('status', { name: 'Cargando evento' })).toBeVisible()
      await page.screenshot({ path: testInfo.outputPath('ver-tarea-cargando.png') })
      releaseTasks()
      await expect(page.getByRole('heading', { name: task.name, exact: true })).toBeVisible()
      await page.screenshot({ path: testInfo.outputPath('ver-tarea-evento.png') })

      const trace = await page.evaluate(() => {
        const trace = (window as NavigationWindow).taskNavigation
        cancelAnimationFrame(trace.animationFrame)
        return { frames: trace.frames, transitions: trace.transitions, scroll: window.scrollY }
      })
      const phases = trace.frames.filter((frame, index, frames) => index === 0 || frame.phase !== frames[index - 1].phase).map(frame => frame.phase)
      expect(phases).toEqual(['today', 'loading', 'ready'])
      expect(trace.transitions).toBe(scenario.nativeTransition ? 1 : 0)
      expect(trace.scroll).toBe(0)
      expect(Math.max(...trace.frames.map(frame => frame.mainWidth)) - Math.min(...trace.frames.map(frame => frame.mainWidth))).toBeLessThanOrEqual(1)
      await expect(page.locator('#main-content')).toBeFocused()
      await page.goBack()
      await expect(page.getByRole('heading', { name: 'Hoy', exact: true })).toBeVisible()
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(previousScroll, 0)
    } finally {
      releaseTasks()
    }
  })
}

for (const viewport of [
  { name: 'móvil pequeño', width: 320, height: 568 },
  { name: 'móvil', width: 390, height: 844 },
  { name: 'tableta', width: 768, height: 1024 },
  { name: 'escritorio', width: 1440, height: 900 },
  { name: 'escritorio amplio', width: 1920, height: 1080 },
]) {
  for (const longName of [false, true]) {
    test(`alineación entre vistas en ${viewport.name} con nombre ${longName ? 'largo' : 'corto'}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport)
      const event = { id: 21, type: 0, name: longName ? 'Encuentro internacional de organizadores de eventos y proveedores de varias ciudades' : 'Boda Laura y Daniel', date: '2099-12-31T23:59:59-05:00', location: 'Cali', contact: 'Laura 3001234567' }
      const task = { id: 31, event: 21, event_name: event.name, name: 'Coordinar transporte', target_date: '2099-12-20T23:59:59-05:00', estimated_hours: '2.50', state: 'pending', details: 'Confirmar disponibilidad.' }
      let failCreate = true
      let failUpdate = true
      await page.route('**/hoy/', route => route.fulfill({ json: { success: true, data: { overdue: [], today: [task], upcoming: [], completed: [] } } }))
      await page.route(url => url.pathname === '/events/', route => {
        if (route.request().method() === 'POST') {
          return failCreate
            ? route.fulfill({ status: 503, json: { success: false, message: 'No se pudo crear el evento.' } })
            : route.fulfill({ json: { success: true, data: { ...event, ...route.request().postDataJSON(), id: 22 } } })
        }
        return route.fulfill({ json: { success: true, data: [event], pagination: { page: 1, page_size: 6, total: 1, total_pages: 1 } } })
      })
      await page.route('**/event-types/', route => route.fulfill({ json: { success: true, data: [{ id: 0, name: 'Boda', description: 'Evento de boda.' }] } }))
      await page.route('**/events/21/', async route => {
        if (route.request().method() === 'PATCH') {
          if (failUpdate) return route.fulfill({ status: 503, json: { success: false, message: 'No se pudo guardar.' } })
          Object.assign(event, route.request().postDataJSON())
        } else {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
        await route.fulfill({ json: { success: true, data: event } })
      })
      await page.route('**/events/21/subtasks/', route => route.fulfill({ json: { success: true, data: [task] } }))
      await page.goto('/tests/visual/index.html?view=layout-navigation')
      await expect(page.getByRole('button', { name: `Ver tarea: ${task.name}` })).toBeVisible()

      const main = page.locator('main')
      const baseline = await main.getByRole('heading', { name: 'Hoy', exact: true }).boundingBox()
      const breadcrumbBaseline = await main.getByRole('navigation', { name: 'Miga de pan' }).boundingBox()
      expect(baseline).not.toBeNull()
      expect(breadcrumbBaseline).not.toBeNull()

      const checkAlignment = async (title: string, screenshotName?: string) => {
        const heading = main.getByRole('heading', { name: title, exact: true })
        await expect(heading).toBeVisible()
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
        const bounds = await heading.boundingBox()
        const breadcrumb = await main.getByRole('navigation', { name: 'Miga de pan' }).boundingBox()
        expect(bounds!.x).toBeCloseTo(baseline!.x, 1)
        expect(bounds!.y).toBeCloseTo(baseline!.y, 1)
        expect(breadcrumb!.y).toBeCloseTo(breadcrumbBaseline!.y, 1)
        expect(breadcrumb!.height).toBe(44)
        expect(await heading.evaluate(element => getComputedStyle(element).lineHeight)).toBe('36px')
        const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
        expect(dimensions.content).toBeLessThanOrEqual(dimensions.width)
        if (screenshotName) await page.screenshot({ path: testInfo.outputPath(`${screenshotName}.png`) })
      }

      if (viewport.width < 1280) await page.getByRole('button', { name: 'Abrir menú' }).click()
      await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Eventos', exact: true }).click()
      await expect(main.getByRole('heading', { name: event.name, exact: true })).toBeVisible()
      await checkAlignment('Eventos')
      await main.getByRole('button', { name: 'Crear evento', exact: true }).click()
      await checkAlignment('Crear evento', 'crear-alineado')
      await page.getByLabel('Nombre del evento *', { exact: true }).fill(event.name)
      await page.getByRole('combobox', { name: 'Tipo de evento *', exact: true }).click()
      await page.getByRole('option', { name: 'Boda', exact: true }).click()
      await page.getByLabel('Fecha del evento *', { exact: true }).fill('2099-12-31')
      await page.getByLabel('Lugar *', { exact: true }).fill(event.location)
      await page.getByLabel('Contacto *', { exact: true }).fill(event.contact)
      await main.getByRole('button', { name: 'Crear evento', exact: true }).click()
      await checkAlignment('Evento no creado')
      await expect(main.getByRole('heading', { name: 'Evento no creado', exact: true })).toBeFocused()
      await page.getByRole('button', { name: 'Volver y revisar', exact: true }).click()
      await checkAlignment('Crear evento')
      await expect(page.getByLabel('Nombre del evento *', { exact: true })).toHaveValue(event.name)
      failCreate = false
      await main.getByRole('button', { name: 'Crear evento', exact: true }).click()
      await checkAlignment('Evento creado', 'creado-alineado')
      await page.getByRole('button', { name: 'Volver a eventos', exact: true }).click()
      await expect(main.getByRole('heading', { name: event.name, exact: true })).toBeVisible()
      await main.getByRole('link', { name: new RegExp(event.name) }).click()
      const loading = main.getByRole('status', { name: 'Cargando evento' })
      await expect(loading).toBeVisible()
      const loadingBounds = await loading.boundingBox()
      expect(loadingBounds!.x).toBeCloseTo(baseline!.x, 1)
      expect(loadingBounds!.y).toBeCloseTo(baseline!.y, 1)
      await expect(main.getByRole('heading', { name: task.name, exact: true })).toBeVisible()
      await checkAlignment(event.name, 'detalle-alineado')
      await main.getByRole('button', { name: 'Editar evento', exact: true }).click()
      await checkAlignment('Editar evento', 'editar-alineado')
      await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click()
      await checkAlignment('Cambios no guardados')
      await expect(main.getByRole('heading', { name: 'Cambios no guardados', exact: true })).toBeFocused()
      failUpdate = false
      await page.getByRole('button', { name: 'Intentar de nuevo', exact: true }).click()
      await checkAlignment('Evento actualizado', 'actualizado-alineado')
      await page.getByRole('button', { name: 'Volver al evento', exact: true }).click()
      await expect(main.getByRole('heading', { name: task.name, exact: true })).toBeVisible()
      await checkAlignment(event.name)
      if (viewport.width < 1280) await page.getByRole('button', { name: 'Abrir menú' }).click()
      await page.getByRole('button', { name: 'Abrir configuración de cuenta' }).click()
      await checkAlignment('Configuración de cuenta')
      await page.getByRole('link', { name: 'Administrar seguridad', exact: true }).click()
      await expect(page.getByText('2 sesiones', { exact: true })).toBeVisible()
      await checkAlignment('Seguridad de la cuenta', 'seguridad-alineada')
    })
  }
}

const coreViews = [
  'login',
  'signup',
  'events-empty',
  'events-error',
  'feedback',
  'feedback-success',
  'empty-tasks',
  'event-task',
  'today',
  'delete-dialog',
  'settings',
  'security',
  'reschedule',
  'conflict',
  'breadcrumbs',
] as const

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop-compact', width: 1024, height: 768 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'reference', width: 1440, height: 900 },
  { name: 'wide', width: 1920, height: 1080 },
] as const

for (const viewport of viewports) {
  test.describe(viewport.name, () => {
    test.use({
      viewport: {
        width: viewport.width,
        height: viewport.height,
      },
    })

    for (const view of coreViews) {
      test(`${view} no produce overflow horizontal`, async ({
        page,
      }, testInfo) => {
        await page.goto(
          `/tests/visual/index.html?view=${view}`,
        )

        await expect(page.locator('body')).toBeVisible()
        if (view === 'security') await expect(page.getByText('2 sesiones')).toBeVisible()
        if (view === 'reschedule') {
          await expect(page.getByLabel('Nueva fecha')).toBeEmpty()
          await expect(page.getByText('Elige una fecha')).toBeVisible()
          await expect(page.getByText('Aquí verás la carga del día antes de reprogramar.')).toBeVisible()
          await expect(page.getByRole('button', { name: 'Reprogramar', exact: true })).toBeDisabled()
        }
        if (view === 'conflict') await expect(page.getByText('7 h / 6 h')).toBeVisible()

        const dimensions = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          page: document.documentElement.scrollWidth,
        }))

        expect(dimensions.page).toBeLessThanOrEqual(
          dimensions.viewport,
        )

        await page.screenshot({
          path: testInfo.outputPath(
            `${view}-${viewport.name}.png`,
          ),
          fullPage: true,
        })
      })
    }
  })
}

test('Sprint 3 permite resolver por teclado en móvil y conserva foco al cancelar', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 640 })
  await page.goto('/tests/visual/index.html?view=conflict')
  await page.getByRole('button', { name: 'Cancelar reprogramación' }).click()
  await page.getByRole('button', { name: 'Abrir reprogramación' }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Abrir reprogramación' })).toBeFocused()
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: 'Resolver conflicto' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('button', { name: 'Aplicar opción' })).toBeEnabled()
  expect(await dialog.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1)
  await page.screenshot({ path: testInfo.outputPath('sprint3-resolucion-mobile.png'), fullPage: true })
  await dialog.getByRole('button', { name: 'Aplicar opción' }).click()
  await expect(dialog.getByRole('heading', { name: '¿Estás seguro?' })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('sprint3-confirmacion-mobile.png'), fullPage: true })
  await dialog.getByRole('button', { name: 'Aceptar' }).click()
  await expect(page.getByRole('heading', { name: 'Tarea reprogramada correctamente' })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('sprint3-resuelto-mobile.png'), fullPage: true })
})

test('Sprint 3 muestra tres tareas en conflicto sin desplazar el diálogo en escritorio', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1182, height: 842 })
  await page.goto('/tests/visual/index.html?view=conflict')
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: /Sobrecarga para el/ })).toBeVisible()
  await expect(dialog.getByRole('list', { name: 'Tareas que forman la carga del día' }).getByRole('listitem')).toHaveCount(3)
  await expect(dialog.getByRole('button', { name: 'Resolver conflicto' })).toBeVisible()
  expect(await dialog.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1)
  await page.screenshot({ path: testInfo.outputPath('sprint3-conflicto-tres-tareas.png'), fullPage: true })
})

test('Sprint 3 mantiene encabezado y acciones visibles con muchas tareas en conflicto', async ({ page }) => {
  await page.setViewportSize({ width: 1182, height: 842 })
  await page.goto('/tests/visual/index.html?view=conflict-many')
  const dialog = page.getByRole('dialog')
  const tasks = dialog.getByRole('list', { name: 'Tareas que forman la carga del día' })
  await expect(tasks.getByRole('listitem')).toHaveCount(11)
  expect(await tasks.evaluate(element => element.scrollHeight - element.clientHeight)).toBeGreaterThan(0)
  expect(await dialog.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1)
  await expect(dialog.getByRole('heading', { name: /Sobrecarga para el/ })).toBeInViewport()
  await expect(dialog.getByRole('button', { name: 'Resolver conflicto' })).toBeInViewport()
})

test('Sprint 3 conserva el tamaño del diálogo al resolver la sobrecarga', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1182, height: 842 })
  await page.goto('/tests/visual/index.html?view=conflict')
  const dialog = page.getByRole('dialog')
  const conflictWidth = (await dialog.boundingBox())?.width
  await dialog.getByRole('button', { name: 'Resolver conflicto' }).click()
  await expect(dialog.getByRole('heading', { name: 'Resolver sobrecarga' })).toBeInViewport()
  await expect(dialog.getByRole('button', { name: 'Aplicar opción' })).toBeInViewport()
  expect((await dialog.boundingBox())?.width).toBe(conflictWidth)
  expect(await dialog.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1)
  await page.screenshot({ path: testInfo.outputPath('sprint3-resolver-sobrecarga.png'), fullPage: true })
})

test('Sprint 3 muestra la resolución sin sugerencia completa sin scroll en escritorio', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 974, height: 876 })
  await page.route('**/subtasks/70/reschedule-preview/', route => {
    const input = route.request().postDataJSON()
    return route.fulfill({ json: { success: true, data: {
      ...dayPlan(input.target_date, Number(input.estimated_hours)),
      existing_hours: '1.25', planned_hours: '3.25', daily_limit_hours: '1',
      overload_hours: '2.25', has_conflict: true, suggestion: null,
    } } })
  })
  await page.goto('/tests/visual/index.html?view=conflict-no-suggestion')
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Resolver conflicto' }).click()
  await expect(dialog.getByText('1 h 15 min', { exact: true })).toBeVisible()
  const body = dialog.getByRole('group', { name: 'Alternativa de resolución' }).locator('..')
  expect(await body.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1)
  await expect(dialog.getByRole('button', { name: 'Aplicar opción' })).toBeInViewport()
  await page.screenshot({ path: testInfo.outputPath('sprint3-sin-sugerencia-completo.png'), fullPage: true })
  await page.setViewportSize({ width: 749, height: 674 })
  await dialog.evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => undefined))) })
  expect(await body.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1)
  await expect(dialog.getByRole('button', { name: 'Aplicar opción' })).toBeInViewport()
  const dateBounds = await dialog.getByLabel('Otra fecha').boundingBox()
  const previewBounds = await dialog.getByText('Vista previa de carga', { exact: true }).boundingBox()
  await dialog.getByRole('radio', { name: /Reducir el tiempo/ }).check()
  await expect(dialog.getByLabel('Minutos', { exact: true })).toBeVisible()
  await dialog.getByRole('combobox', { name: 'Minutos' }).click()
  await page.getByRole('option', { name: '45', exact: true }).click()
  await expect(dialog.getByRole('combobox', { name: 'Minutos' })).toHaveText('45')
  await dialog.evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => undefined))) })
  await expect(dialog.getByText('Vista previa de carga', { exact: true })).toBeVisible()
  const hoursBounds = await dialog.getByLabel('Horas', { exact: true }).boundingBox()
  const reducedPreviewBounds = await dialog.getByText('Vista previa de carga', { exact: true }).boundingBox()
  expect(Math.abs(hoursBounds!.y - dateBounds!.y)).toBeLessThanOrEqual(1)
  expect(Math.abs(reducedPreviewBounds!.y - previewBounds!.y)).toBeLessThanOrEqual(1)
  expect(await body.evaluate(element => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(1)
})

for (const viewport of [{ width: 1182, height: 842 }, { width: 320, height: 568 }]) {
  test(`Sprint 3 mantiene la posición y dimensiones durante todo el flujo en ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/tests/visual/index.html?view=reschedule')
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('button', { name: 'Reprogramar', exact: true })).toBeDisabled()
    const initialBounds = await dialog.boundingBox()
    async function checkBounds() {
      const bounds = await dialog.boundingBox()
      expect(bounds).not.toBeNull()
      for (const key of ['x', 'y', 'width', 'height'] as const) {
        expect(Math.abs(bounds![key] - initialBounds![key])).toBeLessThanOrEqual(1)
      }
    }
    await dialog.getByLabel('Nueva fecha').fill('2026-10-12')
    await expect(dialog.getByRole('button', { name: 'Reprogramar', exact: true })).toBeEnabled()
    await dialog.getByRole('button', { name: 'Reprogramar', exact: true }).click()
    await expect(dialog.getByRole('heading', { name: /Sobrecarga para el/ })).toBeVisible()
    await checkBounds()
    await dialog.getByRole('button', { name: 'Resolver conflicto' }).click()
    await expect(dialog.getByRole('button', { name: 'Aplicar opción' })).toBeEnabled()
    await checkBounds()
    await dialog.getByRole('radio', { name: /Elegir manualmente/ }).check()
    await expect(dialog.getByLabel('Otra fecha')).toBeVisible()
    await checkBounds()
    await dialog.getByRole('radio', { name: /Reducir el tiempo/ }).check()
    await expect(dialog.getByLabel('Horas', { exact: true })).toBeVisible()
    await checkBounds()
    await dialog.getByRole('radio', { name: /Mover Buscar proveedores/ }).check()
    await expect(dialog.getByRole('button', { name: 'Aplicar opción' })).toBeEnabled()
    await dialog.getByRole('button', { name: 'Aplicar opción' }).click()
    await dialog.getByRole('button', { name: 'Aceptar' }).click()
    await expect(dialog.getByRole('heading', { name: 'Tarea reprogramada correctamente' })).toBeVisible()
    await checkBounds()
  })
}

for (const viewport of [
  { name: 'móvil pequeño', width: 320, height: 568 },
  { name: 'escritorio', width: 1440, height: 900 },
]) {
  test(`Sprint 3 conserva fecha, borrador y reintento tras una recarga fallida en ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const event = { id: 21, type: 1, name: 'Boda Backend', date: '2099-12-31T23:59:59-05:00', location: 'Cali', contact: 'Laura 3001234567' }
    let task = { ...subtaskApiFixture, target_date: '2099-12-21T04:59:59.000Z', estimated_hours: '2.00' }
    let writes = 0
    let taskReads = 0
    let failReload = true
    const warning = 'No pudimos actualizar la lista de tareas. Los cambios guardados se conservan.'
    const warningStatus = page.getByRole('status').filter({ hasText: warning })
    await page.route('**/hoy/', route => route.fulfill({ json: { success: true, data: { overdue: [], today: [], upcoming: [], completed: [] } } }))
    await page.route(url => url.pathname === '/events/', route => route.fulfill({ json: { success: true, data: [event], pagination: { page: 1, page_size: 6, total: 1, total_pages: 1 } } }))
    await page.route('**/events/21/', route => route.fulfill({ json: { success: true, data: event } }))
    await page.route('**/events/21/subtasks/', route => {
      taskReads++
      return writes && failReload
        ? route.fulfill({ status: 503, json: { success: false } })
        : route.fulfill({ json: { success: true, data: [task] } })
    })
    await page.route('**/subtasks/31/reschedule-preview/', route => {
      const input = route.request().postDataJSON()
      return route.fulfill({ json: { success: true, data: { ...dayPlan(input.target_date, Number(input.estimated_hours)), event_date: '2099-12-31' } } })
    })
    await page.route('**/subtasks/31/', route => {
      expect(route.request().method()).toBe('PATCH')
      writes++
      task = { ...task, ...route.request().postDataJSON() }
      // El servidor puede devolver el mismo instante normalizado a UTC.
      task.target_date = new Date(task.target_date).toISOString()
      return route.fulfill({ json: { success: true, data: task, planning: { ...dayPlan('2099-12-21', Number(task.estimated_hours)), event_date: '2099-12-31' } } })
    })
    await page.goto('/tests/visual/index.html?view=layout-navigation')
    if (viewport.width < 1280) await page.getByRole('button', { name: 'Abrir menú' }).click()
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Eventos', exact: true }).click()
    await page.getByRole('region', { name: 'Lista de eventos' }).getByRole('link').click()
    await page.getByRole('button', { name: 'Editar evento', exact: true }).click()
    const tasks = page.getByRole('list', { name: 'Tareas agregadas' })
    await expect(tasks.getByText('20/12/2099', { exact: true })).toBeVisible()
    await page.getByLabel('Contacto *', { exact: true }).fill('Contacto sin guardar')
    await page.getByRole('button', { name: `Reprogramar ${task.name}`, exact: true }).click()
    await expect(page.getByLabel('Nueva fecha', { exact: true })).toHaveValue('')
    await page.getByLabel('Nueva fecha', { exact: true }).fill('2099-12-21')
    await page.getByRole('button', { name: 'Reprogramar', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Tarea reprogramada correctamente' })).toBeVisible()
    await page.getByRole('button', { name: 'Volver al plan', exact: true }).click()
    await expect(tasks.getByText('21/12/2099', { exact: true })).toHaveAttribute('datetime', '2099-12-21')
    await expect(page.getByLabel('Contacto *', { exact: true })).toHaveValue('Contacto sin guardar')
    await expect(warningStatus).toBeVisible()
    const retry = page.getByRole('button', { name: 'Reintentar', exact: true })
    await retry.scrollIntoViewIfNeeded()
    expect((await retry.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    const width = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(width.content).toBeLessThanOrEqual(width.viewport)
    const readsBeforeRetry = taskReads
    failReload = false
    await retry.click()
    await expect(warningStatus).toHaveCount(0)
    await expect(page.getByText('Actualizando la lista de tareas…', { exact: true })).toHaveCount(0)
    expect(writes).toBe(1)
    expect(taskReads).toBe(readsBeforeRetry + 1)
    await page.getByRole('button', { name: `Editar ${task.name}`, exact: true }).click()
    await expect(page.getByLabel('Fecha límite *', { exact: true })).toHaveValue('2099-12-21')
    await expect(page.getByLabel('Contacto *', { exact: true })).toHaveValue('Contacto sin guardar')
  })
}

test('cambia entre navegación móvil y sidebar sin comprimir el contenido', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 1024,
    height: 768,
  })
  await page.goto(
    '/tests/visual/index.html?view=events-empty',
  )

  await expect(
    page.getByRole('button', {
      name: 'Abrir menú',
    }),
  ).toBeVisible()
  await expect(page.locator('aside')).toBeHidden()

  await page.setViewportSize({
    width: 1366,
    height: 768,
  })

  await expect(
    page.getByRole('button', {
      name: 'Abrir menú',
    }),
  ).toBeHidden()
  await expect(page.locator('aside')).toBeVisible()
})

test('Hoy y Eventos mantienen alineados el encabezado y su acción', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  })

  const getHeaderBounds = async (
    view: 'events-empty' | 'today',
    title: 'Eventos' | 'Hoy',
  ) => {
    await page.goto(
      `/tests/visual/index.html?view=${view}`,
    )

    const headingLocator = page
      .getByRole('heading', {
        name: title,
        exact: true,
      })
    const header = headingLocator.locator(
      'xpath=ancestor::header',
    )
    await expect(headingLocator).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    const heading = await headingLocator.boundingBox()
    const action = await header
      .getByRole('button', {
        name: 'Crear evento',
        exact: true,
      })
      .boundingBox()

    expect(heading).not.toBeNull()
    expect(action).not.toBeNull()

    return {
      heading: heading!,
      action: action!,
    }
  }

  const events = await getHeaderBounds(
    'events-empty',
    'Eventos',
  )
  const today = await getHeaderBounds(
    'today',
    'Hoy',
  )

  expect(today.heading.x).toBe(events.heading.x)
  expect(today.heading.y).toBe(events.heading.y)
  expect(today.action.x).toBe(events.action.x)
  expect(today.action.y).toBe(events.action.y)
})

test('los selectores de evento mantienen estable el scroll al abrir opciones', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 864 })
  const event = { id: 21, type: 1, name: 'Boda Backend', date: '2099-12-31T23:59:59-05:00', location: 'Cali', contact: 'Laura 3001234567' }
  const task = { ...subtaskApiFixture, id: 31, event: 21, event_name: event.name, state: 'pending', target_date: '2099-12-21T04:59:59.000Z' }
  await page.route('**/events/21/', route => route.fulfill({ json: { success: true, data: event } }))
  await page.route('**/events/21/subtasks/', route => route.fulfill({ json: { success: true, data: [task] } }))
  await page.goto('/crear')
  // El Chromium de CI usa scrollbars superpuestas; emula los 15 px de una scrollbar clásica.
  await page.evaluate(() => Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    get: () => window.innerWidth - 15,
  }))

  const measure = async (trigger: import('@playwright/test').Locator) => trigger.evaluate(element => ({
    left: element.getBoundingClientRect().left,
    top: element.getBoundingClientRect().top,
    scrollY: window.scrollY,
    pageHeight: document.documentElement.scrollHeight,
    viewportWidth: document.documentElement.clientWidth,
    contentWidth: document.documentElement.scrollWidth,
    bodyOverflowY: getComputedStyle(document.body).overflowY,
  }))
  const createType = page.locator('#event-type')
  const createBefore = await measure(createType)
  await createType.click()
  await expect(page.getByRole('option', { name: 'Boda', exact: true })).toBeVisible()
  const createAfter = await measure(createType)
  expect(createAfter).toEqual(createBefore)
  expect(createAfter.bodyOverflowY).not.toBe('hidden')

  await page.goto('/evento/21')
  // La navegación descarta el getter; vuelve a simular la scrollbar clásica.
  await page.evaluate(() => Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    get: () => window.innerWidth - 15,
  }))
  await page.getByRole('button', { name: 'Editar evento', exact: true }).click()
  await page.getByRole('button', { name: `Editar ${task.name}`, exact: true }).click()
  const taskState = page.locator('#edit-event-task-state')
  await taskState.scrollIntoViewIfNeeded()
  const editBefore = await measure(taskState)
  await taskState.click()
  await expect(page.getByRole('option', { name: 'Completada', exact: true })).toBeVisible()
  const editAfter = await measure(taskState)
  expect(editAfter).toEqual(editBefore)
  expect(editAfter.bodyOverflowY).not.toBe('hidden')
  const scrollBeforeOutsideWheel = await page.evaluate(() => window.scrollY)
  await page.mouse.move(1450, 820)
  await page.mouse.wheel(0, 500)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollBeforeOutsideWheel)
})

test('la regla de prioridad responde al cursor y permanece sobre las tareas', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  })
  await page.goto(
    '/tests/visual/index.html?view=today',
  )

  await page
    .getByRole('button', {
      name: '¿Cómo funciona?',
    })
    .hover()

  const dialog = page.getByRole(
    'dialog',
    {
      name: 'Regla de prioridad',
    },
  )
  const taskAction = page
    .getByRole('button', {
      name: /Ver tarea:/,
    })
    .first()

  await expect(dialog).toBeVisible()

  const dialogBounds =
    await dialog.boundingBox()
  const actionBounds =
    await taskAction.boundingBox()

  expect(dialogBounds).not.toBeNull()
  expect(actionBounds).not.toBeNull()

  const overlap = {
    left: Math.max(
      dialogBounds!.x,
      actionBounds!.x,
    ),
    right: Math.min(
      dialogBounds!.x +
        dialogBounds!.width,
      actionBounds!.x +
        actionBounds!.width,
    ),
    top: Math.max(
      dialogBounds!.y,
      actionBounds!.y,
    ),
    bottom: Math.min(
      dialogBounds!.y +
        dialogBounds!.height,
      actionBounds!.y +
        actionBounds!.height,
    ),
  }

  expect(overlap.right).toBeGreaterThan(
    overlap.left,
  )
  expect(overlap.bottom).toBeGreaterThan(
    overlap.top,
  )

  const dialogId =
    await dialog.getAttribute('id')

  expect(dialogId).not.toBeNull()

  const dialogIsOnTop =
    await page.evaluate(
      ({ x, y, dialogId }) => {
        const topElement =
          document.elementFromPoint(
            x,
            y,
          )
        const dialogElement =
          document.getElementById(
            dialogId,
          )

        return Boolean(
          topElement &&
            dialogElement?.contains(
              topElement,
            ),
        )
      },
      {
        x:
          (overlap.left +
            overlap.right) /
          2,
        y:
          (overlap.top +
            overlap.bottom) /
          2,
        dialogId: dialogId!,
      },
    )

  expect(dialogIsOnTop).toBe(true)

  await page
    .getByRole('heading', {
      name: 'Hoy',
      exact: true,
    })
    .hover()

  await expect(dialog).toHaveCount(0)
})

for (const view of [
  'login',
  'signup',
  'events-empty',
  'events-error',
  'feedback',
  'feedback-success',
  'empty-tasks',
  'event-task',
  'today',
  'delete-dialog',
  'settings',
  'security',
]) {
  test(`${view} mantiene objetivos táctiles de 44 px en móvil`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    })
    await page.goto(
      `/tests/visual/index.html?view=${view}`,
    )

    if (view === 'delete-dialog') {
      const dialog = page.locator(
        '[data-slot="dialog-content"]',
      )

      await expect(dialog).toBeVisible()
      await dialog.evaluate(async (element) => {
        await Promise.all(
          element
            .getAnimations()
            .map(
              (animation) =>
                animation.finished,
            ),
        )
      })
    }

    const undersized = await page
      .locator('button')
      .evaluateAll((buttons) =>
        buttons
          .filter((button) => {
            const style = getComputedStyle(button)
            const rect = button.getBoundingClientRect()

            return (
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              rect.width > 0 &&
              rect.height > 0 &&
              (rect.width < 44 || rect.height < 44)
            )
          })
          .map((button) => ({
            label:
              button.getAttribute('aria-label') ??
              button.textContent?.trim(),
            width: button.getBoundingClientRect().width,
            height: button.getBoundingClientRect().height,
          })),
      )

    expect(undersized).toEqual([])
  })
}

test('el diálogo destructivo permanece dentro del viewport móvil', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 390,
    height: 640,
  })
  await page.goto(
    '/tests/visual/index.html?view=delete-dialog',
  )

  const bounds = await page
    .locator('[data-slot="dialog-content"]')
    .boundingBox()

  expect(bounds).not.toBeNull()
  expect(bounds!.x).toBeGreaterThanOrEqual(0)
  expect(bounds!.y).toBeGreaterThanOrEqual(0)
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(640)
})

for (const scenario of [
  { view: 'settings', button: 'Actualizar perfil', title: 'Actualizar perfil' },
  { view: 'settings', button: 'Administrar', title: 'Administrar correo' },
  { view: 'security', button: 'Establecer contraseña', title: 'Establecer contraseña' },
] as const) {
  test(`el formulario de cuenta ${scenario.title} admite teclado y scroll en móvil`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 640 })
    await page.goto(`/tests/visual/index.html?view=${scenario.view}`)
    await page.getByRole('button', { name: scenario.button, exact: true }).click()
    const dialog = page.getByRole('dialog', { name: scenario.title })
    await expect(dialog).toBeVisible()
    await dialog.evaluate(async (element) => {
      await Promise.all(element.getAnimations().map((animation) => animation.finished))
    })
    const bounds = await dialog.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.y).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(640)
    await expect(dialog.locator('input').first()).toBeFocused()
    if (scenario.title === 'Actualizar perfil') {
      await dialog.getByLabel('Nombre', { exact: true }).fill('')
      await dialog.getByRole('button', { name: 'Guardar perfil' }).click()
      await expect(dialog.getByLabel('Nombre', { exact: true })).toBeFocused()
      await expect(dialog.getByText('Ingresa tu nombre.')).toBeVisible()
    }
    if (scenario.title === 'Establecer contraseña') {
      await dialog.getByRole('button', { name: 'Guardar contraseña' }).click()
      await expect(dialog.getByLabel('Nueva contraseña', { exact: true })).toBeFocused()
      await expect(dialog.getByText('Ingresa una contraseña.')).toBeVisible()
    }
    await page.screenshot({ path: testInfo.outputPath(`${scenario.view}-dialog-mobile.png`), fullPage: true })
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(page.getByRole('button', { name: scenario.button, exact: true })).toBeFocused()
  })
}

test('la confirmación de eliminar cuenta cabe en móvil y permite cancelar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 })
  await page.goto('/tests/visual/index.html?view=security')
  await page.getByRole('button', { name: 'Eliminar cuenta', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '¿Eliminar tu cuenta?' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Eliminar definitivamente' })).toBeDisabled()
  await dialog.getByLabel('Escribe ELIMINAR para confirmar').fill('ELIMINAR')
  await expect(dialog.getByRole('button', { name: 'Eliminar definitivamente' })).toBeEnabled()
  await dialog.getByRole('button', { name: 'Conservar mi cuenta' }).click()
  await expect(dialog).toHaveCount(0)
})

for (const width of [390, 1440]) {
  test(`la eliminación de cuenta espera al backend y permite reintentar en ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    let attempts = 0
    await page.route(url => url.pathname === '/api/auth/me/', async route => {
      const request = route.request()
      expect(request.method()).toBe('DELETE')
      expect(request.headers().authorization).toBe('Bearer visual-audit-token')
      expect(request.headers()['x-account-deletion-confirmation']).toBe('ELIMINAR')
      expect(request.postData()).toBeNull()
      attempts += 1
      await route.fulfill(attempts === 1
        ? { status: 503, json: { success: false, message: 'No pudimos completar la eliminación.' } }
        : { status: 204 })
    })
    await page.goto('/tests/visual/index.html?view=security')
    await page.getByRole('button', { name: 'Eliminar cuenta', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: '¿Eliminar tu cuenta?' })
    await expect(dialog.getByText('Se eliminarán tu perfil y acceso en Clerk, además de tus eventos, tareas y preferencias de Eventger.')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Eliminar definitivamente' })).toBeDisabled()
    expect(attempts).toBe(0)
    await dialog.getByLabel('Escribe ELIMINAR para confirmar').fill('ELIMINAR')
    await dialog.getByRole('button', { name: 'Eliminar definitivamente' }).click()
    await expect(dialog.getByText('No pudimos eliminar tu cuenta. Inténtalo de nuevo.')).toBeVisible()
    await expect(page).toHaveURL(/view=security/)
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
    await dialog.getByRole('button', { name: 'Eliminar definitivamente' }).click()
    await expect(page).toHaveURL('http://127.0.0.1:4175/')
    expect(attempts).toBe(2)
  })
}

test('la tarjeta de tarea no duplica acciones de gestión', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  })
  await page.goto(
    '/tests/visual/index.html?view=event-task',
  )

  await expect(
    page.getByRole('button', {
      name: 'Editar',
    }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('button', {
      name: 'Eliminar',
    }),
  ).toHaveCount(0)
})

test('la revisión de acceso permite recorrer mensajes de correo y Google', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  })
  await page.goto(
    '/tests/visual/index.html?view=auth-feedback-review',
  )

  await page
    .getByRole('button', {
      name: /Sesión iniciada/,
    })
    .click()
  await expect(
    page.getByRole('dialog', {
      name: 'Sesión iniciada correctamente',
    }),
  ).toBeVisible()
  await page
    .getByRole('button', {
      name: 'Cerrar',
    })
    .click()

  await page
    .getByRole('button', {
      name: /Error de Google/,
    })
    .click()
  await expect(
    page.getByRole('alertdialog', {
      name: 'No pudimos iniciar sesión',
    }),
  ).toBeVisible()
  await page
    .getByRole('button', {
      name: 'Intentar de nuevo',
    })
    .click()

  await expect(
    page.getByText(
      'Acción ejecutada: Intentar de nuevo (Google)',
    ),
  ).toBeVisible()

  await page
    .getByRole('button', {
      name: /Cuenta no encontrada/,
    })
    .click()
  await page.keyboard.press('Escape')
  await expect(
    page.getByText(
      'Cerrado: Cuenta no encontrada',
    ),
  ).toBeVisible()
})

test('los estados de feedback comparten iconografía y escala', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  })

  const scenarios = [
    {
      view: 'events-error',
      variant: 'error',
    },
    {
      view: 'feedback',
      variant: 'error',
    },
    {
      view: 'feedback-success',
      variant: 'success',
    },
    {
      view: 'delete-dialog',
      variant: 'warning',
    },
  ] as const

  for (const scenario of scenarios) {
    await page.goto(
      `/tests/visual/index.html?view=${scenario.view}`,
    )

    const icon = page.locator(
      '[data-feedback-icon]',
    )

    await expect(icon).toHaveAttribute(
      'data-feedback-variant',
      scenario.variant,
    )

    if (scenario.view === 'delete-dialog') {
      await expect(page.locator('[data-slot="dialog-content"]')).toHaveCSS('animation-name', 'none')
      await expect(page.locator('[data-slot="dialog-overlay"]')).toHaveCSS('animation-name', 'none')
    }

    const bounds =
      await icon.boundingBox()

    expect(bounds).not.toBeNull()
    expect(bounds!.width).toBe(64)
    expect(bounds!.height).toBe(64)
  }
})

test('los formularios comparten el patrón accesible de error de campo', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 1024,
    height: 900,
  })

  for (const scenario of [
    {
      view: 'login',
      submit: 'Iniciar sesión',
      errors: 2,
    },
    {
      view: 'signup',
      submit: 'Crear cuenta',
      errors: 5,
    },
  ] as const) {
    await page.goto(
      `/tests/visual/index.html?view=${scenario.view}`,
    )
    await page
      .getByRole('button', {
        name: scenario.submit,
        exact: true,
      })
      .click()

    const invalidFields = page.locator(
      '[aria-invalid="true"]',
    )
    const fieldErrors = page.locator(
      '[role="alert"][id$="-error"]',
    )

    await expect(invalidFields).toHaveCount(
      scenario.errors,
    )
    await expect(fieldErrors).toHaveCount(
      scenario.errors,
    )

    const visualStyles =
      await fieldErrors.evaluateAll(
        (elements) =>
          elements.map((element) => {
            const style =
              getComputedStyle(element)

            return {
              color: style.color,
              fontSize: style.fontSize,
              lineHeight:
                style.lineHeight,
            }
          }),
      )

    expect(
      new Set(
        visualStyles.map(
          (style) =>
            JSON.stringify(style),
        ),
      ).size,
    ).toBe(1)

    const descriptionsResolve =
      await invalidFields.evaluateAll(
        (elements) =>
          elements.every(
            (element) => {
              const ids =
                element
                  .getAttribute(
                    'aria-describedby',
                  )
                  ?.split(/\s+/)
                  .filter(Boolean) ?? []

              return (
                ids.length > 0 &&
                ids.every((id) =>
                  Boolean(
                    document.getElementById(
                      id,
                    ),
                  ),
                )
              )
            },
          ),
      )

    expect(
      descriptionsResolve,
    ).toBe(true)
  }
})

const paginationEvents = Array.from({ length: 13 }, (_, index) => ({
  id: index + 21, type: 0, name: `Evento ${index + 1}`,
  date: '2099-12-31T23:59:59-05:00', location: 'Cali', contact: 'Contacto',
}))

function paginationResponse(requestedPage: number) {
  const page = Math.min(requestedPage, 3)
  return {
    success: true,
    data: paginationEvents.slice((page - 1) * 6, page * 6),
    pagination: { page, page_size: 6, total: 13, total_pages: 3 },
  }
}

for (const viewport of [
  { name: 'móvil pequeño', width: 320, height: 568 },
  { name: 'móvil', width: 390, height: 844 },
  { name: 'tableta', width: 768, height: 1024 },
  { name: 'escritorio', width: 1440, height: 900 },
]) {
  test(`paginación de eventos limita tarjetas y conserva navegación en ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    const requestedPages: number[] = []
    const requestedProgress: number[] = []
    await page.route(url => url.pathname === '/events/', async route => {
      const requestedPage = Number(new URL(route.request().url()).searchParams.get('page'))
      requestedPages.push(requestedPage)
      await route.fulfill({ json: paginationResponse(requestedPage) })
    })
    await page.route(/\/events\/\d+\/subtasks\/$/, route => {
      requestedProgress.push(Number(new URL(route.request().url()).pathname.split('/')[2]))
      return route.fulfill({ json: { success: true, data: [] } })
    })
    await page.route('**/events/27/', route => route.fulfill({ json: { success: true, data: paginationEvents[6] } }))
    await page.goto('/tests/visual/index.html?view=events-pagination')
    const main = page.locator('main')
    const list = main.getByRole('region', { name: 'Lista de eventos' })
    const nav = main.getByRole('navigation', { name: 'Paginación de eventos' })
    await expect(list.getByRole('link')).toHaveCount(6)
    await expect(main.getByText('Página 1 de 3', { exact: true })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    await expect.poll(() => requestedProgress.length).toBe(6)
    expect(requestedProgress).toEqual(paginationEvents.slice(0, 6).map(event => event.id))
    await page.evaluate(() => document.fonts.ready)
    const heading = main.getByRole('heading', { name: 'Eventos', exact: true })
    const baseline = await heading.boundingBox()

    await nav.getByRole('button', { name: 'Siguiente' }).click()
    await expect(main.getByText('Página 2 de 3', { exact: true })).toBeAttached()
    await expect(list.getByRole('link')).toHaveCount(6)
    await expect(list.getByRole('heading', { name: 'Evento 1', exact: true })).toHaveCount(0)
    await expect(page).toHaveURL(/page=2/)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    const secondHeading = await heading.boundingBox()
    expect(secondHeading!.x).toBeCloseTo(baseline!.x, 1)
    expect(secondHeading!.y).toBeCloseTo(baseline!.y, 1)
    await expect(main).toBeFocused()
    await page.screenshot({ path: testInfo.outputPath('eventos-pagina-2.png') })
    await nav.screenshot({ path: testInfo.outputPath('paginacion-eventos.png') })

    await nav.getByRole('button', { name: 'Siguiente' }).click()
    await expect(main.getByText('Página 3 de 3', { exact: true })).toBeAttached()
    await expect(list.getByRole('link')).toHaveCount(1)
    await expect(nav.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
    await expect(main.getByText('13–13 de 13 eventos', { exact: true })).toBeAttached()
    await nav.getByRole('button', { name: 'Anterior' }).click()
    await expect(main.getByText('Página 2 de 3', { exact: true })).toBeAttached()
    await list.getByRole('link', { name: /Evento 7 / }).click()
    await expect(main.getByRole('heading', { name: 'Evento 7', exact: true })).toBeVisible()
    await page.goBack()
    await expect(main.getByText('Página 2 de 3', { exact: true })).toBeAttached()
    await expect(list.getByRole('link')).toHaveCount(6)
    await expect(page).toHaveURL(/page=2/)
    expect(requestedPages).toEqual([1, 2, 3, 2, 2])
    const width = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(width.content).toBeLessThanOrEqual(width.viewport)
  })
}

test('paginación de eventos mantiene carga y reintento en la página solicitada', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  let attempts = 0
  let release = () => {}
  const pending = new Promise<void>(resolve => { release = resolve })
  await page.route(url => url.pathname === '/events/', async route => {
    const requestedPage = Number(new URL(route.request().url()).searchParams.get('page'))
    if (requestedPage === 2 && attempts++ === 0) {
      await pending
      return route.fulfill({ status: 503, json: { success: false, message: 'Servicio temporalmente no disponible.' } })
    }
    return route.fulfill({ json: paginationResponse(requestedPage) })
  })
  await page.route(/\/events\/\d+\/subtasks\/$/, route => route.fulfill({ json: { success: true, data: [] } }))
  await page.goto('/tests/visual/index.html?view=events-pagination')
  await expect(page.getByRole('region', { name: 'Lista de eventos' }).getByRole('link')).toHaveCount(6)
  await page.getByRole('button', { name: 'Siguiente' }).click()
  try {
    const loading = page.getByRole('status', { name: 'Cargando eventos' })
    await expect(loading).toBeVisible()
    await expect(page.getByRole('region', { name: 'Lista de eventos' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Aún no tienes eventos' })).toHaveCount(0)
    await page.screenshot({ path: testInfo.outputPath('eventos-carga-pagina-2.png') })
    release()
    await expect(page.getByRole('heading', { name: 'No pudimos cargar tus eventos' })).toBeVisible()
    await expect(page).toHaveURL(/page=2/)
    await page.getByRole('button', { name: 'Reintentar' }).click()
    await expect(page.getByText('Página 2 de 3', { exact: true })).toBeAttached()
    await expect(page.getByRole('region', { name: 'Lista de eventos' }).getByRole('link')).toHaveCount(6)
    expect(attempts).toBe(2)
  } finally { release() }
})

test('paginación de eventos abre un enlace a una página antigua sin mostrar un vacío falso', async ({ page }) => {
  await page.route(url => url.pathname === '/events/', route => route.fulfill({ json: paginationResponse(Number(new URL(route.request().url()).searchParams.get('page'))) }))
  await page.route(/\/events\/\d+\/subtasks\/$/, route => route.fulfill({ json: { success: true, data: [] } }))
  await page.goto('/tests/visual/index.html?view=events-pagination&page=99')
  await expect(page.getByText('Página 3 de 3', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Lista de eventos' }).getByRole('link')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
  await expect(page.getByRole('heading', { name: 'Aún no tienes eventos' })).toHaveCount(0)
})

for (const viewport of [
  { name: 'móvil pequeño', width: 320, height: 568 },
  { name: 'móvil', width: 390, height: 844 },
  { name: 'tableta', width: 768, height: 1024 },
  { name: 'escritorio estrecho', width: 1024, height: 768 },
  { name: 'escritorio', width: 1440, height: 900 },
  { name: 'escritorio de la captura', width: 1557, height: 768 },
]) {
  test(`filtro por tipo de evento integra paginación y vacíos en ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    const events = paginationEvents.map((event, index) => ({ ...event, type: index % 2 === 0 ? 1 : 2 }))
    const requests: { page: number; type: string | null }[] = []
    await page.route(url => url.pathname === '/events/', route => {
      const query = new URL(route.request().url()).searchParams
      const type = query.get('type')
      const filtered = type === null ? events : events.filter(event => event.type === Number(type))
      const requestedPage = Number(query.get('page'))
      const totalPages = Math.max(1, Math.ceil(filtered.length / 6))
      const currentPage = Math.min(requestedPage, totalPages)
      requests.push({ page: requestedPage, type })
      return route.fulfill({ json: {
        success: true, data: filtered.slice((currentPage - 1) * 6, currentPage * 6),
        pagination: { page: currentPage, page_size: 6, total: filtered.length, total_pages: totalPages },
      } })
    })
    await page.route(/\/events\/\d+\/subtasks\/$/, route => route.fulfill({ json: { success: true, data: [] } }))
    await page.route('**/events/33/', route => route.fulfill({ json: { success: true, data: events[12] } }))
    await page.goto('/tests/visual/index.html?view=events-pagination&page=2')
    const main = page.locator('main')
    const filter = main.getByRole('combobox', { name: 'Tipo de evento' })
    const list = main.getByRole('region', { name: 'Lista de eventos' })
    await expect(list.getByRole('link')).toHaveCount(6)
    await expect(filter).toBeEnabled()
    await page.evaluate(() => document.fonts.ready)
    const heading = main.getByRole('heading', { name: 'Eventos', exact: true })
    const baseline = await heading.boundingBox()

    await filter.click()
    const menu = page.getByRole('listbox')
    await expect(menu).toBeVisible()
    const triggerBox = await page.locator('#events-type-filter').boundingBox()
    const menuBox = await menu.boundingBox()
    if (viewport.height - triggerBox!.y - triggerBox!.height >= menuBox!.height + 24) {
      expect(menuBox!.y).toBeGreaterThanOrEqual(triggerBox!.y + triggerBox!.height)
    }
    expect(menuBox!.y).toBeGreaterThanOrEqual(16)
    expect(menuBox!.y + menuBox!.height).toBeLessThanOrEqual(viewport.height - 16)
    expect(menuBox!.x).toBeCloseTo(triggerBox!.x, 0)
    expect(menuBox!.width).toBeCloseTo(triggerBox!.width, 0)
    expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(viewport.width)
    expect((await main.locator('h1').boundingBox())!.x).toBeCloseTo(baseline!.x, 1)
    await page.screenshot({ path: testInfo.outputPath('menu-tipos-abierto.png') })
    await page.getByRole('option', { name: 'Boda', exact: true }).click()
    await expect(main.getByText('Página 1 de 2', { exact: true })).toBeAttached()
    await expect(list.getByRole('heading')).toHaveText(['Evento 1', 'Evento 3', 'Evento 5', 'Evento 7', 'Evento 9', 'Evento 11'])
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    expect(new URL(page.url()).searchParams.get('page')).toBeNull()
    expect(new URL(page.url()).searchParams.get('type')).toBe('1')
    const filteredHeading = await heading.boundingBox()
    expect(filteredHeading!.x).toBeCloseTo(baseline!.x, 1)
    expect(filteredHeading!.y).toBeCloseTo(baseline!.y, 1)
    await page.screenshot({ path: testInfo.outputPath('eventos-filtrados.png') })
    await page.getByRole('button', { name: 'Siguiente' }).click()
    await expect(main.getByText('Página 2 de 2', { exact: true })).toBeAttached()
    await expect(list.getByRole('link')).toHaveCount(1)
    await expect(list.getByRole('heading')).toHaveText(['Evento 13'])
    await expect(filter).toHaveText('Boda')
    await list.getByRole('link').click()
    await expect(main.getByRole('heading', { name: 'Evento 13', exact: true })).toBeVisible()
    await page.goBack()
    await expect(main.getByText('Página 2 de 2', { exact: true })).toBeAttached()
    await expect(filter).toHaveText('Boda')
    expect(new URL(page.url()).searchParams.get('type')).toBe('1')

    await filter.click()
    await page.getByRole('option', { name: 'Social', exact: true }).click()
    await expect(main.getByRole('status', { name: 'Resumen de eventos' })).toHaveText('6 eventos')
    await expect(list.getByRole('heading')).toHaveText(['Evento 2', 'Evento 4', 'Evento 6', 'Evento 8', 'Evento 10', 'Evento 12'])
    await filter.click()
    await page.getByRole('option', { name: 'Corporativo', exact: true }).click()
    await expect(main.getByRole('heading', { name: 'No hay eventos de este tipo', exact: true })).toBeVisible()
    await expect(main.getByRole('heading', { name: 'Aún no tienes eventos' })).toHaveCount(0)
    await expect(main.getByRole('navigation', { name: 'Paginación de eventos' })).toHaveCount(0)
    await main.getByRole('button', { name: 'Ver todos los eventos' }).click()
    await expect(main.getByText('Página 1 de 3', { exact: true })).toBeAttached()
    await expect(list.getByRole('link')).toHaveCount(6)
    await expect(filter).toHaveText('Todos los tipos')
    expect(new URL(page.url()).searchParams.get('type')).toBeNull()
    expect(requests).toContainEqual({ page: 2, type: '1' })
    expect(requests).toContainEqual({ page: 1, type: '2' })
    expect(requests).toContainEqual({ page: 1, type: null })
    const width = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(width.content).toBeLessThanOrEqual(width.viewport)
  })
}

test('filtro por tipo de evento conserva las tarjetas si falla el catálogo y permite reintentar', async ({ page }) => {
  let failCatalog = true
  await page.route('**/event-types/', route => failCatalog
    ? route.fulfill({ status: 503, json: { success: false, message: 'Tipos no disponibles.' } })
    : route.fulfill({ json: { success: true, data: [{ id: 1, name: 'Boda', description: '' }] } }))
  await page.route(url => url.pathname === '/events/', route => route.fulfill({ json: paginationResponse(1) }))
  await page.route(/\/events\/\d+\/subtasks\/$/, route => route.fulfill({ json: { success: true, data: [] } }))
  await page.goto('/tests/visual/index.html?view=events-pagination')
  await expect(page.getByRole('region', { name: 'Lista de eventos' }).getByRole('link')).toHaveCount(6)
  await expect(page.getByRole('alert')).toContainText('No pudimos cargar los tipos de evento.')
  failCatalog = false
  await page.getByRole('button', { name: 'Reintentar tipos' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await page.getByRole('combobox', { name: 'Tipo de evento' }).click()
  await expect(page.getByRole('option', { name: 'Boda', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
})

test('filtro por tipo de evento mantiene carga al cambiar de tipo en la misma página', async ({ page }) => {
  let release = () => {}
  const pending = new Promise<void>(resolve => { release = resolve })
  await page.route(url => url.pathname === '/events/', async route => {
    const type = new URL(route.request().url()).searchParams.get('type')
    if (type === '2') {
      await pending
      return route.fulfill({ json: { success: true, data: [], pagination: { page: 1, page_size: 6, total: 0, total_pages: 1 } } })
    }
    return route.fulfill({ json: paginationResponse(1) })
  })
  await page.route(/\/events\/\d+\/subtasks\/$/, route => route.fulfill({ json: { success: true, data: [] } }))
  await page.goto('/tests/visual/index.html?view=events-pagination')
  await expect(page.getByRole('region', { name: 'Lista de eventos' }).getByRole('link')).toHaveCount(6)
  await page.getByRole('combobox', { name: 'Tipo de evento' }).click()
  await page.getByRole('option', { name: 'Social', exact: true }).click()
  try {
    await expect(page.getByRole('status', { name: 'Cargando eventos' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Lista de eventos' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'No hay eventos de este tipo' })).toHaveCount(0)
    release()
    await expect(page.getByRole('heading', { name: 'No hay eventos de este tipo' })).toBeVisible()
  } finally { release() }
})

for (const viewport of [
  { name: 'móvil', width: 390, height: 844 },
  { name: 'tableta', width: 768, height: 1024 },
  { name: 'escritorio estrecho', width: 1024, height: 768 },
  { name: 'escritorio de la captura', width: 1557, height: 768 },
]) {
  test(`menús de Hoy mantienen estilo, tamaño y teclado con muchos eventos en ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    const tasks = Array.from({ length: 40 }, (_, index) => ({
      id: index + 200,
      event: index + 100,
      event_name: `Congreso internacional de innovación y desarrollo empresarial en Bogotá ${String(index + 1).padStart(2, '0')}`,
      name: `Seguimiento ${index + 1}`,
      target_date: '2099-12-31T18:00:00-05:00',
      estimated_hours: '1.00',
      state: 'pending',
      details: '',
    }))
    await page.route('**/hoy/', route => route.fulfill({ json: {
      success: true, data: { overdue: [], today: tasks, upcoming: [], completed: [] },
    } }))
    await page.goto('/tests/visual/index.html?view=today-navigation')
    const eventFilter = page.getByRole('combobox', { name: 'Evento', exact: true })
    const stateFilter = page.getByRole('combobox', { name: 'Estado', exact: true })
    await expect(eventFilter).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await eventFilter.focus()
    await page.keyboard.press('ArrowDown')
    const menu = page.getByRole('listbox')
    await expect(menu).toBeVisible()
    const triggerBox = await page.locator('#today-event-filter').boundingBox()
    const menuBox = await menu.boundingBox()
    expect(triggerBox!.height).toBe(44)
    expect(menuBox!.width).toBeCloseTo(triggerBox!.width, 0)
    expect(menuBox!.x).toBeGreaterThanOrEqual(16)
    expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(viewport.width - 16)
    expect(menuBox!.height).toBeLessThanOrEqual(352)
    expect(menuBox!.y).toBeGreaterThanOrEqual(16)
    expect(menuBox!.y + menuBox!.height).toBeLessThanOrEqual(viewport.height - 16)
    expect(await menu.evaluate(element => getComputedStyle(element).borderRadius)).toBe('8px')
    expect((await page.getByRole('option', { name: 'Todos los eventos', exact: true }).boundingBox())!.height).toBeGreaterThanOrEqual(44)
    await page.screenshot({ path: testInfo.outputPath('menu-hoy-abierto.png') })
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await expect(eventFilter).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('option', { name: 'Todos los eventos', exact: true })).toBeFocused()
    await page.keyboard.press('End')
    await expect(page.getByRole('option', { name: tasks[39].event_name, exact: true })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(eventFilter).toHaveText(tasks[39].event_name)
    expect((await eventFilter.boundingBox())!.height).toBe(44)
    await expect(page.getByRole('button', { name: /^Ver tarea:/ })).toHaveCount(1)
    await expect(page.getByRole('button', { name: 'Ver tarea: Seguimiento 40', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).click()
    await expect(eventFilter).toHaveText('Todos los eventos')
    await stateFilter.focus()
    await page.keyboard.press('Space')
    await expect(page.getByRole('listbox')).toBeVisible()
    await expect(page.getByRole('option', { name: 'Todos', exact: true })).toBeFocused()
    await page.keyboard.press('End')
    await expect(page.getByRole('option', { name: 'Vencidas', exact: true })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(stateFilter).toHaveText('Vencidas')
    await expect(page.getByRole('button', { name: /^Ver tarea:/ })).toHaveCount(0)
    await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).last().click()
    await expect(stateFilter).toHaveText('Todos')
    await expect(page.getByRole('button', { name: /^Ver tarea:/ })).toHaveCount(40)
    const width = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(width.content).toBeLessThanOrEqual(width.viewport)
  })
}

for (const viewport of [
  { name: 'móvil pequeño', width: 320, height: 568 },
  { name: 'móvil', width: 390, height: 844 },
  { name: 'tableta', width: 768, height: 1024 },
  { name: 'escritorio', width: 1440, height: 900 },
  { name: 'escritorio amplio', width: 1920, height: 1080 },
]) {
  test(`filas de tareas mantienen columnas con estados distintos en ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    const event = { ...paginationEvents[0], name: 'Evento con tareas mixtas' }
    const tasks = [
      { id: 51, state: 'pending', name: 'Confirmar proveedores' },
      { id: 52, state: 'completed', name: 'Definir concepto creativo' },
      { id: 53, state: 'in_progress', name: 'Solicitar propuestas de producción' },
      { id: 54, state: 'pending', name: 'Seleccionar maestro de ceremonias' },
      { id: 55, state: 'completed', name: 'Preparar kit de prensa y documentación con nombres largos sin espacios InvitadosInternacionalesInvitadosInternacionalesInvitadosInternacionales' },
    ].map((task, index) => ({ ...task, event: 21, target_date: `2099-12-${20 + index}T23:59:59-05:00`, estimated_hours: '5.00', details: '' }))
    await page.route('**/hoy/', route => route.fulfill({ json: { success: true, data: { overdue: [], today: [], upcoming: [], completed: [] } } }))
    await page.route(url => url.pathname === '/events/', route => route.fulfill({ json: { success: true, data: [event], pagination: { page: 1, page_size: 6, total: 1, total_pages: 1 } } }))
    await page.route('**/events/21/', route => route.fulfill({ json: { success: true, data: event } }))
    await page.route('**/events/21/subtasks/', route => route.fulfill({ json: { success: true, data: tasks } }))
    await page.route(/\/subtasks\/\d+\/reschedule-preview\/$/, route => {
      const input = route.request().postDataJSON()
      return route.fulfill({ json: { success: true, data: { ...dayPlan(input.target_date, Number(input.estimated_hours)), event_date: '2099-12-31' } } })
    })
    await page.goto('/tests/visual/index.html?view=layout-navigation')
    if (viewport.width < 1280) await page.getByRole('button', { name: 'Abrir menú' }).click()
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Eventos', exact: true }).click()
    await page.getByRole('region', { name: 'Lista de eventos' }).getByRole('link').click()
    await page.getByRole('button', { name: 'Editar evento', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Tareas agregadas (5)', exact: true })).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    const editButtons = tasks.map(task => page.getByRole('button', { name: `Editar ${task.name}`, exact: true }))
    const rows = tasks.map((_, index) => page.getByRole('list', { name: 'Tareas agregadas', exact: true }).getByRole('listitem').nth(index))
    const dateX: number[] = []
    const hoursX: number[] = []
    const editX: number[] = []
    const deleteX: number[] = []
    for (let index = 0; index < tasks.length; index++) {
      const task = tasks[index]
      const row = rows[index]
      const date = row.getByText(`${20 + index}/12/2099`, { exact: true })
      const hours = row.getByText('5 h', { exact: true })
      if (viewport.width >= 768) {
        dateX.push((await date.boundingBox())!.x)
        hoursX.push((await hours.boundingBox())!.x)
      }
      const edit = await editButtons[index].boundingBox()
      const remove = await page.getByRole('button', { name: `Eliminar ${task.name}`, exact: true }).boundingBox()
      editX.push(edit!.x)
      deleteX.push(remove!.x)
      expect(edit!.width).toBeGreaterThanOrEqual(44)
      expect(edit!.height).toBeGreaterThanOrEqual(44)
      expect(remove!.width).toBeGreaterThanOrEqual(44)
      const reschedule = page.getByRole('button', { name: `Reprogramar ${task.name}`, exact: true })
      await expect(reschedule).toHaveCount(task.state === 'completed' ? 0 : 1)
    }
    for (const positions of [dateX, hoursX, editX, deleteX]) {
      if (positions.length) expect(Math.max(...positions) - Math.min(...positions)).toBeLessThanOrEqual(1)
    }
    const width = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(width.content).toBeLessThanOrEqual(width.viewport)
    await page.getByRole('heading', { name: 'Tareas agregadas (5)' }).scrollIntoViewIfNeeded()
    await page.getByRole('list', { name: 'Tareas agregadas', exact: true }).screenshot({ path: testInfo.outputPath('filas-de-tareas.png') })
    await page.getByRole('button', { name: `Reprogramar ${tasks[0].name}`, exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: 'Cancelar', exact: true }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
}

for (const viewport of [
  { name: 'móvil pequeño', width: 320, height: 568 },
  { name: 'móvil', width: 390, height: 844 },
  { name: 'tableta', width: 768, height: 1024 },
  { name: 'escritorio', width: 1440, height: 900 },
]) {
  test(`resumen de eventos evita paginación innecesaria en ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.route(url => url.pathname === '/events/', route => route.fulfill({ json: {
      success: true, data: paginationEvents.slice(0, 5),
      pagination: { page: 1, page_size: 6, total: 5, total_pages: 1 },
    } }))
    await page.route(/\/events\/\d+\/subtasks\/$/, route => route.fulfill({ json: { success: true, data: [] } }))
    await page.goto('/tests/visual/index.html?view=events-pagination')
    const summary = page.getByRole('status', { name: 'Resumen de eventos' })
    await expect(page.getByRole('region', { name: 'Lista de eventos' }).getByRole('link')).toHaveCount(5)
    await expect(summary).toHaveText('5 eventos')
    await expect(page.getByRole('navigation', { name: 'Paginación de eventos' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Anterior', exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Siguiente', exact: true })).toHaveCount(0)
    await expect(page.getByText('Página 1 de 1', { exact: true })).toHaveCount(0)
    await summary.scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath('resumen-eventos.png') })
    const width = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(width.content).toBeLessThanOrEqual(width.viewport)
  })
}

test.describe('sugerencias de direcciones', () => {
  test.use({ hasTouch: true })

  for (const viewport of [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop-compact', width: 1024, height: 768 },
    { name: 'laptop', width: 1366, height: 768 },
    { name: 'reference', width: 1440, height: 900 },
    { name: 'wide', width: 1920, height: 1080 },
  ]) {
    test(`el campo Lugar permite seleccionar direcciones sin overflow en ${viewport.name}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport)
      await page.route(url => url.origin === 'https://photon.komoot.io', route => route.fulfill({ json: addressApiFixture }))
      await page.route(url => url.pathname === '/events/', route => route.fulfill({ json: { success: true, data: [] } }))
      await page.goto('/tests/visual/index.html?view=events-pagination')
      await expect(page.getByRole('heading', { name: 'Aún no tienes eventos' })).toBeVisible()
      await page.getByRole('button', { name: 'Crear evento', exact: true }).first().click()

      const input = page.getByRole('combobox', { name: 'Lugar *', exact: true })
      await input.fill('Chipichape Cali')
      const option = page.getByRole('option', { name: /Centro Comercial Chipichape/ })
      await expect(option).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      const menu = page.getByRole('listbox', { name: 'Direcciones sugeridas' })
      const bounds = await menu.boundingBox()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width)
      expect(bounds!.y).toBeGreaterThanOrEqual(0)
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height)
      await page.screenshot({ path: testInfo.outputPath(`direcciones-${viewport.name}.png`) })

      if (viewport.width < 768) await option.tap()
      else await input.press('ArrowDown').then(() => input.press('Enter'))
      await expect(input).toHaveValue(addressFixture.address)
      await expect(menu).toHaveCount(0)
      await expect(input).toBeFocused()
      const width = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
      expect(width.content).toBeLessThanOrEqual(width.viewport)

      await input.fill('Chipichape')
      await expect(option).toBeVisible()
      await input.press('Escape')
      await expect(menu).toHaveCount(0)
      await expect(input).toHaveValue('Chipichape')
    })
  }
})

for (const width of [320, 768, 1440]) {
  test(`auditoría UX conserva tareas y muestra validaciones en ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 })
    await page.route('**/hoy/', route => route.fulfill({ json: { success: true, data: { overdue: [], today: [], upcoming: [], completed: [] } } }))
    await page.route('**/event-types/', route => route.fulfill({ json: { success: true, data: [{ id: 0, name: 'Boda', description: '' }] } }))
    await page.goto('/tests/visual/index.html?view=layout-navigation')
    await page.getByRole('button', { name: 'Crear evento', exact: true }).click()
    await page.getByRole('button', { name: 'Crear evento', exact: true }).click()
    await expect(page.getByLabel('Nombre del evento *', { exact: true })).toBeFocused()
    await expect(page.getByLabel('Contacto *', { exact: true })).toHaveAttribute('aria-invalid', 'true')
    await page.getByLabel('Nombre del evento *', { exact: true }).fill('Evento de auditoría')
    await page.getByRole('combobox', { name: 'Tipo de evento *', exact: true }).click()
    await page.getByRole('option', { name: 'Boda', exact: true }).click()
    await page.getByLabel('Fecha del evento *', { exact: true }).fill('2099-12-31')
    await page.getByLabel('Lugar *', { exact: true }).fill('Cali')
    await page.getByLabel('Contacto *', { exact: true }).fill('Ana 3001234567')
    const name = 'Confirmar proveedores internacionales y coordinar transporte de invitados'
    await page.getByLabel('Nombre de la tarea *', { exact: true }).fill(name)
    await page.getByRole('button', { name: 'Crear evento', exact: true }).click()
    await expect(page.getByLabel('Nombre de la tarea *', { exact: true })).toBeFocused()
    await expect(page.getByText('Tienes una tarea sin agregar o guardar. Agrégala, guárdala o limpia sus campos antes de continuar.')).toBeVisible()
    await page.getByLabel('Fecha límite *', { exact: true }).fill('2099-12-20')
    await page.getByLabel('Tiempo estimado *', { exact: true }).fill('2.5')
    await page.getByRole('button', { name: 'Agregar tarea', exact: true }).click()
    await expect(page.getByText('20/12/2099', { exact: true })).toBeVisible()
    await expect(page.getByText('2.5 h', { exact: true })).toBeVisible()
    for (const action of ['Editar', 'Eliminar']) {
      const button = page.getByRole('button', { name: `${action} ${name}`, exact: true })
      const box = await button.boundingBox()
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
    await page.screenshot({ path: testInfo.outputPath('crear-tarea-visible.png'), fullPage: true })
    await page.getByLabel('Fecha del evento *', { exact: true }).fill('2099-12-01')
    await page.getByRole('button', { name: 'Crear evento', exact: true }).click()
    await expect(page.getByLabel('Fecha del evento *', { exact: true })).toBeFocused()
    await expect(page.getByText('Hay tareas con fecha posterior al evento. Ajusta sus fechas o la fecha del evento.')).toBeVisible()
  })
}

for (const width of [390, 1440]) {
  for (const filtered of [false, true]) {
    test(`estados vacíos distinguen fallo y respuesta sin paginación en ${width}px con filtro=${filtered}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      let failed = true
      await page.route(url => url.pathname === '/events/', route => failed
        ? route.fulfill({ status: 503, json: { success: false } })
        : route.fulfill({ json: { success: true, data: [] } }))
      await page.goto(`/tests/visual/index.html?view=events-pagination${filtered ? '&type=1' : ''}`)
      await expect(page.getByRole('heading', { name: 'No pudimos cargar tus eventos' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Aún no tienes eventos' })).toHaveCount(0)
      await expect(page.getByRole('heading', { name: 'No hay eventos de este tipo' })).toHaveCount(0)
      failed = false
      await page.getByRole('button', { name: 'Reintentar', exact: true }).click()
      await expect(page.getByRole('heading', { name: filtered ? 'No hay eventos de este tipo' : 'Aún no tienes eventos' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'No pudimos cargar tus eventos' })).toHaveCount(0)
      const filter = page.getByRole('combobox', { name: 'Tipo de evento', exact: true })
      await expect(filter).toHaveCount(filtered ? 1 : 0)
      if (filtered) {
        await page.getByRole('button', { name: 'Ver todos los eventos' }).click()
        await expect(page.getByRole('heading', { name: 'Aún no tienes eventos' })).toBeVisible()
        await expect(filter).toHaveCount(0)
        await expect(page).not.toHaveURL(/type=/)
      }
      await expect(page.getByRole('navigation', { name: 'Paginación de eventos' })).toHaveCount(0)
      const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
      expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
    })
  }
}
