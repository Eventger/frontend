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
  'empty-tasks',
  'event-task',
  'today',
  'delete-dialog',
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

for (const view of [
  'login',
  'signup',
  'events-empty',
  'events-error',
  'feedback',
  'empty-tasks',
  'event-task',
  'today',
  'delete-dialog',
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

test('las acciones de tarea aparecen al recibir foco por teclado', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  })
  await page.goto(
    '/tests/visual/index.html?view=event-task',
  )

  const editButton = page.getByRole('button', {
    name: 'Editar',
  })
  await editButton.focus()
  await expect(editButton).toBeVisible()
  await expect(editButton).toBeFocused()
})
