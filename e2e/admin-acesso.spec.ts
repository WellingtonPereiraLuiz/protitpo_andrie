import { expect, test } from '@playwright/test';
import { entrarNoPainel, semRolagemHorizontal } from './ajuda';

test('sem sessão, qualquer rota do painel leva ao login', async ({ page }) => {
  await page.goto('/admin/posts');
  await expect(page).toHaveURL('/admin/entrar');
  await expect(page.getByText('admin', { exact: true }).first()).toBeVisible();
});

test('credencial errada mostra erro e não entra', async ({ page }) => {
  await page.goto('/admin/entrar');
  await page.getByLabel('Usuário').fill('admin');
  await page.getByLabel('Senha').fill('errada');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Usuário ou senha incorretos.' }),
  ).toBeVisible();
  await expect(page).toHaveURL('/admin/entrar');
  await page.goto('/admin/textos');
  await expect(page).toHaveURL('/admin/entrar');
});

test('o painel tem layout próprio, sem o cabeçalho e o rodapé do site', async ({ page }) => {
  await entrarNoPainel(page);
  await expect(page.getByRole('heading', { level: 1, name: 'Painel do fotógrafo' })).toBeVisible();
  await expect(page.getByText('Demonstração', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toHaveCount(0);
  await expect(page.getByRole('contentinfo')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Ver o site/ })).toHaveAttribute('target', '_blank');
  await semRolagemHorizontal(page);
});

test('cada seção tem endereço próprio e sobrevive ao F5', async ({ page }) => {
  await entrarNoPainel(page);
  const secoes = page.getByRole('navigation', { name: 'Seções do painel' });
  await secoes.getByRole('link', { name: 'Posts' }).click();
  await expect(page).toHaveURL('/admin/posts');
  await page.reload();
  await expect(page).toHaveURL('/admin/posts');
  await expect(page.getByRole('heading', { level: 2, name: 'Posts' })).toBeVisible();
  await expect(secoes.getByRole('link', { name: 'Posts' })).toHaveAttribute('aria-current', 'page');

  await page.goto('/admin');
  await expect(page).toHaveURL('/admin/textos');
});

test('a navegação das seções nunca quebra em duas linhas', async ({ page }) => {
  await entrarNoPainel(page);
  const topos = await page
    .getByRole('navigation', { name: 'Seções do painel' })
    .getByRole('link')
    .evaluateAll((links) => links.map((l) => (l as HTMLElement).offsetTop));
  expect(topos).toHaveLength(7);
  const largura = page.viewportSize()?.width ?? 0;
  if (largura < 880) {
    // Mobile: uma faixa só, todas as seções na mesma linha.
    expect(new Set(topos).size).toBe(1);
  } else {
    // Desktop: lista vertical, uma seção por linha.
    expect(new Set(topos).size).toBe(7);
  }
});

test('sair encerra a sessão', async ({ page }) => {
  await entrarNoPainel(page);
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL('/admin/entrar');
  await page.goto('/admin/textos');
  await expect(page).toHaveURL('/admin/entrar');
});
