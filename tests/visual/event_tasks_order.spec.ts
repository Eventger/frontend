import { test, expect } from '@playwright/test'

const viewports = [320, 375, 768, 1280]

const mockTasks = [
  {
    id: 1,
    event: 21,
    name: 'Instalar decoración',
    target_date: '2026-10-30T23:59:59-05:00',
    estimated_hours: '4.00',
    state: 'pending',
    details: 'Luces y flores',
  },
  {
    id: 2,
    event: 21,
    name: 'Comprar materiales',
    target_date: '2026-10-25T23:59:59-05:00',
    estimated_hours: '2.00',
    state: 'pending',
    details: '',
  },
  {
    id: 3,
    event: 21,
    name: 'Preparar centros de mesa',
    target_date: '2026-10-27T23:59:59-05:00',
    estimated_hours: '3.00',
    state: 'pending',
    details: '',
  },
  {
    id: 4,
    event: 21,
    name: 'Confirmar sonido',
    target_date: '2026-10-15T23:59:59-05:00', // Vencida
    estimated_hours: '1.50',
    state: 'pending',
    details: 'Micrófonos y cabina',
  },
  {
    id: 5,
    event: 21,
    name: 'Tarea completada anterior',
    target_date: '2026-10-10T23:59:59-05:00', // Completada
    estimated_hours: '2.00',
    state: 'completed',
    details: '',
  },
  {
    id: 6,
    event: 21,
    name: 'Plan de contingencia',
    target_date: '2026-10-20T23:59:59-05:00', // Conserva la última fecha al posponer
    estimated_hours: '1.00',
    state: 'postponed',
    details: 'Por si llueve',
  },
]

for (const width of viewports) {
  test(`detalle de evento en ${width}px presenta tareas en orden cronológico ascendente`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 850 })

    await page.route('**/events/21/', route => route.fulfill({
      json: {
        success: true,
        data: {
          id: 21,
          user: 1,
          name: 'Celebración Aniversario',
          type: 1,
          event_type_name: 'Social',
          date: '2026-11-15T18:00:00-05:00',
          location: 'Hacienda Real',
          contact: 'contacto@eventger.test',
          created_at: '2026-10-01T12:00:00.000Z',
          updated_at: '2026-10-01T12:00:00.000Z',
        },
      },
    }))

    await page.route('**/events/21/subtasks/', route => route.fulfill({
      json: {
        success: true,
        data: mockTasks,
      },
    }))

    await page.route(url => url.pathname === '/events/', route => route.fulfill({ json: {
      success: true,
      data: [{ id: 21, type: 1, name: 'Celebración Aniversario', date: '2026-11-15T18:00:00-05:00', location: 'Hacienda Real', contact: 'contacto@eventger.test' }],
      pagination: { page: 1, page_size: 6, total: 1, total_pages: 1 },
    } }))
    await page.route('**/event-types/', route => route.fulfill({ json: { success: true, data: [{ id: 1, name: 'Social', description: '' }] } }))
    await page.goto('/tests/visual/index.html?view=layout-navigation')
    if (width < 1280) await page.getByRole('button', { name: 'Abrir menú' }).click()
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Eventos', exact: true }).click()
    await page.getByRole('link', { name: /Celebración Aniversario/ }).click()

    // Verificar que la región de tareas existe
    const taskList = page.getByRole('region', { name: 'Lista de tareas del evento' })
    await expect(taskList).toBeVisible()

    // Extraer títulos de las tareas en el orden real que aparecen en el DOM
    const taskTitles = await taskList.locator('h3').allTextContents()

    // 1. Verificar orden cronológico ascendente:
    // Primero: Confirmar sonido (15 oct - Vencida)
    // Segundo: Comprar materiales (25 oct)
    // Tercero: Preparar centros de mesa (27 oct)
    // Cuarto: Instalar decoración (30 oct)
    // Quinto: Plan de contingencia (pospuesta, sin fecha operativa)
    // Sexto: Tarea completada anterior (completada, al final!)
    expect(taskTitles).toEqual([
      'Confirmar sonido',
      'Comprar materiales',
      'Preparar centros de mesa',
      'Instalar decoración',
      'Plan de contingencia',
      'Tarea completada anterior',
    ])

    // 2. Verificar que la tarea vencida se identifica de inmediato (CA-02, CA-07)
    const overdueBadge = page.locator('#task-4').getByText('Vencida', { exact: true })
    await expect(overdueBadge).toBeVisible()

    // 3. Verificar que la tarea completada tiene su badge
    const completedBadge = page.locator('#task-5').getByText('Completada', { exact: true })
    await expect(completedBadge).toBeVisible()

    // 4. Verificar avance y acciones disponibles para tareas pendientes.
    const advanceBtn = page.getByRole('button', { name: 'Registrar avance de Confirmar sonido' })
    await expect(advanceBtn).toBeVisible()
    await page.getByRole('button', { name: 'Más acciones para Confirmar sonido' }).click()
    await expect(page.getByRole('menuitem', { name: 'Reprogramar Confirmar sonido' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Editar evento' })).toBeVisible()

    // 5. Una tarea completada permite corregir su estado, pero no reprogramarla.
    const completedAdvance = page.getByRole('button', { name: 'Registrar avance de Tarea completada anterior' })
    await expect(completedAdvance).toBeVisible()
    await page.getByRole('button', { name: 'Más acciones para Tarea completada anterior' }).click()
    await expect(page.getByRole('menuitem', { name: 'Reprogramar Tarea completada anterior' })).toHaveCount(0)
    await page.keyboard.press('Escape')

    // 6. Verificar que no hay desbordamiento horizontal en la página
    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(horizontalOverflow).toBeLessThanOrEqual(1)

    // Capturar screenshot para evidencia visual
    await page.screenshot({ path: testInfo.outputPath(`event_detail_tasks_${width}.png`), fullPage: true })
  })
}

test('abrir y verificar la edición de una tarea desde el evento', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 850 })

  await page.route('**/events/21/', route => route.fulfill({
    json: {
      success: true,
      data: {
        id: 21,
        user: 1,
        name: 'Celebración Aniversario',
        type: 1,
        event_type_name: 'Social',
        date: '2026-11-15T18:00:00-05:00',
        location: 'Hacienda Real',
        contact: 'contacto@eventger.test',
        created_at: '2026-10-01T12:00:00.000Z',
        updated_at: '2026-10-01T12:00:00.000Z',
      },
    },
  }))

  await page.route('**/events/21/subtasks/', route => route.fulfill({
    json: {
      success: true,
      data: mockTasks,
    },
  }))

  await page.route(url => url.pathname === '/events/', route => route.fulfill({ json: {
    success: true,
    data: [{ id: 21, type: 1, name: 'Celebración Aniversario', date: '2026-11-15T18:00:00-05:00', location: 'Hacienda Real', contact: 'contacto@eventger.test' }],
    pagination: { page: 1, page_size: 6, total: 1, total_pages: 1 },
  } }))
  await page.route('**/event-types/', route => route.fulfill({ json: { success: true, data: [{ id: 1, name: 'Social', description: '' }] } }))
  await page.goto('/tests/visual/index.html?view=layout-navigation')
  await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Eventos', exact: true }).click()
  await page.getByRole('link', { name: /Celebración Aniversario/ }).click()

  await page.getByRole('button', { name: 'Editar evento' }).click()
  await page.getByRole('button', { name: 'Editar Comprar materiales' }).click()

  const dialogTitle = page.getByRole('heading', { name: 'Editar tarea' })
  await expect(dialogTitle).toBeVisible()

  const nameInput = page.getByLabel('Nombre de la tarea *')
  await expect(nameInput).toHaveValue('Comprar materiales')

  const dateInput = page.getByLabel('Fecha límite *')
  await expect(dateInput).toHaveValue('25/10/2026')

  const stateSelect = page.getByLabel('Estado de la tarea')
  await expect(stateSelect).toBeVisible()

  await page.screenshot({ path: testInfo.outputPath('event_task_edit_dialog.png') })
})
