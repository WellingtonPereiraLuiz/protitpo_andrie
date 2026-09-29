// Mede o tempo de carregamento da home com a metodologia de docs/evidencias/antes/medicoes.md:
// Playwright + Chromium, cache limpo a cada execução, 5 execuções por cenário, mediana.
// "Carregado" = evento `load` + o seletor `text=Chego cedo` visível.
//
// Uso: node scripts/medir-carregamento.mjs <url> [execuções]
// Ex.:  node scripts/medir-carregamento.mjs http://localhost:3100/

import { chromium } from '@playwright/test';

const url = process.argv[2];
const execucoes = Number(process.argv[3] ?? 5);
if (!url) {
  console.error('Uso: node scripts/medir-carregamento.mjs <url> [execuções]');
  process.exit(1);
}

const CENARIOS = [
  { nome: 'localhost, sem throttle', rede: null, cpu: 1 },
  {
    nome: '10 Mbps / 40 ms RTT / CPU 4x mais lenta',
    // 10 Mbps = 1.250.000 bytes/s. Upload no mesmo valor: o documento não diz outro.
    rede: { latency: 40, downloadThroughput: 1_250_000, uploadThroughput: 1_250_000 },
    cpu: 4,
  },
];

function mediana(valores) {
  const ordenados = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenados.length / 2);
  return ordenados.length % 2 ? ordenados[meio] : (ordenados[meio - 1] + ordenados[meio]) / 2;
}

const navegador = await chromium.launch();
console.log(`Chromium ${navegador.version()} · ${url} · ${String(execucoes)} execuções`);

for (const cenario of CENARIOS) {
  const tempos = [];
  let bytes = 0;
  for (let i = 0; i < execucoes; i++) {
    // Contexto novo = perfil novo = cache vazio. O CDP ainda desliga o cache por garantia.
    const contexto = await navegador.newContext();
    const pagina = await contexto.newPage();
    const cdp = await contexto.newCDPSession(pagina);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (cenario.rede) {
      await cdp.send('Network.emulateNetworkConditions', { offline: false, ...cenario.rede });
    }
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: cenario.cpu });

    let transferidos = 0;
    cdp.on('Network.loadingFinished', (e) => {
      transferidos += e.encodedDataLength;
    });

    const inicio = performance.now();
    await pagina.goto(url, { waitUntil: 'load', timeout: 120_000 });
    await pagina.locator('text=Chego cedo').first().waitFor({ state: 'visible', timeout: 120_000 });
    tempos.push(Math.round(performance.now() - inicio));

    bytes = transferidos;
    await contexto.close();
  }
  const ordenados = [...tempos].sort((a, b) => a - b);
  console.log(
    `${cenario.nome}: ${ordenados.join(', ')} → mediana ${String(mediana(tempos))} ms` +
      ` · transferido até "carregado" (última execução): ${bytes.toLocaleString('pt-BR')} bytes`,
  );
}

await navegador.close();
