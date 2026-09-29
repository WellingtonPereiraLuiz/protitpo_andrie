import { expect, type Page } from '@playwright/test';

/** Entra no painel pela tela de login, como uma pessoa faria. */
export async function entrarNoPainel(page: Page) {
  await page.goto('/admin/entrar');
  await page.getByLabel('Usuário').fill('admin');
  await page.getByLabel('Senha').fill('admin');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL('/admin/textos');
}

export async function semRolagemHorizontal(page: Page) {
  const transborda = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(transborda, 'a página rola na horizontal').toBe(false);
}
