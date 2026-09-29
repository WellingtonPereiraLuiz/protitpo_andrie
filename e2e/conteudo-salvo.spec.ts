import { expect, test } from '@playwright/test';
import { CHAVE_DO_CONTEUDO } from '../src/dados/local/conteudo-local';
import { copiaDaSemente } from '../src/dados/semente';

// O site gerado mostra a semente; no navegador que tem conteúdo salvo, mostra o salvo.

/** Roda no navegador antes de qualquer script da página. */
function gravar([chave, dado]: string[]) {
  if (chave === undefined || dado === undefined) return;
  localStorage.setItem(chave, dado);
}

test('o site mostra o conteúdo salvo neste navegador, inclusive um álbum novo', async ({
  page,
}) => {
  const conteudo = copiaDaSemente();
  conteudo.home.heroTitulo = 'Título salvo no navegador';
  conteudo.albuns.push({
    slug: 'ana-pedro',
    categoria: 'Ensaios',
    nome: 'Ana & Pedro',
    meta: 'Ensaio · Serra',
    resumo: 'Um ensaio novo, criado depois do build.',
    texto: ['Texto salvo pelo painel.'],
    capa: 'p1062',
    fotos: ['p1080'],
  });
  await page.addInitScript(gravar, [CHAVE_DO_CONTEUDO, JSON.stringify(conteudo)]);

  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Título salvo no navegador' }),
  ).toBeVisible();

  await page.goto('/portfolio?categoria=Ensaios');
  await page.getByRole('link', { name: /Ana & Pedro/ }).click();
  await expect(page).toHaveURL('/portfolio/ana-pedro');
  await expect(page.getByRole('heading', { level: 1, name: 'Ana & Pedro' })).toBeVisible();
  await expect(page.getByText('Texto salvo pelo painel.')).toBeVisible();
});

test('conteúdo corrompido no navegador não derruba o site', async ({ page }) => {
  const erros: string[] = [];
  page.on('pageerror', (e) => erros.push(e.message));
  await page.addInitScript(gravar, [CHAVE_DO_CONTEUDO, '{"versao":1,']);

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Andrei Heck' })).toBeVisible();
  await page.goto('/portfolio/marina-teo');
  await expect(page.getByRole('heading', { level: 1, name: 'Marina & Téo' })).toBeVisible();
  expect(erros).toEqual([]);
});

test('um álbum que não existe em lugar nenhum mostra "não encontrado"', async ({ page }) => {
  await page.goto('/portfolio/nao-existe');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Não encontrei esse álbum' }),
  ).toBeVisible();
});
