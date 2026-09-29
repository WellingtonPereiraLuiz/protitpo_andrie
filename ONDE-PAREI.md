# Onde parei — 29/09/2026

Branch: `feat/next-migration`. Nada foi para a `main`. **Nada foi enviado ao GitHub** (sem
push). Clone de trabalho: `~/Documents/projetos/protitpo_andrie` (Windows; não existe
`~/Documentos` nesta máquina).

---

## Estado em uma linha

Etapas 0, 1 e 2 concluídas. **Etapa 3 implementada**: o painel `/admin` da
`docs/specs/admin.md` (v2, aprovada com revisões) está completo nas 9 fatias, com
`npm run check` verde. É um **MVP**: grava no navegador, atrás de interfaces prontas para
trocar por um banco.

---

## Gates

| Gate                       | Estado                                                     |
| -------------------------- | ---------------------------------------------------------- |
| Prettier                   | ✅                                                         |
| ESLint estrito (com tipos) | ✅ app + `e2e/`                                            |
| `tsc --noEmit` estrito     | ✅ app + `tsconfig.e2e.json`                               |
| Vitest                     | ✅ 79 testes, 4 arquivos                                   |
| `next build`               | ✅                                                         |
| Playwright                 | ✅ 47 testes × 2 viewports (390, 1440) = 94, incluindo axe |
| Medição do "depois"        | ✅ `docs/evidencias/depois/medicoes.md`                    |

Home: **129 ms / 870 ms** com o painel, contra 132 / 905 antes dele (antes do Next:
564 / 12.433 nesta máquina).

---

## O painel (Etapa 3)

Entrar em `/admin` com **`admin` / `admin`** (a tela diz isso; o login não protege nada).

| Seção       | O que faz                                                                   |
| ----------- | --------------------------------------------------------------------------- |
| Textos      | título e frase de abertura da home                                          |
| Álbuns      | adicionar, editar, reordenar, excluir; cada álbum novo ganha página própria |
| Posts       | rascunho/publicado, blocos (parágrafo, galeria, vídeo), links para álbuns   |
| Depoimentos | adicionar, editar, reordenar, remover                                       |
| Serviços    | título, texto, itens, foto; adicionar, reordenar, remover                   |
| Fotos       | 6 lugares fixos; envio de arquivo convertido para WebP ≤ 1920px             |
| Agenda      | escolher um dia e atribuir um compromisso; o site mostra só "ocupada"       |

Salvar/Descartar em todo formulário, estado visível, confirmação ao sair com alterações,
"Restaurar o original" por seção e "Restaurar tudo" (inclui fotos enviadas).

### Arquitetura (para evoluir para banco)

```
src/dados/schema.ts        schema Zod do documento inteiro; tipos do site saem daqui
src/dados/semente.ts       o conteúdo original, no formato do documento
src/dados/repositorios.ts  RepositorioDeConteudo, RepositorioDeFotos, Autenticacao
src/dados/servicos.ts      criarServicos(): o ÚNICO lugar que escolhe as implementações
src/dados/local/           MVP: localStorage, IndexedDB, credencial fixa
src/dados/conteudo-do-site.tsx  o site público lê o documento (semente → salvo)
src/admin/                 painel: estado, campos, seletor de fotos, seções
```

Para ir para banco: escrever três implementações novas (API/banco, armazenamento de
arquivos, autenticação) e trocar em `criarServicos()`. Um teste de arquitetura falha se
alguma tela importar `dados/local` ou tocar em `localStorage`/`indexedDB` direto.

---

## ⚠️ Pendências que dependem de decisão sua

1. **`/portfolio` como rota dinâmica (ƒ)** — continua lendo `?categoria=` no servidor.
2. **Aviso de demonstração** — segue em itálico no rodapé (protótipo usava modal).
3. **Posts sem corpo** — mostram resumo + aviso. Agora dá para escrever o corpo pelo painel.
4. **Três cartões do blog com slug próprio** — mantido.
5. **`AGENTS.md` e `CLAUDE.md`** gerados pelo `next dev` — fora do Git; commitar, ignorar
   ou desligar (`agentRules: false`)?
6. **`.gitattributes` com `eol=lf`** — neste clone foi resolvido com
   `git config --local core.autocrlf false`; sem isso o Prettier reprova ~67 arquivos no
   Windows.
7. **LCP de `/portfolio`** — a capa do primeiro cartão é o LCP e está `lazy`. Não corrigido.
8. **Contraste do botão do site público** — `ui.botao` usa texto claro sobre `--gold`
   (3,99:1, abaixo do AA 4,5:1). O axe achou no painel, onde foi corrigido; no site não
   mexi (decisão de design, fora da spec).

---

## Riscos aceitos no MVP (spec, seção 9)

- O que se edita aparece **só no navegador onde foi editado**.
- No navegador com conteúdo salvo, o site mostra a semente por um instante e troca ("pisca").
- Álbum/post inexistente responde **200** com "não encontrado" e `noindex` (não 404), porque
  os criados no painel só existem no navegador.
- `admin`/`admin` é pública. **Não pode ir para produção assim.**

---

## Dependências

| Pacote               | Versão     | Nota                                                |
| -------------------- | ---------- | --------------------------------------------------- |
| next                 | 16.3.6     |                                                     |
| react / react-dom    | 19.3.0     |                                                     |
| zod                  | 4.6.5      | aprovada em 29/09                                   |
| typescript           | **6.0.3**  | **NÃO 7.x**: `typescript-eslint` só aceita `<6.1.0` |
| eslint               | **9.39.5** | **NÃO 10.x**: `eslint-config-next@16` quebra no 10  |
| @playwright/test     | 1.63.0     |                                                     |
| @axe-core/playwright | 4.13.0     | aprovada (D9)                                       |
| vite-tsconfig-paths  | —          | removido (Vite resolve `tsconfigPaths` sozinho)     |

---

## Como retomar

```bash
cd ~/Documents/projetos/protitpo_andrie   # ou ~/Documentos, conforme a máquina
git checkout feat/next-migration
npm ci                                     # não npm install
npx playwright install chromium
npm run dev                                # http://localhost:3000 — painel em /admin
npm run check                              # todos os gates (usa a porta 3100)
```

`npm run check` falha se a porta 3100 estiver ocupada: o Playwright nunca reaproveita um
servidor já de pé, de propósito.

---

## O que NÃO foi verificado

- Nada fora do Chromium. Safari antigo não gera WebP pelo `canvas`: o painel recusa com
  mensagem em vez de gravar PNG, mas isso não foi visto rodando.
- Leitor de tela real (NVDA/VoiceOver): só axe e nomes acessíveis nos testes.
- Comportamento com o `localStorage` perto do limite (~5 MB).
- Nenhum deploy. Vercel não foi tocada.
