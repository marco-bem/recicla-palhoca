import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 360, height: 740 },
  { width: 390, height: 844 },
  { width: 430, height: 900 },
  { width: 768, height: 1024 },
  { width: 1280, height: 900 },
];

const MATERIALS = [
  { id: 5, name: 'Papel', slug: 'papel', description: null },
  { id: 6, name: 'Papelão', slug: 'papelao', description: null },
  { id: 7, name: 'Plásticos', slug: 'plasticos', description: null },
  { id: 8, name: 'Vidro', slug: 'vidro', description: null },
  { id: 9, name: 'Metais', slug: 'metais', description: null },
];

const CENTER = {
  id: 42,
  name: 'Centro de Teste Playwright',
  publicPhone: '4833330000',
  address: {
    postalCode: '88130000',
    street: 'Rua de Teste',
    streetNumber: '100',
    complement: 'Cadastro de validação',
    neighborhood: 'Centro',
    city: 'Palhoça',
    state: 'SC',
  },
  coordinates: {
    latitude: -27.645,
    longitude: -48.669,
  },
  services: {
    acceptsDropoff: true,
    offersPickup: true,
  },
  isActive: true,
  openingHours: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
    dayOfWeek,
    periodNumber: 1,
    opensAt: '09:00:00',
    closesAt: '17:00:00',
  })),
  materials: MATERIALS.map(({ id, name, slug }) => ({ id, name, slug })),
};

const ROUTES = [
  {
    name: 'home',
    path: '/',
    expectedText: 'Explore por material',
  },
  {
    name: 'centros',
    path: '/centers',
    expectedText: 'Centros próximos',
  },
  {
    name: 'localizacao',
    path: '/location',
    expectedText: 'Encontre centros próximos de você',
  },
  {
    name: 'detalhes',
    path: '/center/42',
    expectedText: CENTER.name,
  },
];

async function mockApi(page: Page) {
  await page.route('**/materials', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MATERIALS }),
    }),
  );

  await page.route('**/centers**', (route) => {
    const { pathname } = new URL(route.request().url());
    const data = pathname.includes('/centers/')
      ? CENTER
      : [CENTER];

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data }),
    });
  });
}

async function assertNoHorizontalOverflow(page: Page, width: number) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));

  const renderedWidth = Math.max(metrics.document, metrics.body);
  expect(
    renderedWidth,
    `Largura renderizada (${renderedWidth}px) excede o viewport (${width}px).`,
  ).toBeLessThanOrEqual(width + 1);
}

test.describe('Auditoria responsiva das quatro telas', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.width} × ${viewport.height} px — capturar e verificar as quatro rotas`, async ({
      page,
    }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.setViewportSize(viewport);
      await mockApi(page);
      await mkdir(join('test-results', 'responsive'), { recursive: true });

      for (const route of ROUTES) {
        await test.step(`${route.name}: ${route.path}`, async () => {
          await page.goto(route.path, { waitUntil: 'domcontentloaded' });
          await expect(page.getByText(route.expectedText, { exact: true }).first()).toBeVisible();

          await assertNoHorizontalOverflow(page, viewport.width);

          await page.screenshot({
            path: join(
              'test-results',
              'responsive',
              `${viewport.width}x${viewport.height}-${route.name}.png`,
            ),
            fullPage: true,
            animations: 'disabled',
          });
        });
      }

      expect(pageErrors, 'A aplicação apresentou erros JavaScript no navegador.').toEqual([]);
    });
  }
});
