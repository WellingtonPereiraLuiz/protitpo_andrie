import { expect, test, type Page } from '@playwright/test';
import { entrarNoPainel, semRolagemHorizontal } from './ajuda';

// Relógio fixo: "hoje" é 29/09/2026, então a agenda vai de outubro de 2026 a setembro de 2027.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-29T12:00:00'));
});

async function abrirAgendaEmNovembro(page: Page) {
  await entrarNoPainel(page);
  await page
    .getByRole('navigation', { name: 'Seções do painel' })
    .getByRole('link', { name: 'Agenda' })
    .click();
  await expect(page.getByRole('heading', { level: 3, name: 'Outubro de 2026' })).toBeVisible();
  await page.getByRole('button', { name: 'Próximo mês →' }).click();
  await expect(page.getByRole('heading', { level: 3, name: 'Novembro de 2026' })).toBeVisible();
}

function diaPublico(page: Page, numero: string) {
  return page
    .getByRole('region', { name: 'Novembro de 2026' })
    .locator('span')
    .filter({ hasText: new RegExp(`^${numero}( — ocupada)?$`) });
}

test('atribuir um dia a um compromisso risca o dia no site, sem mostrar o título', async ({
  page,
}) => {
  await abrirAgendaEmNovembro(page);

  await page.getByRole('button', { name: /^domingo, 8 de novembro de 2026 — livre$/ }).click();
  await page.getByRole('textbox', { name: 'Título', exact: true }).fill('Casamento Ana & Pedro');
  await page.getByRole('textbox', { name: 'Local', exact: true }).fill('Sítio Boa Vista');
  await expect(page.getByRole('status').filter({ hasText: 'Alterações não salvas' })).toBeVisible();
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tudo salvo' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'domingo, 8 de novembro de 2026 — Casamento Ana & Pedro' }),
  ).toBeVisible();
  await semRolagemHorizontal(page);

  await page.goto('/agenda');
  await expect(diaPublico(page, '8')).toHaveText('8 — ocupada');
  await expect(page.getByText('Casamento Ana & Pedro')).toHaveCount(0);
  await expect(page.getByText('Sítio Boa Vista')).toHaveCount(0);
});

test('liberar um dia ocupado o devolve ao site como livre', async ({ page }) => {
  await abrirAgendaEmNovembro(page);
  await page.getByRole('button', { name: /^sábado, 7 de novembro de 2026 — / }).click();
  await page.getByRole('button', { name: 'Liberar este dia' }).click();
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tudo salvo' })).toBeVisible();

  await page.goto('/agenda');
  await expect(diaPublico(page, '7')).toHaveText('7');
});

test('nada é gravado antes de salvar, e descartar volta ao que estava', async ({ page }) => {
  await abrirAgendaEmNovembro(page);
  await page.getByRole('button', { name: /^domingo, 8 de novembro de 2026 — livre$/ }).click();
  await page.getByRole('textbox', { name: 'Título', exact: true }).fill('Não era pra salvar');
  await page.getByRole('button', { name: 'Descartar alterações' }).click();
  await expect(
    page.getByRole('button', { name: /^domingo, 8 de novembro de 2026 — livre$/ }),
  ).toBeVisible();

  await page.goto('/agenda');
  await expect(diaPublico(page, '8')).toHaveText('8');
});

test('compromisso sem título é recusado com a mensagem do campo', async ({ page }) => {
  await abrirAgendaEmNovembro(page);
  await page.getByRole('button', { name: /^domingo, 8 de novembro de 2026 — livre$/ }).click();
  await page.getByRole('textbox', { name: 'Local', exact: true }).fill('Só o local');
  await page.getByRole('button', { name: 'Salvar' }).click();
  // A mensagem fica ligada ao campo (aria-describedby), não solta na tela.
  await expect(
    page.getByRole('textbox', { name: 'Título', exact: true }),
  ).toHaveAccessibleDescription(/O título não pode ficar vazio\./);
  await expect(page.getByRole('textbox', { name: 'Título', exact: true })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(page.getByRole('status').filter({ hasText: 'Erro ao salvar' })).toBeVisible();
});

test('o site público navega pelos meses até 12 meses à frente', async ({ page }) => {
  await page.goto('/agenda');
  await expect(page.getByRole('region', { name: 'Outubro de 2026' })).toBeVisible();
  await expect(page.getByRole('button', { name: '← Mês anterior' })).toBeDisabled();
  const proximo = page.getByRole('button', { name: 'Próximo mês →' });
  for (let i = 0; i < 9; i++) await proximo.click();
  await expect(page.getByRole('region', { name: 'Setembro de 2027' })).toBeVisible();
  await expect(proximo).toBeDisabled();
});

test('"Abrir" na lista de próximos leva aos detalhes do compromisso', async ({ page }) => {
  await entrarNoPainel(page);
  await page.goto('/admin/agenda');
  // Primeiro, dá um local e uma observação ao compromisso de 21/11, para ver que aparecem.
  await page.getByRole('button', { name: 'Próximo mês →' }).click();
  await page.getByRole('button', { name: /^sábado, 21 de novembro de 2026 — / }).click();
  await page.getByRole('textbox', { name: 'Local', exact: true }).fill('Cachoeira do Rio');
  await page
    .getByRole('textbox', { name: 'Observação', exact: true })
    .fill('Levar drone. Chegar às 15h.');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tudo salvo' })).toBeVisible();
  await page.getByRole('button', { name: 'Fechar' }).click();
  await page.getByRole('button', { name: '← Mês anterior' }).click();

  const item = page.getByRole('listitem').filter({ hasText: '21 nov 2026' });
  await expect(item).toContainText('Cachoeira do Rio');
  await expect(item).toContainText('Levar drone. Chegar às 15h.');
  await item.getByRole('button', { name: 'Abrir sábado, 21 de novembro de 2026' }).click();

  const detalhes = page.getByRole('group', { name: 'sábado, 21 de novembro de 2026' });
  await expect(detalhes).toBeFocused();
  await expect(detalhes).toBeInViewport();
  await expect(page.getByRole('heading', { level: 3, name: 'Novembro de 2026' })).toBeVisible();
  await expect(detalhes.getByRole('textbox', { name: 'Título', exact: true })).toHaveValue(
    'Ensaio (exemplo)',
  );
  await expect(detalhes.getByRole('textbox', { name: 'Local', exact: true })).toHaveValue(
    'Cachoeira do Rio',
  );
});
