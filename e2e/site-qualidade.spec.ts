import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PALETAS_PRONTAS } from '../src/content/tema';
import { CHAVE_DO_CONTEUDO } from '../src/dados/local/conteudo-local';
import { copiaDaSemente } from '../src/dados/semente';

const PAGINAS = [
  '/',
  '/portfolio',
  '/portfolio/categoria/ensaios',
  '/portfolio/marina-teo',
  '/servicos',
  '/sobre',
  '/blog',
  '/blog/casamento-no-sitio-da-familia',
  '/agenda',
  '/contato',
  '/nao-existe',
] as const;

for (const rota of PAGINAS) {
  test(`${rota}: sem violações graves de acessibilidade (WCAG 2.1 AA)`, async ({ page }) => {
    await page.goto(rota, { waitUntil: 'networkidle' });
    const resultado = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const graves = resultado.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    expect(graves).toEqual([]);
  });
}

// A maior imagem da primeira dobra (LCP) nunca pode esperar o lazy loading.
for (const rota of ['/', '/portfolio', '/portfolio/marina-teo', '/sobre', '/blog'] as const) {
  test(`${rota}: a imagem do LCP não é lazy`, async ({ page }) => {
    await page.goto(rota, { waitUntil: 'networkidle' });
    const lcp = await page.evaluate(
      () =>
        new Promise<{ tag: string; loading: string | null }>((resolver) => {
          new PerformanceObserver((lista) => {
            const ultima = lista.getEntries().at(-1) as
              (PerformanceEntry & { element?: Element | null }) | undefined;
            const el = ultima?.element ?? null;
            resolver({ tag: el?.tagName ?? '', loading: el?.getAttribute('loading') ?? null });
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        }),
    );
    expect(lcp.tag).toBe('IMG');
    expect(lcp.loading).not.toBe('lazy');
  });
}

// A paleta escura é a que mais arrisca contraste: o site inteiro tem que continuar legível.
test('com a paleta Noite, a home e o portfólio seguem sem violações graves', async ({ page }) => {
  const noite = PALETAS_PRONTAS.find((p) => p.nome === 'Noite');
  if (!noite) throw new Error('paleta Noite ausente');
  const conteudo = { ...copiaDaSemente(), tema: { nome: noite.nome, cores: { ...noite.cores } } };
  await page.addInitScript(
    ([chave, dado]) => {
      if (chave && dado) localStorage.setItem(chave, dado);
    },
    [CHAVE_DO_CONTEUDO, JSON.stringify(conteudo)],
  );
  for (const rota of ['/', '/portfolio', '/agenda']) {
    await page.goto(rota, { waitUntil: 'networkidle' });
    await expect
      .poll(() =>
        page.evaluate(() =>
          getComputedStyle(document.documentElement).getPropertyValue('--paper').trim(),
        ),
      )
      .toBe('#1c1b1a');
    const resultado = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const graves = resultado.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${rota} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    expect(graves).toEqual([]);
  }
});
