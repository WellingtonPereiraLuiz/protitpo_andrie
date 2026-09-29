# Onde parei — 29/09/2026, 01:20

Branch: `feat/next-migration`. Nada foi para a `main`.

---

## Estado em uma linha

Etapas 0 e 1 concluídas. **Etapa 2 parcial**: o site Next.js está de pé com as 9 rotas
públicas + 404, e **5 dos 7 gates estão verdes**. Falta escrever e rodar o Playwright, e
faltam as capturas e a medição do "depois". A Etapa 3 (spec do admin) não começou.

---

## Gates

| Gate                               | Estado                           |
| ---------------------------------- | -------------------------------- |
| Prettier                           | ✅ verde                         |
| ESLint estrito (com tipos)         | ✅ verde                         |
| `tsc --noEmit` estrito             | ✅ verde                         |
| Vitest                             | ✅ verde — 39 testes, 2 arquivos |
| `next build`                       | ✅ verde — 18 páginas geradas    |
| **Playwright**                     | ❌ **não escrito, não rodado**   |
| **Capturas + medição do "depois"** | ❌ **não feitas**                |

`npm run check` encadeia tudo, mas **vai falhar no `test:e2e`** porque ainda não existe
nenhum teste em `e2e/`. Os outros cinco passam.

---

## O que já está pronto

### Rotas (todas renderizando, confirmado por teste e por build)

```
/                          Home
/portfolio                 lista, filtro por categoria via ?categoria=
/portfolio/[slug]          6 álbuns, pré-gerados
/servicos
/sobre
/blog
/blog/[slug]               3 posts, pré-gerados
/agenda
/contato                   formulário que abre o WhatsApp
not-found                  404, sem cabeçalho/rodapé
```

### Regras do briefing já cumpridas

- Moldura de protótipo **removida**. O `index.html` de 12,7 MB foi apagado do repositório.
- **Desktop de verdade**: menu horizontal a partir de 880px, largura máxima de leitura de
  68ch nos textos, galerias em grade de 3 colunas. Mobile inalterado.
- Toda imagem passa por `next/image` com dimensões declaradas e `loading="lazy"` fora da
  primeira dobra.
- **Zero base64.** Há teste que falha se algum `src` tiver `base64` ou não for `/media/*.webp`.
- Sem botão flutuante de WhatsApp. Contato no menu, no rodapé e no fim das seções.
- A agenda avisa que é só consulta visual.
- O formulário monta a mensagem e abre o `wa.me` — **não grava nada, em lugar nenhum**.
- Links de rede social apontam para os perfis reais (não mais `#`).
- Sem banco, sem back-end, sem API.

### Arquitetura

```
src/
  app/
    layout.tsx              html/body, fontes via next/font
    not-found.tsx           404 fora do layout do site (por isso não herda o rodapé)
    (site)/layout.tsx       cabeçalho + main + rodapé
    (site)/**/page.tsx      as 9 rotas
  components/               site-header, site-footer, foto, ui.module.css
  content/                  TODO o conteúdo, tipado — nada de texto solto nos componentes
  lib/                      whatsapp.ts, cx.ts
scripts/media-manifest.mjs  regenera src/content/media.ts a partir de public/media/
```

---

## ⚠️ O que precisa de atenção antes de continuar

### 1. O teste da agenda é tautológico — CORRIGIR

Fiz um teste de mutação nos 39 testes. Adulterei `ocupados: [7, 14, 21]` para
`[7, 14, 22]` em `src/content/agenda.ts` e **os 39 continuaram passando**.

O motivo está em `src/__tests__/conteudo.test.ts`:

```ts
const ocupados = diasDoMes(mes).filter(...).map(...);
expect(ocupados).toEqual([...mes.ocupados]);   // compara a fonte com ela mesma
```

Compara o dado com ele mesmo. Não prova nada sobre a grade. Os três testes do bloco
`describe('agenda')` têm esse defeito.

A mutação equivalente em `whatsapp.ts` **foi pega** (1 falha em 39), então o resto da
suíte reage.

**Corrigir com valores literais esperados**, não derivados da fonte. Ex.: afirmar que em
Novembro de 2026 o dia 7 cai numa célula riscada e o dia 8 não.

### 2. `vite-tsconfig-paths` está obsoleto

O Vitest avisa a cada execução:

> The plugin "vite-tsconfig-paths" is detected. Vite now supports tsconfig paths
> resolution natively via the resolve.tsconfigPaths option.

Trocar por `resolve: { tsconfigPaths: true }` em `vitest.config.ts` e desinstalar o plugin.

### 3. `/portfolio` é rota dinâmica (ƒ), não estática

Porque lê `searchParams` para o filtro de categoria. Funciona, mas se a intenção for site
100% estático, o filtro precisa virar segmento de rota (`/portfolio/categoria/[cat]`) ou
filtro no cliente. **Decisão em aberto.**

### 4. O aviso de "isto é demonstração" ficou só no rodapé

Sugeri no relatório da Etapa 1 e apliquei sem aprovação explícita: `AVISO_DEMONSTRACAO`
em `src/content/site.ts`, renderizado em itálico discreto no rodapé. **Confirmar se é
esse o tratamento desejado** — o protótipo usava um modal de abertura.

### 5. Posts sem corpo

Dois dos três posts têm só título, data e resumo. A página deles mostra o resumo e um
aviso de que o conteúdo entra pelo painel — em vez de inventar texto. **Confirmar.**

---

## Decisões de dependência que precisam ser conhecidas

| Pacote            | Versão     | Por quê                                                                                                                                                            |
| ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| next              | 16.3.6     | estável atual                                                                                                                                                      |
| react / react-dom | 19.3.0     | exigido pelo Next 16                                                                                                                                               |
| typescript        | **6.0.3**  | **NÃO 7.0.2.** O `typescript-eslint` só aceita `>=4.8.4 <6.1.0`. Com TS 7 o gate de ESLint com tipos não roda.                                                     |
| eslint            | **9.39.5** | **NÃO 10.11.0.** O `eslint-config-next@16` embute um `eslint-plugin-react` que usa `context.getFilename()`, removido no ESLint 10 — o lint quebra com `TypeError`. |
| vitest            | 5.0.2      | estável atual                                                                                                                                                      |
| @playwright/test  | 1.63.0     | instalado, **ainda não configurado**                                                                                                                               |
| prettier          | 3.9.9      | estável atual                                                                                                                                                      |

As duas versões em negrito são rebaixamentos deliberados, cada um para manter um gate
funcionando. Reverter qualquer uma quebra o gate correspondente.

---

## Próximos passos, em ordem

1. **Corrigir os testes da agenda** (item 1 acima). Antes de qualquer coisa.
2. **Escrever o Playwright**: `playwright.config.ts` + um teste que abre `/`, navega até
   `/portfolio` e até um álbum, em 390px e em 1440px. O binário do Chromium já está
   baixado em `~/.cache/ms-playwright/chromium_headless_shell-1243`.
3. **Rodar `npm run check`** inteiro e deixar os 7 verdes.
4. **Capturas do "depois"** em 390 e 1440, em `docs/evidencias/depois/`.
5. **Medir o carregamento** com a MESMA metodologia do "antes" — o script está em
   `docs/evidencias/antes/medicoes.md`: 5 execuções, cache limpo, dois cenários
   (localhost sem throttle e 10 Mbps / 40 ms / CPU 4×). Os números do "antes" são
   **645 ms** e **11.593 ms**.
6. **Etapa 3**: escrever `docs/specs/admin.md`. O insumo já está pronto em
   `docs/conteudo/textos-painel.md`, com os 10 defeitos verificados do painel atual.
   **PARAR ali e esperar aprovação** antes de implementar qualquer coisa do admin.

---

## Como retomar

```bash
cd ~/Documentos/projetos/protitpo_andrie
git checkout feat/next-migration
npm install
npm run dev          # http://localhost:3000
```

Material de referência que não vai para o Git (está no `.gitignore`):

- `.extracao/` — o protótipo desmontado: `app.js` (código-fonte original, 30 KB),
  `template.html`, os 68 JPEGs e as 24 fontes originais, a prancha de contato.
  **Se esta pasta sumir**, dá para recriá-la a partir do `index.html` no commit `a8c2cee`.

---

## O que NÃO foi verificado

- Nada foi testado fora do Chromium headless. Firefox e Safari, nunca abertos.
- Nenhuma verificação de acessibilidade automatizada (axe ou equivalente).
- O layout desktop foi conferido por captura só no protótipo antigo; **as telas novas
  nunca foram vistas renderizadas** — só passaram por teste de unidade e build.
- Nenhum deploy. Vercel não foi tocada, conforme instruído.
