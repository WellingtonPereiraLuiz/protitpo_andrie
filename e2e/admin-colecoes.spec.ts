import { expect, test, type Page } from '@playwright/test';
import { entrarNoPainel } from './ajuda';

const campo = (page: Page, nome: string) => page.getByRole('textbox', { name: nome, exact: true });
const status = (page: Page, texto: string) => page.getByRole('status').filter({ hasText: texto });

async function irPara(page: Page, secao: string) {
  await entrarNoPainel(page);
  await page
    .getByRole('navigation', { name: 'Seções do painel' })
    .getByRole('link', { name: secao })
    .click();
  await expect(page.getByRole('heading', { level: 2, name: secao })).toBeVisible();
}

test('post novo nasce rascunho, fica fora do blog e aparece ao publicar', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-29T12:00:00'));
  await irPara(page, 'Posts');
  await expect(page.getByText('3 posts publicados · 0 rascunhos')).toBeVisible();
  await page.getByRole('link', { name: 'Escrever novo post' }).click();

  await campo(page, 'Título').fill('Checklist da véspera');
  await campo(page, 'Categoria').fill('Dicas');
  await campo(page, 'Resumo').fill('O que deixar pronto no dia anterior.');
  await campo(page, 'Texto do bloco 1').fill('Separe os documentos e carregue as baterias.');
  await page.getByRole('button', { name: 'Escolher capa' }).click();
  await page
    .getByRole('group', { name: 'Biblioteca de fotos para capa' })
    .getByRole('button')
    .first()
    .click();
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page).toHaveURL('/admin/posts/checklist-da-vespera');

  await page.goto('/blog');
  await expect(page.getByRole('link', { name: /Ler o post/ })).toHaveCount(3);
  await expect(page.getByText('Checklist da véspera')).toHaveCount(0);
  await page.goto('/blog/checklist-da-vespera');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Não encontrei esse post' }),
  ).toBeVisible();

  await page.goto('/admin/posts/checklist-da-vespera');
  await page.getByRole('combobox', { name: 'Estado' }).selectOption('Publicado');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(status(page, 'Tudo salvo')).toBeVisible();

  await page.goto('/blog');
  // O mais recente primeiro.
  await expect(page.getByRole('link', { name: /Ler o post/ }).first()).toContainText(
    'Checklist da véspera',
  );
  await expect(page.getByText('29 set 2026 · Dicas')).toBeVisible();
  await page.getByRole('link', { name: /Checklist da véspera/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Checklist da véspera' })).toBeVisible();
  await expect(page.getByText('Separe os documentos e carregue as baterias.')).toBeVisible();
});

test('excluir um post tira do blog', async ({ page }) => {
  await irPara(page, 'Posts');
  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Excluir Ensaio de gestante em casa' }).click();
  await expect(status(page, '"Ensaio de gestante em casa" foi excluído.')).toBeVisible();
  await expect(page.getByText('2 posts publicados · 0 rascunhos')).toBeVisible();
  await page.goto('/blog');
  await expect(page.getByRole('link', { name: /Ler o post/ })).toHaveCount(2);
});

test('depoimento novo aparece na home, sem a marca de exemplo', async ({ page }) => {
  await irPara(page, 'Depoimentos');
  await page.getByRole('button', { name: 'Adicionar depoimento' }).click();
  await page
    .getByRole('group', { name: 'Depoimento 3' })
    .getByRole('textbox', { name: 'Quem disse' })
    .fill('Carla & Nando');
  await page
    .getByRole('group', { name: 'Depoimento de Carla & Nando' })
    .getByRole('textbox', { name: 'Depoimento' })
    .fill('Parecia que ele sabia o que ia acontecer antes da gente.');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(status(page, 'Tudo salvo')).toBeVisible();

  await page.goto('/');
  await expect(
    page.getByText('Parecia que ele sabia o que ia acontecer antes da gente.'),
  ).toBeVisible();
  await expect(page.getByText('Carla & Nando', { exact: true })).toBeVisible();
  await expect(page.getByText('Marina & Téo · exemplo fictício')).toBeVisible();
});

test('editar um serviço e acrescentar um item muda a página de serviços', async ({ page }) => {
  await irPara(page, 'Serviços');
  await page
    .getByRole('group', { name: 'Serviço Vídeo' })
    .getByRole('textbox', { name: 'Título', exact: true })
    .fill('Filme do casamento');
  const filme = page.getByRole('group', { name: 'Serviço Filme do casamento' });
  await filme.getByRole('button', { name: 'Adicionar item' }).click();
  await filme.getByRole('textbox', { name: 'Item 4' }).fill('Trilha sonora escolhida com vocês');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(status(page, 'Tudo salvo')).toBeVisible();

  await page.goto('/servicos');
  await expect(page.getByRole('heading', { level: 2, name: 'Filme do casamento' })).toBeVisible();
  await expect(page.getByText('Trilha sonora escolhida com vocês')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Vídeo' })).toHaveCount(0);
});
