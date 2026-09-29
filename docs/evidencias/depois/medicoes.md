# Medições do "depois" — site Next.js (build de produção, revisão `16d35d3`)

Mesma metodologia de `../antes/medicoes.md`, agora com o script versionado em
`scripts/medir-carregamento.mjs`:

- Playwright + Chromium **153.0.8010.12** (chrome-headless-shell) — a mesma versão do "antes".
- Contexto novo a cada execução + `Network.setCacheDisabled` → cache limpo.
- 5 execuções por cenário, valor reportado = mediana.
- "Carregado" = evento `load` + o seletor `text=Chego cedo` visível.
- Throttle via CDP: `Network.emulateNetworkConditions` (40 ms, 1.250.000 bytes/s de
  descida e de subida) + `Emulation.setCPUThrottlingRate` 4.
- Viewport: padrão do Playwright (1280×720). **Suposição**: o documento do "antes" não
  registra o viewport nem o script usado.

Servidores:

- "depois": `next start -p 3100` sobre `npm run build`.
- "antes, esta máquina": `python -m http.server 8099` servindo o `index.html` extraído de
  `a8c2cee` (12.738.789 bytes, igual ao registrado).

Coletado em 29/09/2026, Windows 11, Node 24.16.0.

## Resultado

| Cenário                                 | Antes (registrado) | Antes (esta máquina)                           | Depois                         |
| --------------------------------------- | ------------------ | ---------------------------------------------- | ------------------------------ |
| localhost, sem throttle                 | **645 ms**         | 546, 553, 564, 576, 714 → **564 ms**           | 126, 131, 132, 137, 156 → **132 ms** |
| 10 Mbps / 40 ms RTT / CPU 4x mais lenta | **11.593 ms**      | 12407, 12417, 12433, 12460, 12480 → **12.433 ms** | 892, 893, 905, 907, 923 → **905 ms** |

Transferido até "carregado" (última execução): antes 12.900.156 bytes; depois 672.663 bytes
sem throttle e 557.154 bytes com throttle.

Comparação justa (mesma máquina, mesmo script): **4,3× mais rápido sem throttle** e
**13,7× mais rápido no cenário de rede/CPU limitados**. Contra os números registrados
do "antes" (outra máquina): 4,9× e 12,8×.

A diferença de bytes entre os dois cenários do "depois" é esperada: com rede lenta, parte
das imagens `lazy` e dos recursos de prefetch ainda não terminou quando o critério é
atingido.

## Capturas

Sem modal de abertura — o site aparece direto.

- `390x844.png` / `1440x900.png` — primeira dobra da home
- `390x844-fullpage.png` / `1440x900-fullpage.png` — home inteira
- `*-portfolio*.png` — `/portfolio`
- `*-album*.png` — `/portfolio/marina-teo`

As capturas de página inteira foram tiradas depois de rolar a página até o fim (para as
imagens `lazy` carregarem) e voltar ao topo.
