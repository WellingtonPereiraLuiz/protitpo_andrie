import { expect, test } from '@playwright/test';

test.describe('menu do celular', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('cobre a página inteira, por cima do conteúdo', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    const painel = page.getByRole('dialog', { name: 'Menu' });
    await expect(painel).toBeVisible();

    // O que está de fato por cima, no meio da tela e à esquerda do painel: o fundo do menu,
    // nunca o conteúdo da página (era o bug: o menu ficava preso na caixa do cabeçalho).
    const porCima = await page.evaluate(() => {
      const noPainel = document.elementFromPoint(window.innerWidth - 20, window.innerHeight / 2);
      const noFundo = document.elementFromPoint(10, window.innerHeight / 2);
      return {
        painel: Boolean(noPainel?.closest('[role="dialog"]')),
        fundo: noFundo?.getAttribute('aria-label') ?? noFundo?.tagName ?? '',
      };
    });
    expect(porCima).toEqual({ painel: true, fundo: 'Fechar menu' });

    const altura = await painel.evaluate((el) => el.getBoundingClientRect().height);
    expect(altura).toBe(844);
    await expect(page.getByRole('button', { name: 'Fechar menu' }).last()).toBeFocused();
  });

  test('fecha com animação e devolve o foco ao botão do menu', async ({ page }) => {
    await page.goto('/');
    const abrir = page.getByRole('button', { name: 'Abrir menu' });
    await abrir.click();
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible();

    await page.keyboard.press('Escape');
    // Logo depois do Esc o painel ainda está saindo de cena...
    await expect(page.getByRole('dialog', { name: 'Menu' })).toHaveCount(1);
    // ...e em seguida sai do DOM.
    await expect(page.getByRole('dialog', { name: 'Menu' })).toHaveCount(0);
    await expect(abrir).toBeFocused();
  });

  test('um link do menu leva à página e fecha o menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Agenda' }).click();
    await expect(page).toHaveURL('/agenda');
    await expect(page.getByRole('dialog', { name: 'Menu' })).toHaveCount(0);
  });
});

test('trocar de página usa transição animada (View Transitions)', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'a contagem usa document.startViewTransition');
  await page.addInitScript(() => {
    const original = document.startViewTransition.bind(document);
    (window as unknown as { transicoes: number }).transicoes = 0;
    document.startViewTransition = ((...args: Parameters<typeof original>) => {
      (window as unknown as { transicoes: number }).transicoes += 1;
      return original(...args);
    }) as typeof document.startViewTransition;
  });
  await page.goto('/sobre');
  await page.getByRole('link', { name: 'Vamos conversar' }).click();
  await expect(page).toHaveURL('/contato');
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { transicoes: number }).transicoes))
    .toBeGreaterThan(0);
});

for (const [origem, rotulo, destino, nome] of [
  ['/portfolio', /Marina & Téo/, '/portfolio/marina-teo', 'capa-marina-teo'],
  [
    '/blog',
    /Como escolher o horário/,
    '/blog/como-escolher-o-horario-da-cerimonia',
    'capa-post-como-escolher-o-horario-da-cerimonia',
  ],
] as const) {
  test(`abrir ${destino} leva a capa junto, como elemento compartilhado`, async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'a inspeção usa document.startViewTransition');
    // Registra os view-transition-name que estão no DOM quando a transição começa.
    await page.addInitScript(() => {
      const original = document.startViewTransition.bind(document);
      const w = window as unknown as { nomes: string[] };
      w.nomes = [];
      document.startViewTransition = ((...args: Parameters<typeof original>) => {
        for (const el of document.querySelectorAll<HTMLElement>('*')) {
          const n = getComputedStyle(el).viewTransitionName;
          if (n && n !== 'none') w.nomes.push(n);
        }
        return original(...args);
      }) as typeof document.startViewTransition;
    });
    await page.goto(origem);
    await page.getByRole('link', { name: rotulo }).first().click();
    await expect(page).toHaveURL(destino);
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { nomes: string[] }).nomes))
      .toContain(nome);
  });
}

test('o rodapé é enxuto: marca, contato e créditos', async ({ page }) => {
  await page.goto('/');
  const rodape = page.getByRole('contentinfo');
  await expect(rodape.getByRole('link')).toHaveText([
    'Andrei Heck',
    'WhatsApp',
    'Instagram',
    'ahgestao@gmail.com',
  ]);
  await expect(rodape).toContainText('Demonstração: textos e fotos são genéricos');
  const altura = await rodape.evaluate((el) => el.getBoundingClientRect().height);
  expect(altura).toBeLessThan(260);
});
