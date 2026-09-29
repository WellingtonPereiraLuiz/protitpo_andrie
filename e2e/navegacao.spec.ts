import { expect, test, type Page } from '@playwright/test';

/** A partir de 880px o menu é horizontal; abaixo disso, fica atrás do botão de menu. */
const LARGURA_DO_MENU_HORIZONTAL = 880;

async function irPeloMenu(page: Page, rotulo: string) {
  const largura = page.viewportSize()?.width ?? 0;
  if (largura >= LARGURA_DO_MENU_HORIZONTAL) {
    await page
      .getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('link', { name: rotulo, exact: true })
      .click();
  } else {
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page
      .getByRole('dialog', { name: 'Menu' })
      .getByRole('link', { name: rotulo, exact: true })
      .click();
  }
}

async function semRolagemHorizontal(page: Page) {
  const transborda = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(transborda, 'a página rola na horizontal').toBe(false);
}

test('da home até um álbum, pelo menu e pelo cartão', async ({ page }) => {
  const erros: string[] = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') erros.push(m.text());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Andrei Heck' })).toBeVisible();
  await semRolagemHorizontal(page);

  await irPeloMenu(page, 'Portfólio');
  await expect(page).toHaveURL('/portfolio');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Casamentos, ensaios e filmes');
  await semRolagemHorizontal(page);

  await page.getByRole('link', { name: /Marina & Téo/ }).click();
  await expect(page).toHaveURL('/portfolio/marina-teo');
  await expect(page.getByRole('heading', { level: 1, name: 'Marina & Téo' })).toBeVisible();
  await semRolagemHorizontal(page);

  // A primeira foto do álbum carregou de verdade (não é só uma tag vazia).
  const capa = page.getByRole('img').first();
  await expect(capa).toBeVisible();
  await expect
    .poll(() => capa.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
    .toBe(true);

  expect(erros, 'erros no console do navegador').toEqual([]);
});
