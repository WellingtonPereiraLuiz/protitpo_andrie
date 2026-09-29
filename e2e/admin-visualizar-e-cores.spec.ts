import { expect, test, type Page } from '@playwright/test';
import { entrarNoPainel } from './ajuda';

const faixa = (page: Page) =>
  page.getByRole('complementary', { name: 'Visualização do administrador' });
const status = (page: Page, texto: string) => page.getByRole('status').filter({ hasText: texto });

test.describe('ver o site como administrador', () => {
  test('"Ver o site" abre o site com a faixa e a seta de volta ao painel', async ({ page }) => {
    await entrarNoPainel(page);
    await page.getByRole('link', { name: 'Ver o site' }).click();
    await expect(page).toHaveURL('/');
    await expect(faixa(page)).toContainText('Você está vendo o site como administrador');

    // A faixa acompanha a navegação dentro do site.
    await page.goto('/portfolio');
    await expect(faixa(page)).toBeVisible();

    await faixa(page).getByRole('link', { name: 'Voltar ao painel' }).click();
    await expect(page).toHaveURL('/admin/textos');
  });

  test('volta para a mesma tela do painel de onde saiu', async ({ page }) => {
    await entrarNoPainel(page);
    await page.goto('/admin/albuns/marina-teo');
    await page.getByRole('link', { name: 'Ver álbum' }).click();
    await expect(page).toHaveURL('/portfolio/marina-teo');
    await faixa(page).getByRole('link', { name: 'Voltar ao painel' }).click();
    await expect(page).toHaveURL('/admin/albuns/marina-teo');
  });

  test('é separado do acesso normal: outra aba e o visitante comum não veem a faixa', async ({
    page,
    context,
  }) => {
    await entrarNoPainel(page);
    await page.getByRole('link', { name: 'Ver o site' }).click();
    await expect(faixa(page)).toBeVisible();

    // Mesmo navegador, mesma sessão de admin, outra aba: site normal.
    const outraAba = await context.newPage();
    await outraAba.goto('/');
    await expect(outraAba.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(faixa(outraAba)).toHaveCount(0);

    // "Ver como visitante" tira a faixa desta aba também, e ela não volta ao recarregar.
    await faixa(page).getByRole('button', { name: 'Ver como visitante' }).click();
    await expect(faixa(page)).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(faixa(page)).toHaveCount(0);
  });

  test('um visitante que nunca entrou no painel não vê a faixa', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(faixa(page)).toHaveCount(0);
  });
});

test.describe('paleta de cores', () => {
  async function irParaCores(page: Page) {
    await entrarNoPainel(page);
    await page
      .getByRole('navigation', { name: 'Seções do painel' })
      .getByRole('link', { name: 'Cores' })
      .click();
    await expect(page.getByRole('heading', { level: 2, name: 'Cores' })).toBeVisible();
  }

  const variavel = (page: Page, nome: string) =>
    page.evaluate(
      (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
      nome,
    );

  test('escolher uma paleta pronta e salvar muda as cores do site', async ({ page }) => {
    await irParaCores(page);
    await page.getByRole('button', { name: 'Noite' }).click();
    await expect(page.getByRole('button', { name: 'Noite' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('textbox', { name: 'Nome da paleta' })).toHaveValue('Noite');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(status(page, 'Tudo salvo')).toBeVisible();

    await page.goto('/');
    await expect.poll(() => variavel(page, '--paper')).toBe('#1c1b1a');
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor))
      .toBe('rgb(28, 27, 26)');

    // Recarregando, a paleta já vem certa (script antes da primeira pintura).
    await page.reload();
    expect(await variavel(page, '--gold')).toBe('#e0b36a');
  });

  test('editar uma cor mostra a prévia e avisa quando o contraste cai', async ({ page }) => {
    await irParaCores(page);
    await page.getByRole('textbox', { name: 'Apagado', exact: true }).fill('#c9c3bb');
    await expect(page.getByText('Apagado sobre o fundo (legendas)')).toContainText(
      'abaixo do mínimo',
    );
    const previa = page.getByTestId('previa-da-paleta');
    await expect
      .poll(() => previa.evaluate((el) => getComputedStyle(el).getPropertyValue('--muted').trim()))
      .toBe('#c9c3bb');

    await page.getByRole('textbox', { name: 'Destaque', exact: true }).fill('azul');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(
      page.getByRole('textbox', { name: 'Destaque', exact: true }),
    ).toHaveAccessibleDescription('Use uma cor no formato #rrggbb.');
  });

  test('copiar a paleta põe o nome e as cores na área de transferência', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'permissão de área de transferência do Chromium');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await irParaCores(page);
    await page.getByRole('button', { name: 'Areia' }).click();
    await page.getByRole('button', { name: 'Copiar paleta' }).click();
    await expect(status(page, 'Paleta "Areia" copiada.')).toBeVisible();
    // A área de transferência do Windows troca LF por CRLF; o conteúdo é o que importa.
    const lido = await page.evaluate(() => navigator.clipboard.readText());
    const copiado = lido.replace(/\r\n/g, '\n');
    expect(copiado).toBe(
      [
        'Paleta "Areia"',
        'Fundo: #F7F1E8',
        'Superfície: #ECE2D3',
        'Texto: #2B2520',
        'Texto suave: #453C34',
        'Apagado: #5F5449',
        'Destaque: #8A4B2A',
        'Contorno: #C08A62',
      ].join('\n'),
    );
  });

  test('restaurar o original volta as cores do site', async ({ page }) => {
    await irParaCores(page);
    await page.getByRole('button', { name: 'Oliva' }).click();
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(status(page, 'Tudo salvo')).toBeVisible();
    page.once('dialog', (d) => void d.accept());
    await page.getByRole('button', { name: 'Restaurar o original' }).click();
    await expect(page.getByRole('textbox', { name: 'Nome da paleta' })).toHaveValue('Original');

    await page.goto('/');
    await expect.poll(() => variavel(page, '--paper')).toBe('#f4f2ef');
    expect(await page.evaluate(() => localStorage.getItem('ah-mvp:tema:v1'))).toBeNull();
  });
});
