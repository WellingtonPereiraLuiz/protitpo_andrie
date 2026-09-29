# Onde parei — 29/09/2026

Branch: `feat/next-migration`, enviada ao GitHub (`origin/feat/next-migration`). Nada foi
para a `main`. Clone de trabalho: `~/Documents/projetos/protitpo_andrie` (Windows; não existe
`~/Documentos` nesta máquina).

---

## Estado em uma linha

Etapas 0, 1 e 2 concluídas. **Etapa 3 implementada**: o painel `/admin` da
`docs/specs/admin.md` (v2, aprovada com revisões) está completo nas 9 fatias, com
`npm run check` verde. É um **MVP**: grava no navegador, atrás de interfaces prontas para
trocar por um banco.

---

## Gates

| Gate                       | Estado                                                |
| -------------------------- | ----------------------------------------------------- |
| Prettier                   | ✅                                                    |
| ESLint estrito (com tipos) | ✅ app + `e2e/`                                       |
| `tsc --noEmit` estrito     | ✅ app + `tsconfig.e2e.json`                          |
| Vitest                     | ✅ 82 testes, 4 arquivos                              |
| `next build`               | ✅                                                    |
| Playwright                 | ✅ 64 testes × 2 viewports (390, 1440) = 128, com axe |
| Medição do "depois"        | ✅ `docs/evidencias/depois/medicoes.md`               |

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
| Cores       | paletas prontas, 7 cores editáveis, prévia, contraste AA, copiar paleta     |

"Ver o site" abre o site na mesma aba com a faixa "visualizando como administrador" e a
seta de volta; vale só nesta aba (sessionStorage) e com sessão ativa, então o acesso normal
nunca a vê.

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

## Decisões tomadas em 29/09 (com a liberação do dono para decidir)

| #   | Pendência                        | Decisão                                                                                                                  | Commit    |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------- |
| 1   | `/portfolio` dinâmico            | Categorias viraram páginas estáticas: `/portfolio/categoria/ensaios`, `/videos`. Nenhuma rota pública é mais ƒ.          | `257aa95` |
| 2   | Aviso de demonstração            | Fica no rodapé. O modal do protótipo interrompia a visita; o painel tem a própria faixa.                                 | —         |
| 3   | Posts sem corpo                  | Resumo + aviso; o corpo agora se escreve pelo painel.                                                                    | —         |
| 4   | Slug próprio dos cartões do blog | Mantido: permite link direto para cada post.                                                                             | —         |
| 5   | `AGENTS.md` / `CLAUDE.md`        | Commitados (o `next dev` os recria; fora do Git a árvore ficava suja), com as regras do projeto abaixo do bloco do Next. | `d81b804` |
| 6   | Fim de linha no Windows          | `.gitattributes` com `eol=lf`: clone com `autocrlf=true` sai em LF e o Prettier passa (verificado).                      | `24d8684` |
| 7   | LCP de `/portfolio` e `/blog`    | Primeira capa sem `lazy`; teste e2e confere o LCP de 5 páginas.                                                          | `fd5dcd5` |
| 8   | Contraste do site público        | `--gold` → `#7d5411`, `--muted` → `#625d57`, texto do rodapé 62%. Axe em todas as páginas públicas virou gate.           | `fd5dcd5` |

O desvio de paleta está registrado em `docs/conteudo/design-tokens.md`. As capturas em
`docs/evidencias/depois/` são da Etapa 2 e mostram as cores antigas.

---

## Site (depois do feedback no Zen, 29/09)

- Menu do celular via portal no `<body>` (o `backdrop-filter` do cabeçalho prendia o menu na
  caixa dele), com entrada e saída animadas.
- Transição entre páginas com `<ViewTransition>` (`(site)/template.tsx`); a capa do álbum
  viaja do cartão para a página. Respeita `prefers-reduced-motion`.
- Rodapé enxuto: marca, contato e créditos.

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
npx playwright install chromium firefox
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
