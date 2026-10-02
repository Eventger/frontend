import {
  expect,
  test,
} from '@playwright/test'

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
