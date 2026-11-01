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
    captureScrollEnd: true,
  },
  {
    name: 'centros',
    path: '/centers',
    expectedText: /^Centros (?:próximos|disponíveis)$/,
    loadedText: CENTER.name,
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
    captureScrollEnd: true,
  },
];

async function mockApi(page: Page) {
  await page.route('**/materials', (route) => {
    if (route.request().resourceType() !== 'fetch') {
      return route.continue();
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MATERIALS }),
    });
  });

  await page.route('**/centers**', (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const isCentersEndpoint =
      pathname === '/centers' || pathname.startsWith('/centers/');

    if (request.resourceType() !== 'fetch' || !isCentersEndpoint) {
      return route.continue();
    }

    const data = pathname === '/centers' ? [CENTER] : CENTER;

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data }),
    });
  });
}

async function captureVerticalScrollEnd(
  page: Page,
  viewport: { width: number; height: number },
  routeName: string,
) {
  const scrollState = await page.evaluate(() => {
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>('body *'),
    )
      .filter((element) => {
        const style = window.getComputedStyle(element);
        return (
          (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
          element.clientHeight > 0 &&
          element.scrollHeight > element.clientHeight + 1
        );
      })
      .sort(
        (left, right) =>
          right.scrollHeight - right.clientHeight -
          (left.scrollHeight - left.clientHeight),
      );

    const target = candidates[0];
    if (!target) return null;

    target.setAttribute('data-playwright-scroll-target', 'true');
    target.scrollTop = target.scrollHeight;

    return {
      scrollTop: target.scrollTop,
      maxScrollTop: target.scrollHeight - target.clientHeight,
    };
  });

  if (!scrollState) {
    if (viewport.width <= 360) {
      throw new Error(
        `${routeName}: não foi encontrado um contêiner vertical rolável na largura de ${viewport.width}px.`,
      );
    }
    return;
  }

  expect(
    scrollState.scrollTop,
    `${routeName}: o contêiner vertical não alcançou o final do conteúdo.`,
  ).toBeGreaterThan(0);

  expect(
    scrollState.maxScrollTop - scrollState.scrollTop,
    `${routeName}: o final do conteúdo não ficou acessível pela rolagem.`,
  ).toBeLessThanOrEqual(1);

  await page.screenshot({
    path: join(
      'test-results',
      'responsive',
      `${viewport.width}x${viewport.height}-${routeName}-scroll-end.png`,
    ),
    animations: 'disabled',
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

          if (route.loadedText) {
            await expect(page.getByText(route.loadedText, { exact: true }).first()).toBeVisible();
          }

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

          if (route.captureScrollEnd) {
            await captureVerticalScrollEnd(page, viewport, route.name);
          }
        });
      }

      expect(pageErrors, 'A aplicação apresentou erros JavaScript no navegador.').toEqual([]);
    });
  }
});
