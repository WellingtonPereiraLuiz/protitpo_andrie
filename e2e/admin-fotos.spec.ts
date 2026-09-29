import { expect, test, type Page } from '@playwright/test';
import { entrarNoPainel } from './ajuda';

const status = (page: Page, texto: string) => page.getByRole('status').filter({ hasText: texto });

/** Um JPEG de verdade, 4000×3000, gerado pelo próprio navegador. */
async function jpegGrande(page: Page): Promise<Buffer> {
  const base64 = await page.evaluate(() => {
    const tela = document.createElement('canvas');
    tela.width = 4000;
    tela.height = 3000;
    const ctx = tela.getContext('2d');
    if (!ctx) throw new Error('sem canvas');
    const g = ctx.createLinearGradient(0, 0, 4000, 3000);
    g.addColorStop(0, '#2a6f7a');
    g.addColorStop(1, '#e0b25c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4000, 3000);
    return tela.toDataURL('image/jpeg', 0.8).split(',')[1] ?? '';
  });
  return Buffer.from(base64, 'base64');
}

async function abrirFotos(page: Page) {
  await entrarNoPainel(page);
  await page
    .getByRole('navigation', { name: 'Seções do painel' })
    .getByRole('link', { name: 'Fotos' })
    .click();
  await expect(page.getByRole('heading', { level: 2, name: 'Fotos' })).toBeVisible();
}

test('trocar a capa da home por uma foto de 4000px grava WebP de 1920px com o alt', async ({
  page,
}) => {
  await abrirFotos(page);
  const arquivo = await jpegGrande(page);

  await page.getByRole('button', { name: 'Trocar capa da home' }).click();
  const seletor = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Enviar foto nova' }).click();
  await (await seletor).setFiles({ name: 'casal.jpg', mimeType: 'image/jpeg', buffer: arquivo });
  await expect(page.getByRole('img', { name: 'Pré-visualização da foto escolhida' })).toBeVisible();

  // Sem texto alternativo, não entra.
  await page.getByRole('button', { name: 'Usar esta foto' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'texto alternativo, obrigatório' }),
  ).toBeVisible();

  await page
    .getByRole('textbox', { name: 'Texto alternativo', exact: true })
    .fill('Casal na cachoeira');
  await page.getByRole('button', { name: 'Usar esta foto' }).click();
  await expect(status(page, 'Alterações não salvas')).toBeVisible();
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(status(page, 'Tudo salvo')).toBeVisible();

  await page.goto('/');
  const capa = page.getByRole('img', { name: 'Casal na cachoeira' });
  await expect(capa).toBeVisible();
  await expect
    .poll(() =>
      capa.evaluate(
        (img: HTMLImageElement) => `${String(img.naturalWidth)}x${String(img.naturalHeight)}`,
      ),
    )
    .toBe('1920x1440');
  const tipo = await capa.evaluate(async (img: HTMLImageElement) => {
    const resposta = await fetch(img.currentSrc || img.src);
    return (await resposta.blob()).type;
  });
  expect(tipo).toBe('image/webp');

  // A foto enviada entra na biblioteca e pode ser usada em outro lugar.
  await page.goto('/admin/fotos');
  await page.getByRole('button', { name: 'Trocar foto do sobre' }).click();
  await page
    .getByRole('group', { name: 'Biblioteca de fotos para foto do sobre' })
    .getByRole('button')
    .first()
    .click();
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(status(page, 'Tudo salvo')).toBeVisible();
  await page.goto('/sobre');
  await expect(page.getByRole('img', { name: 'Casal na cachoeira' })).toBeVisible();
});

test('arquivo que não é foto é recusado com o motivo', async ({ page }) => {
  await abrirFotos(page);
  await page.getByRole('button', { name: 'Trocar capa da home' }).click();
  const seletor = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Enviar foto nova' }).click();
  await (
    await seletor
  ).setFiles({
    name: 'contrato.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('não é foto'),
  });
  await expect(
    page.getByRole('alert').filter({ hasText: 'Use uma foto em JPEG, PNG ou WebP.' }),
  ).toBeVisible();
});

test('restaurar tudo apaga as fotos enviadas e volta a capa original', async ({ page }) => {
  await abrirFotos(page);
  const arquivo = await jpegGrande(page);
  await page.getByRole('button', { name: 'Trocar capa da home' }).click();
  const seletor = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Enviar foto nova' }).click();
  await (await seletor).setFiles({ name: 'casal.jpg', mimeType: 'image/jpeg', buffer: arquivo });
  await page.getByRole('textbox', { name: 'Texto alternativo', exact: true }).fill('Foto enviada');
  await page.getByRole('button', { name: 'Usar esta foto' }).click();
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(status(page, 'Tudo salvo')).toBeVisible();

  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Restaurar tudo' }).click();

  // O documento salvo sumiu (o site volta à semente)...
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('ah-mvp:conteudo:v1')))
    .toBeNull();
  // ...e o arquivo sumiu do IndexedDB, não só a referência no documento.
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const pedido = indexedDB.open('ah-mvp', 1);
        const banco = await new Promise<IDBDatabase>((ok) => {
          pedido.onsuccess = () => {
            ok(pedido.result);
          };
        });
        const contar = banco.transaction('fotos').objectStore('fotos').count();
        const total = await new Promise<number>((ok) => {
          contar.onsuccess = () => {
            ok(contar.result);
          };
        });
        banco.close();
        return total;
      }),
    )
    .toBe(0);
});
