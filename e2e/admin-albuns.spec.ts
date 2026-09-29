import { expect, test, type Page } from '@playwright/test';
import { entrarNoPainel, semRolagemHorizontal } from './ajuda';

const campo = (page: Page, nome: string) => page.getByRole('textbox', { name: nome, exact: true });
const status = (page: Page, texto: string) => page.getByRole('status').filter({ hasText: texto });

async function irParaAlbuns(page: Page) {
  await entrarNoPainel(page);
  await page
    .getByRole('navigation', { name: 'Seções do painel' })
    .getByRole('link', { name: 'Álbuns' })
    .click();
  await expect(page.getByRole('heading', { level: 2, name: 'Álbuns' })).toBeVisible();
}

test('adicionar um ensaio novo cria cartão e página no site', async ({ page }) => {
  await irParaAlbuns(page);
  await page.getByRole('link', { name: 'Adicionar álbum' }).click();
  await expect(page).toHaveURL('/admin/albuns/novo');

  await campo(page, 'Nome').fill('Ana & Pedro');
  await page.getByRole('combobox', { name: 'Categoria' }).selectOption('Ensaios');
  await campo(page, 'Linha de detalhe').fill('Ensaio pré-wedding · Serra da Mesa');
  await campo(page, 'Resumo do cartão').fill('Fim de tarde na serra, antes do casamento.');
  await campo(page, 'Parágrafo 1').fill('Subimos a serra com o sol ainda alto.');
  await page.getByRole('button', { name: 'Adicionar parágrafo' }).click();
  await campo(page, 'Parágrafo 2').fill('Descemos com as estrelas.');

  await page.getByRole('button', { name: 'Escolher capa' }).click();
  await page
    .getByRole('group', { name: 'Biblioteca de fotos para capa' })
    .getByRole('button')
    .nth(3)
    .click();
  await page.getByRole('button', { name: 'Adicionar fotos' }).click();
  const biblioteca = page.getByRole('group', { name: /cada foto escolhida entra no fim/ });
  await biblioteca.getByRole('button').nth(5).click();
  await biblioteca.getByRole('button').nth(6).click();
  await page.getByRole('button', { name: 'Pronto' }).click();
  await semRolagemHorizontal(page);

  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page).toHaveURL('/admin/albuns/ana-pedro');
  await expect(page.getByText('/portfolio/ana-pedro')).toBeVisible();

  await page.goto('/portfolio/categoria/ensaios');
  const cartao = page.getByRole('link', { name: /Ana & Pedro/ });
  await expect(cartao).toContainText('Fim de tarde na serra, antes do casamento.');
  await expect(cartao).toContainText('Ver as 3 fotos');
  await cartao.click();
  await expect(page).toHaveURL('/portfolio/ana-pedro');
  await expect(page.getByRole('heading', { level: 1, name: 'Ana & Pedro' })).toBeVisible();
  await expect(page.getByText('Subimos a serra com o sol ainda alto.')).toBeVisible();
  await expect(page.getByText('Descemos com as estrelas.')).toBeVisible();
  await expect(page.getByText('Ensaio pré-wedding · Serra da Mesa')).toBeVisible();
});

test('álbum novo sem nome nem capa é recusado, com a mensagem em cada campo', async ({ page }) => {
  await irParaAlbuns(page);
  await page.getByRole('link', { name: 'Adicionar álbum' }).click();
  await campo(page, 'Resumo do cartão').fill('Só o resumo.');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(campo(page, 'Nome')).toHaveAccessibleDescription(/O nome não pode ficar vazio\./);
  await expect(page.getByText('Escolha uma foto.')).toBeVisible();
  await expect(page).toHaveURL('/admin/albuns/novo');
});

test('editar nome e descrição de um álbum muda o cartão e a página', async ({ page }) => {
  await irParaAlbuns(page);
  await page.getByRole('link', { name: 'Editar Júlia & Vitor' }).click();
  await expect(page).toHaveURL('/admin/albuns/julia-vitor');
  await campo(page, 'Nome').fill('Júlia & Vitor, no quintal');
  await campo(page, 'Resumo do cartão').fill('Trinta convidados e uma mesa comprida.');
  await campo(page, 'Parágrafo 1').fill('Texto novo do álbum.');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(status(page, 'Tudo salvo')).toBeVisible();

  await page.goto('/portfolio');
  const cartao = page.getByRole('link', { name: /Júlia & Vitor, no quintal/ });
  await expect(cartao).toContainText('Trinta convidados e uma mesa comprida.');
  await cartao.click();
  await expect(page).toHaveURL('/portfolio/julia-vitor');
  await expect(page.getByText('Texto novo do álbum.')).toBeVisible();
});

test('excluir um álbum avisa o que ele leva junto e tira do site', async ({ page }) => {
  await irParaAlbuns(page);
  let aviso = '';
  page.once('dialog', (d) => {
    aviso = d.message();
    void d.accept();
  });
  await page.getByRole('button', { name: 'Excluir Bia & Caio' }).click();
  await expect(status(page, '"Bia & Caio" foi excluído.')).toBeVisible();
  expect(aviso).toContain('sai dos destaques da home');
  await expect(page.getByRole('link', { name: 'Editar Bia & Caio' })).toHaveCount(0);

  await page.goto('/');
  await expect(page.getByRole('link', { name: /Bia & Caio/ })).toHaveCount(0);
  await page.goto('/portfolio/bia-caio');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Não encontrei esse álbum' }),
  ).toBeVisible();
});

test('a ordem da lista é a ordem do portfólio', async ({ page }) => {
  await irParaAlbuns(page);
  await page.getByRole('button', { name: 'Subir Júlia & Vitor' }).click();
  await expect(status(page, 'Júlia & Vitor subiu.')).toBeVisible();
  await page.goto('/portfolio');
  // toHaveText com lista espera o conteúdo salvo substituir a semente (não lê cedo demais).
  await expect(page.getByRole('link', { name: /Ver as/ })).toHaveText([
    /Marina & Téo/,
    /Júlia & Vitor/,
    /Bia & Caio/,
  ]);
});
