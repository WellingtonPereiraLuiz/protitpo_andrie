# Onde parei — 29/09/2026, 08:40

Branch: `feat/next-migration`. Nada foi para a `main`. Clone de trabalho:
`~/Documents/projetos/protitpo_andrie` (Windows; não existe `~/Documentos` nesta máquina).

---

## Estado em uma linha

Etapas 0, 1 e **2 concluídas — 7 de 7 gates verdes**. **Etapa 3**: a spec
`docs/specs/admin.md` está escrita e **aguarda aprovação**. Nada do admin foi implementado.

---

## Gates

| Gate                           | Estado                                              |
| ------------------------------ | --------------------------------------------------- |
| Prettier                       | ✅ verde                                            |
| ESLint estrito (com tipos)     | ✅ verde — agora também em `e2e/`                   |
| `tsc --noEmit` estrito         | ✅ verde — app + `tsconfig.e2e.json`                |
| Vitest                         | ✅ verde — 42 testes, 2 arquivos                    |
| `next build`                   | ✅ verde — 18 páginas geradas                       |
| Playwright                     | ✅ verde — 1 teste × 2 viewports (390, 1440)        |
| Capturas + medição do "depois" | ✅ `docs/evidencias/depois/` — ver `medicoes.md` lá |

`npm run check` passa inteiro, e passa **duas vezes seguidas** (antes, o `next build`
reescrevia `next-env.d.ts` e o Prettier quebrava na segunda execução).

Carregamento da home, mediana de 5, mesmo Chromium e mesmo script, nesta máquina:
**564 → 132 ms** (localhost) e **12.433 → 905 ms** (10 Mbps / 40 ms / CPU 4×).

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

### 1. Spec do admin aguardando aprovação

`docs/specs/admin.md`. Tem 10 decisões em aberto (D1–D10); a principal é D1 — onde o
conteúdo editado fica guardado. **Não implementar nada antes da aprovação.**

### 2. `vite-tsconfig-paths` — trocado, NÃO commitado

`vitest.config.ts` usa `resolve: { tsconfigPaths: true }` e o plugin foi desinstalado
(sai também `tsconfck`, `globrex` e uma cópia aninhada de `typescript@5.9.3`; nenhuma
versão travada mudou). `npm run check` verde e o aviso sumiu. **Aguarda aprovação para
commitar**, por ser mudança de dependência.

### 3. `/portfolio` é rota dinâmica (ƒ), não estática

Porque lê `searchParams` para o filtro de categoria. Funciona, mas se a intenção for site
100% estático, o filtro precisa virar segmento de rota (`/portfolio/categoria/[cat]`) ou
filtro no cliente. **Decisão em aberto.**

### 4. O aviso de "isto é demonstração" ficou só no rodapé

`AVISO_DEMONSTRACAO` em `src/content/site.ts`, em itálico discreto no rodapé. O protótipo
usava um modal de abertura. **Decisão em aberto.**

### 5. Posts sem corpo

Dois dos três posts mostram o resumo e um aviso de conteúdo em preparo, em vez de texto
inventado. **Decisão em aberto.**

### 6. Três cartões do blog com slug próprio

**Decisão em aberto.**

### 7. `AGENTS.md` e `CLAUDE.md` gerados pelo `next dev`

O Next 16 cria os dois na raiz a cada `next dev` (desliga com `agentRules: false` no
`next.config.ts`). Estão fora do Git. **Decidir: commitar, ignorar ou desligar.**

### 8. `/portfolio`: o primeiro cartão é o LCP e está `lazy`

Medido com `PerformanceObserver` no build de produção, em 390 e 1440: o LCP de
`/portfolio` é a capa do primeiro cartão (`p1011`), com `loading="lazy"` — contraria a regra
"lazy só fora da primeira dobra". O `next dev` avisa disso no console. Home e álbum estão
certos (`eager`). Não corrigido; o ajuste é passar `priority` ao primeiro cartão em
`src/app/(site)/portfolio/page.tsx`.

---

## Decisões de dependência que precisam ser conhecidas

| Pacote            | Versão     | Por quê                                                                                                                                                            |
| ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| next              | 16.3.6     | estável atual                                                                                                                                                      |
| react / react-dom | 19.3.0     | exigido pelo Next 16                                                                                                                                               |
| typescript        | **6.0.3**  | **NÃO 7.0.2.** O `typescript-eslint` só aceita `>=4.8.4 <6.1.0`. Com TS 7 o gate de ESLint com tipos não roda.                                                     |
| eslint            | **9.39.5** | **NÃO 10.11.0.** O `eslint-config-next@16` embute um `eslint-plugin-react` que usa `context.getFilename()`, removido no ESLint 10 — o lint quebra com `TypeError`. |
| vitest            | 5.0.2      | estável atual                                                                                                                                                      |
| @playwright/test  | 1.63.0     | configurado em `playwright.config.ts`                                                                                                                              |
| prettier          | 3.9.9      | estável atual                                                                                                                                                      |

`vite-tsconfig-paths` foi **removido no working tree** (ver atenção 2) — só entra no
Git com aprovação.

As duas versões em negrito são rebaixamentos deliberados, cada um para manter um gate
funcionando. Reverter qualquer uma quebra o gate correspondente.

---

## Próximos passos, em ordem

1. Aprovar (ou pedir mudanças em) `docs/specs/admin.md` e responder D1–D10.
2. Aprovar o commit da remoção do `vite-tsconfig-paths`.
3. Responder as decisões abertas 3 a 8 acima.
4. Só então: implementar o admin em fatias, na ordem da seção 8 da spec.

---

## Como retomar

```bash
cd ~/Documents/projetos/protitpo_andrie   # ou ~/Documentos, conforme a máquina
git checkout feat/next-migration
npm ci                                     # não npm install: respeita as versões travadas
npx playwright install chromium            # o navegador não vem com o repositório
npm run dev                                # http://localhost:3000
npm run check                              # os 7 gates
node scripts/medir-carregamento.mjs http://localhost:3100/   # com `next start -p 3100`
```

**Windows:** se o Git estiver com `core.autocrlf=true`, o checkout vem em CRLF e o Prettier
reprova ~67 arquivos. Neste clone foi resolvido com `git config --local core.autocrlf false`
e novo checkout. Uma `.gitattributes` com `* text=auto eol=lf` resolveria para todos —
**não aplicada, aguarda decisão**.

Material de referência que não vai para o Git (está no `.gitignore`):

- `.extracao/` — o protótipo desmontado. **Não existe nesta máquina.** Dá para recriá-la a
  partir do `index.html` no commit `a8c2cee` (`git show a8c2cee:index.html`).

---

## O que NÃO foi verificado

- Nada foi testado fora do Chromium headless. Firefox e Safari, nunca abertos.
- Nenhuma verificação de acessibilidade automatizada (axe ou equivalente).
- As telas novas foram vistas renderizadas só em `/`, `/portfolio` e `/portfolio/marina-teo`
  (capturas em `docs/evidencias/depois/`). As outras rotas passaram só por teste e build.
- O viewport da medição do "antes" não estava registrado; o "depois" usou o padrão do
  Playwright (1280×720). O "antes" foi remedido nesta máquina com o mesmo script para a
  comparação ser justa.
- Nenhum deploy. Vercel não foi tocada, conforme instruído.
