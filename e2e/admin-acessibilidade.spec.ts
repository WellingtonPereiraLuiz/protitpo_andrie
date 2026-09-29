import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { entrarNoPainel } from './ajuda';

// Critério 12 da spec: nenhuma violação séria ou crítica (WCAG 2.1 A/AA) no painel.

const TELAS = [
  { rota: '/admin/textos', titulo: 'Textos' },
  { rota: '/admin/albuns', titulo: 'Álbuns' },
  { rota: '/admin/albuns/novo', titulo: 'Novo álbum' },
  { rota: '/admin/albuns/marina-teo', titulo: 'Marina & Téo' },
  { rota: '/admin/posts', titulo: 'Posts' },
  { rota: '/admin/posts/novo', titulo: 'Novo post' },
  { rota: '/admin/posts/casamento-no-sitio-da-familia', titulo: /Casamento no sítio/ },
  { rota: '/admin/depoimentos', titulo: 'Depoimentos' },
  { rota: '/admin/servicos', titulo: 'Serviços' },
  { rota: '/admin/fotos', titulo: 'Fotos' },
  { rota: '/admin/agenda', titulo: 'Agenda' },
] as const;

async function violacoesGraves(page: Page) {
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return resultado.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map(
      (v) => `${v.id} (${v.impact ?? '?'}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
    );
}

test('a tela de login não tem violações graves', async ({ page }) => {
  await page.goto('/admin/entrar');
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  expect(await violacoesGraves(page)).toEqual([]);
});

for (const { rota, titulo } of TELAS) {
  test(`${rota} não tem violações graves`, async ({ page }) => {
    await entrarNoPainel(page);
    await page.goto(rota);
    await expect(page.getByRole('heading', { level: 2, name: titulo })).toBeVisible();
    expect(await violacoesGraves(page)).toEqual([]);
  });
}

test('a biblioteca de fotos aberta e o formulário de um dia da agenda também', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-29T12:00:00'));
  await entrarNoPainel(page);
  await page.goto('/admin/fotos');
  await page.getByRole('button', { name: 'Trocar capa da home' }).click();
  await expect(page.getByRole('button', { name: 'Enviar foto nova' })).toBeVisible();
  expect(await violacoesGraves(page)).toEqual([]);

  await page.goto('/admin/agenda');
  await page.getByRole('button', { name: /^sábado, 3 de outubro de 2026 — / }).click();
  await expect(page.getByRole('button', { name: 'Liberar este dia' })).toBeVisible();
  expect(await violacoesGraves(page)).toEqual([]);
});
