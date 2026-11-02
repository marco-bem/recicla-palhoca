import { expect, test, type Page } from '@playwright/test';

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

type CenterFixture = Omit<typeof CENTER, 'coordinates'> & {
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
};

const CENTER_WITHOUT_COORDINATES: CenterFixture = {
  ...CENTER,
  coordinates: {
    latitude: null,
    longitude: null,
  },
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
    captureScrollEnd: false,
  },
  {
    name: 'localizacao',
    path: '/location',
    expectedText: 'Encontre centros próximos de você',
    captureScrollEnd: false,
  },
  {
    name: 'detalhes',
    path: '/center/42',
    expectedText: CENTER.name,
    captureScrollEnd: true,
  },
];

async function mockApi(
  page: Page,
  centers: CenterFixture[] = [CENTER],
  options: {
    failFirstCentersRequest?: boolean;
    beforeFirstCentersResponse?: () => Promise<void>;
  } = {},
) {
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

  let centersRequests = 0;

  await page.route('**/centers**', (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const isCentersEndpoint =
      pathname === '/centers' || pathname.startsWith('/centers/');

    if (request.resourceType() !== 'fetch' || !isCentersEndpoint) {
      return route.continue();
    }

    if (pathname === '/centers') {
      centersRequests += 1;
      if (options.failFirstCentersRequest && centersRequests === 1) {
        return route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Falha simulada da API.' }),
        });
      }
      if (options.beforeFirstCentersResponse && centersRequests === 1) {
        await options.beforeFirstCentersResponse();
      }
    }

    const data =
      pathname === '/centers'
        ? centers
        : centers.find((center) => pathname === `/centers/${center.id}`) ?? null;

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data }),
    });
  });

  return () => centersRequests;
}

async function waitForCentersResponse(
  page: Page,
  matches: (params: URLSearchParams) => boolean,
) {
  return page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname === '/centers' && matches(url.searchParams);
  });
}

async function expectMinimumTargetSize(
  locator: ReturnType<Page['getByRole']>,
  label: string,
) {
  const bounds = await locator.boundingBox();
  if (!bounds) {
    throw new Error(`O controle "${label}" não possui uma área visível mensurável.`);
  }

  expect(
    bounds.width,
    `O controle "${label}" tem largura inferior a 24 CSS px.`,
  ).toBeGreaterThanOrEqual(24);
  expect(
    bounds.height,
    `O controle "${label}" tem altura inferior a 24 CSS px.`,
  ).toBeGreaterThanOrEqual(24);
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
    path: `test-results/responsive/${viewport.width}x${viewport.height}-${routeName}-scroll-end.png`,
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

      for (const route of ROUTES) {
        await test.step(`${route.name}: ${route.path}`, async () => {
          await page.goto(route.path, { waitUntil: 'domcontentloaded' });
          await expect(page.getByText(route.expectedText, { exact: true }).first()).toBeVisible();

          if (route.loadedText) {
            await expect(page.getByText(route.loadedText, { exact: true }).first()).toBeVisible();
          }

          await assertNoHorizontalOverflow(page, viewport.width);

          await page.screenshot({
            path: `test-results/responsive/${viewport.width}x${viewport.height}-${route.name}.png`,
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

  test.describe('Usabilidade dos controles', () => {
    test.use({ hasTouch: true });

    test('filtros, busca por teclado e botão Voltar são operáveis e acessíveis', async ({
      page,
    }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.setViewportSize({ width: 390, height: 844 });
      await mockApi(page);
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('Explore por material', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Ver todos os centros' }).click();
      await expect(
        page.getByText(/^Centros (?:próximos|disponíveis)$/, { exact: true }).first(),
      ).toBeVisible();

      const backButton = page.getByRole('button', { name: 'Voltar' });
      const pickupFilter = page.getByRole('button', { name: 'Com coleta' });
      const paperFilter = page.getByRole('button', { name: 'Papel', exact: true });
      const allMaterialsFilter = page.getByRole('button', { name: 'Todos', exact: true });

      await expect(backButton).toBeVisible();
      await expect(pickupFilter).toBeVisible();
      await expect(paperFilter).toBeVisible();
      await expect(allMaterialsFilter).toBeVisible();

      await expectMinimumTargetSize(backButton, 'Voltar');
      await expectMinimumTargetSize(pickupFilter, 'Com coleta');
      await expectMinimumTargetSize(paperFilter, 'Papel');

      const pickupResponse = waitForCentersResponse(
        page,
        (params) => params.get('offersPickup') === 'true',
      );
      await pickupFilter.focus();
      await pickupFilter.press('Enter');
      expect((await pickupResponse).status()).toBe(200);

      const paperResponse = waitForCentersResponse(
        page,
        (params) =>
          params.get('material') === 'papel' &&
          params.get('offersPickup') === 'true',
      );
      await paperFilter.tap();
      expect((await paperResponse).status()).toBe(200);

      const allMaterialsResponse = waitForCentersResponse(
        page,
        (params) =>
          !params.has('material') &&
          params.get('offersPickup') === 'true',
      );
      await allMaterialsFilter.tap();
      expect((await allMaterialsResponse).status()).toBe(200);

      const searchField = page.getByLabel('Buscar centros por nome, bairro ou material');
      await expect(searchField).toBeVisible();
      await searchField.fill('Centro');
      const searchResponse = waitForCentersResponse(
        page,
        (params) => params.get('q') === 'Centro',
      );
      await searchField.press('Enter');
      expect((await searchResponse).status()).toBe(200);

      await backButton.focus();
      await backButton.press('Enter');
      await expect(page.getByText('Explore por material', { exact: true })).toBeVisible();
      await expect(page).toHaveURL(/\/$/);

      expect(
        pageErrors,
        'A aplicação apresentou erros JavaScript durante a interação com os controles.',
      ).toEqual([]);
    });
  
    test('mapa sem centros e sem localização apresenta estado vazio sem criar marcadores', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await mockApi(page, []);
      await page.goto('/centers', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText('0 centros encontrados', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Visualizar no mapa' }).click();

      await expect(page.getByText('Nenhum centro encontrado', { exact: true })).toBeVisible();
      await expect(
        page.getByText(
          'Ajuste a busca ou os filtros. A consulta apresenta somente centros públicos cadastrados e disponíveis na API.',
          { exact: true },
        ),
      ).toBeVisible();
      await expect(
        page.locator('iframe[title="Mapa interativo dos centros de reciclagem"]'),
      ).toHaveCount(0);
    });

    test('centro sem coordenadas permanece disponível na lista e não aparece no mapa', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await mockApi(page, [CENTER_WITHOUT_COORDINATES]);
      await page.goto('/centers', { waitUntil: 'domcontentloaded' });

      await expect(page.getByText(CENTER.name, { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Visualizar no mapa' }).click();

      await expect(page.getByText('Centros sem coordenadas', { exact: true })).toBeVisible();
      await expect(
        page.getByText(
          'Os centros encontrados não possuem coordenadas válidas para exibição no mapa. Eles continuam disponíveis na lista.',
          { exact: true },
        ),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Ver lista' }).click();

      await expect(page.getByText(CENTER.name, { exact: true })).toBeVisible();
      await expect(
        page.locator('iframe[title="Mapa interativo dos centros de reciclagem"]'),
      ).toHaveCount(0);
    });

    test('consulta apresenta carregamento enquanto a API ainda responde', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });

      let releaseResponse!: () => void;
      const responseGate = new Promise<void>((resolve) => {
        releaseResponse = resolve;
      });

      const getCentersRequestCount = await mockApi(page, [CENTER], {
        beforeFirstCentersResponse: () => responseGate,
      });

      await page.goto('/centers', { waitUntil: 'domcontentloaded' });
      await expect(
        page.getByText('Carregando resultados da API...', { exact: true }),
      ).toBeVisible();
      expect(getCentersRequestCount()).toBe(1);

      releaseResponse();

      await expect(page.getByText(CENTER.name, { exact: true })).toBeVisible();
      expect(getCentersRequestCount()).toBe(1);
    });

    test('mapa apresenta carregamento enquanto o estilo cartográfico é obtido', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await mockApi(page);

      let releaseStyleRequest!: () => void;
      let notifyStyleRequestStarted!: () => void;
      const styleRequestGate = new Promise<void>((resolve) => {
        releaseStyleRequest = resolve;
      });
      const styleRequestStarted = new Promise<void>((resolve) => {
        notifyStyleRequestStarted = resolve;
      });
      let styleRequestCount = 0;

      await page.route('https://tiles.openfreemap.org/styles/liberty', async (route) => {
        styleRequestCount += 1;
        if (styleRequestCount === 1) {
          notifyStyleRequestStarted();
          await styleRequestGate;
        }
        await route.continue();
      });

      await page.goto('/centers', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText(CENTER.name, { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Visualizar no mapa' }).click();

      await styleRequestStarted;
      await expect(page.getByText('Carregando mapa...', { exact: true })).toBeVisible();

      releaseStyleRequest();

      const mapFrame = page.frameLocator(
        'iframe[title="Mapa interativo dos centros de reciclagem"]',
      );
      await expect(mapFrame.locator('canvas.maplibregl-canvas')).toBeVisible({
        timeout: 30000,
      });
      await expect(page.getByText('Carregando mapa...', { exact: true })).toHaveCount(0);
      expect(styleRequestCount).toBeGreaterThan(0);
    });

    test('consulta falha, apresenta erro e recupera ao tentar novamente', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const getCentersRequestCount = await mockApi(page, [CENTER], {
        failFirstCentersRequest: true,
      });

      await page.goto('/centers', { waitUntil: 'domcontentloaded' });

      await expect(
        page.getByText('Não foi possível consultar os centros', { exact: true }),
      ).toBeVisible();
      await expect(page.getByText('Falha simulada da API.', { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
      expect(getCentersRequestCount()).toBe(1);

      await page.getByRole('button', { name: 'Tentar novamente' }).click();

      await expect(page.getByText(CENTER.name, { exact: true })).toBeVisible();
      expect(getCentersRequestCount()).toBe(2);
    });

    test('falha ao carregar o estilo do mapa apresenta mensagem de erro', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await mockApi(page);

      let styleRequests = 0;
      await page.route('https://tiles.openfreemap.org/styles/liberty', async (route) => {
        styleRequests += 1;
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Falha simulada ao carregar o estilo.' }),
        });
      });

      await page.goto('/centers', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText(CENTER.name, { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Visualizar no mapa' }).click();

      await expect(
        page.getByText('Não foi possível carregar o mapa.', { exact: true }),
      ).toBeVisible({ timeout: 30000 });
      expect(styleRequests).toBeGreaterThan(0);
    });

    test('mapa real renderiza o centro retornado pela API e abre o detalhe pelo marcador', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.addInitScript(() => {
        window.addEventListener('message', (event) => {
          if (
            event.data?.channel === 'recicla-palhoca-map' &&
            event.data?.type === 'data-updated'
          ) {
            document.documentElement.dataset.mapReadyCount = String(
              event.data.centerCount ?? 0,
            );
          }
        });
      });
      await mockApi(page);

      await page.goto('/centers', { waitUntil: 'domcontentloaded' });
      await expect(page.getByText(CENTER.name, { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Visualizar no mapa' }).click();

      const mapFrame = page.frameLocator(
        'iframe[title="Mapa interativo dos centros de reciclagem"]',
      );
      await expect(mapFrame.locator('canvas.maplibregl-canvas')).toBeVisible({
        timeout: 30000,
      });
      await expect(page.locator('html')).toHaveAttribute(
        'data-map-ready-count',
        '1',
        { timeout: 30000 },
      );

      const mapCanvas = mapFrame.locator('canvas.maplibregl-canvas');
      const bounds = await mapCanvas.boundingBox();
      if (!bounds) {
        throw new Error('O canvas do mapa não possui dimensões visíveis.');
      }
      await mapCanvas.click({
        position: {
          x: Math.round(bounds.width / 2),
          y: Math.round(bounds.height / 2),
        },
      });

      await expect(page).toHaveURL(/\/center\/42$/, { timeout: 10000 });
      await expect(page.getByText(CENTER.name, { exact: true })).toBeVisible();
    });

  });
});
