import { expect, test, type Page } from '@playwright/test';
import { entrarNoPainel } from './ajuda';

const titulo = (page: Page) => page.getByRole('textbox', { name: 'Título da home', exact: true });
const status = (page: Page, texto: string) => page.getByRole('status').filter({ hasText: texto });

test('o site só muda depois de Salvar; Descartar volta ao salvo', async ({ page, context }) => {
  await entrarNoPainel(page);
  const site = await context.newPage();

  await titulo(page).fill('Fotografia de casamento em Rondônia');
  await expect(status(page, 'Alterações não salvas')).toBeVisible();
  await site.goto('/');
  await expect(site.getByRole('heading', { level: 1 })).toHaveText('Andrei Heck');

  await page.getByRole('button', { name: 'Descartar alterações' }).click();
  await expect(titulo(page)).toHaveValue('Andrei Heck');

  await titulo(page).fill('Fotografia de casamento em Rondônia');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(status(page, 'Tudo salvo')).toBeVisible();
  await site.reload();
  await expect(site.getByRole('heading', { level: 1 })).toHaveText(
    'Fotografia de casamento em Rondônia',
  );
});

test('título acima do limite é recusado com a mensagem do campo', async ({ page }) => {
  await entrarNoPainel(page);
  await titulo(page).fill('x'.repeat(61));
  await expect(page.getByText('61 / 60')).toBeVisible();
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(titulo(page)).toHaveAccessibleDescription(
    'O título da home passa de 60 caracteres.',
  );
  await expect(status(page, 'Erro ao salvar')).toBeVisible();
});

test('restaurar o original da seção volta os textos da home', async ({ page }) => {
  await entrarNoPainel(page);
  await titulo(page).fill('Outro título');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(status(page, 'Tudo salvo')).toBeVisible();

  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Restaurar o original' }).click();
  await expect(titulo(page)).toHaveValue('Andrei Heck');
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Andrei Heck');
});

test('restaurar tudo volta textos e agenda ao original', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-29T12:00:00'));
  await entrarNoPainel(page);
  await titulo(page).fill('Outro título');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(status(page, 'Tudo salvo')).toBeVisible();

  await page.getByRole('link', { name: 'Agenda', exact: true }).click();
  await page.getByRole('button', { name: 'Próximo mês →' }).click();
  await page.getByRole('button', { name: /^sábado, 7 de novembro de 2026 — / }).click();
  await page.getByRole('button', { name: 'Liberar este dia' }).click();
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(status(page, 'Tudo salvo')).toBeVisible();

  let mensagem = '';
  page.once('dialog', (d) => {
    mensagem = d.message();
    void d.accept();
  });
  await page.getByRole('button', { name: 'Restaurar tudo' }).click();
  // A seção é remontada depois de restaurar: volta ao primeiro mês da agenda.
  await expect(page.getByRole('heading', { level: 3, name: 'Outubro de 2026' })).toBeVisible();
  await page.getByRole('button', { name: 'Próximo mês →' }).click();
  await expect(
    page.getByRole('button', { name: 'sábado, 7 de novembro de 2026 — Casamento (exemplo)' }),
  ).toBeVisible();
  expect(mensagem).toContain('fotos enviadas e agenda');

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Andrei Heck');
});

test('sair da seção com alterações não salvas pede confirmação', async ({ page }) => {
  await entrarNoPainel(page);
  await titulo(page).fill('Rascunho');

  page.once('dialog', (d) => void d.dismiss());
  await page.getByRole('link', { name: 'Álbuns', exact: true }).click();
  await expect(page).toHaveURL('/admin/textos');
  await expect(titulo(page)).toHaveValue('Rascunho');

  page.once('dialog', (d) => void d.accept());
  await page.getByRole('link', { name: 'Álbuns', exact: true }).click();
  await expect(page).toHaveURL('/admin/albuns');
});

test('conteúdo corrompido: o painel avisa e o site continua de pé', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ah-mvp:conteudo:v1', '{"versao":1,');
  });
  await entrarNoPainel(page);
  await expect(page.getByRole('alert').filter({ hasText: 'corrompido' })).toBeVisible();
  await expect(titulo(page)).toHaveValue('Andrei Heck');
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Andrei Heck');
});
