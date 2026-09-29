# Spec — Painel do fotógrafo (`/admin`)

**Estado: RASCUNHO — aguardando aprovação. Nada desta spec foi implementado.**

- Autor: Claude (engenheiro do projeto), 29/09/2026
- Insumo: `docs/conteudo/textos-painel.md` (painel do protótipo e os 10 defeitos verificados)
- Branch: `feat/next-migration`
- Aprovação necessária em: a spec inteira **e** cada item de [Decisões em aberto](#decisões-em-aberto)

---

## 1. Problema

O protótipo tem um "painel do fotógrafo" que promete que o Andrei edita textos, troca fotos,
escreve posts e marca datas. Na prática:

- só a **agenda** funciona de ponta a ponta;
- **Fotos** e **Posts** são maquete (nenhum handler, botões que são `<span>`);
- tudo o que "funciona" grava no `localStorage` **do navegador de quem editou**. O Andrei
  muda um texto no celular dele e ninguém mais vê a mudança;
- não tem URL, não tem login de verdade e herda cabeçalho e rodapé da vitrine.

No site Next.js o conteúdo mora em `src/content/*.ts`, tipado e versionado no Git. Hoje só um
desenvolvedor consegue mudar um texto do site.

## 2. Objetivo

Dar ao Andrei um lugar, com endereço próprio, onde ele **mude o conteúdo do site sem
depender de um desenvolvedor**, com um estado sempre visível ("salvo", "não salvo",
"publicando") e sem poder quebrar o site público por engano.

## 3. Fora do escopo desta spec

- Agenda com reserva de verdade, pagamentos, contratos, área do cliente.
- Upload de vídeo.
- Mais de um usuário, papéis ou permissões.
- Editar a estrutura das páginas (ordem de seções, layout). Só **conteúdo**.
- Trocar o texto legal, os dados de contato e a navegação. Ficam no código até alguém pedir.
- Deploy. Esta spec não autoriza nenhuma ação na Vercel.

---

## 4. A decisão central: onde o conteúdo editado fica guardado

Tudo o que vem depois depende desta escolha. As três opções são honestas: nenhuma é
"a mesma coisa com outro nome".

### Opção A — Demonstração honesta (navegador local)

O painel continua gravando só no navegador, como o protótipo, mas corrigido: rota própria,
schema validado, salvar explícito, restaurar tudo, fotos e posts funcionando **localmente**.

- ✅ Nenhuma infraestrutura nova. Mantém "sem banco, sem back-end, sem API".
- ✅ Serve para mostrar o fluxo ao cliente antes de ele pagar pela opção B ou C.
- ❌ **Não resolve o problema do Andrei.** O que ele edita não chega a mais ninguém.
- ❌ O site público é estático. Para refletir as edições locais, o site teria que ler o
  `localStorage` no cliente e sobrescrever o HTML depois de carregado. Isso é pior para
  desempenho e para SEO, e causa "pisca" de conteúdo.
- ⚠️ O "login" seria de mentira e precisaria dizer isso em destaque (defeito 7).

### Opção B — Conteúdo em arquivos, publicado pelo Git (recomendada)

O conteúdo sai de `src/content/*.ts` e vai para arquivos de dados (JSON/YAML/Markdown) no
repositório. O painel edita esses arquivos e, ao **publicar**, faz um commit. A Vercel
reconstrói o site. Ferramentas que fazem isso: Keystatic, Decap CMS, TinaCMS.

- ✅ Continua **sem banco e sem servidor próprio**. O Git é o banco; o histórico é o backup.
- ✅ O site público continua 100% estático e rápido. A medição do "depois" não piora.
- ✅ Login de verdade (conta do GitHub ou da ferramenta), sem guardar senha nossa.
- ✅ Todo conteúdo passa pelos mesmos gates (schema + build) antes de ir ao ar.
- ❌ Publicar leva o tempo de um build na Vercel (não medido), não é instantâneo.
- ❌ O Andrei precisa de uma conta (GitHub ou da ferramenta).
- ❌ Fotos novas entram no repositório. Precisa de limite de tamanho e conversão para WebP.
- ⚠️ **Não verificado:** compatibilidade de cada ferramenta com Next 16 + React 19. É a
  primeira coisa a checar, antes de escolher a ferramenta.

### Opção C — Back-end de verdade (banco + armazenamento de arquivos)

Banco (ex.: Postgres), armazenamento de imagens (ex.: Vercel Blob / S3), autenticação e
páginas renderizadas sob demanda ou revalidadas.

- ✅ Edição instantânea; é a base para, no futuro, agenda com reserva de verdade.
- ❌ Quebra a regra atual "sem banco, sem back-end, sem API".
- ❌ Custo mensal, credenciais, backup, LGPD e superfície de ataque passam a existir.
- ❌ É o maior esforço dos três, de longe.

**Recomendação:** **B**. Resolve o problema real do Andrei sem abrir mão do site estático
nem das regras do briefing. A é útil só como etapa de demonstração; C é desproporcional para
um site de portfólio com um único editor.

> ⛔ Os requisitos abaixo valem para qualquer opção. Onde dependem da escolha, estão
> marcados **[A]**, **[B]** ou **[C]**.

---

## 5. Requisitos

### 5.1 Rota, layout e acesso

| ID  | Requisito                                                                                                                                                                                     | Corrige |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| R1  | O painel mora em `/admin`, com sub-rotas por seção: `/admin/textos`, `/admin/albuns`, `/admin/fotos`, `/admin/posts`, `/admin/agenda`. F5 mantém a seção; cada uma pode ir para os favoritos. | 2       |
| R2  | `/admin` tem layout próprio (grupo de rotas separado de `(site)`). **Não** renderiza o cabeçalho nem o rodapé de marketing.                                                                   | 1       |
| R3  | Cabeçalho do painel: "Painel do fotógrafo", link **Ver o site** (nova aba) e botão **Sair**, com o mesmo peso visual dos outros controles, separado do título.                                | 5       |
| R4  | Navegação entre seções em lista vertical no desktop e em faixa rolável de uma linha no mobile (390px). Nunca quebra em duas linhas. A seção atual tem `aria-current="page"`.                  | 6       |
| R5  | `/admin` e sub-rotas: `noindex, nofollow`; fora do `sitemap`; nenhum link para o painel no site público.                                                                                      | —       |
| R6  | **[B][C]** Sem sessão válida, qualquer rota de `/admin` leva ao login. O login autentica de verdade; e-mail e senha errados mostram erro.                                                     | 7       |
| R6a | **[A]** Não existe tela de login. No lugar, uma faixa fixa no topo, em destaque (não em nota de rodapé): "Demonstração — o que você mudar aqui fica só neste navegador."                      | 7       |

### 5.2 Salvar, publicar e restaurar

| ID  | Requisito                                                                                                                                                                                                                                      | Corrige |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| R7  | Editar **não** grava a cada tecla. Cada seção tem **Salvar** (ou **Publicar**, em [B][C]) e **Descartar alterações**.                                                                                                                          | 4       |
| R8  | Estado sempre visível por seção: "Tudo salvo" · "Alterações não salvas" · "Salvando…" · "Erro ao salvar — [motivo]". Sair da página com alterações não salvas pede confirmação.                                                                | 4       |
| R9  | **Restaurar o original** existe por seção **e** um "Restaurar tudo". Os dois pedem confirmação e dizem exatamente o que será apagado. Em [B], restaurar é reverter para a última versão publicada.                                             | 8       |
| R10 | Todo conteúdo lido ou gravado passa por **um schema único** (ex.: Zod) que também tipa o site público. Dado inválido é rejeitado com mensagem por campo. Dado corrompido na leitura cai no original e avisa; **nunca** derruba o site público. | 9       |

### 5.3 Seções

**Textos** (R11). Título e frase de abertura da home (`HERO.titulo`, `HERO.subtitulo`), já
existentes no protótipo. Limites de tamanho com contador de caracteres (valores na seção 7).
Botão **Ver na home**. _Qualquer outro campo editável fica para decisão D4._

**Álbuns** (R12). Por álbum: texto (entre a capa e a galeria), resumo do cartão e ordem das
fotos. Lista mostra nome, `{categoria} · {n} fotos` e **Ver álbum**. Criar/excluir álbum:
decisão D5.

**Fotos** (R13 — corrige 3). Os seis lugares nomeados do protótipo: Capa da home ·
Destaque 1 · Destaque 2 · Destaque 3 · Ensaios · Foto do Sobre.

- Trocar abre um seletor de arquivo de verdade (`<input type="file" accept="image/*">`),
  acionado por um `<button>`. Arrastar e soltar é um **extra**, nunca o único caminho.
- Só JPEG/PNG/WebP, até 15 MB. Converte para WebP e limita a 1920px, como as fotos atuais
  (o teste de imagens já exige isso).
- Texto alternativo obrigatório na troca.
- Pré-visualização antes de salvar; **Descartar** volta à foto anterior.
- _"Ensaios" não tem correspondente claro no site novo: ver D6._

**Posts** (R14 — corrige 3 e 10).

- A lista do painel é **a mesma fonte** que o blog público lê. Não existe segunda lista.
- Estados: rascunho e publicado. Rascunho não aparece no site público nem em
  `generateStaticParams`.
- Criar, editar e excluir funcionam; excluir pede confirmação e diz o título.
- Editor de blocos com os três tipos que o site já renderiza: texto, galeria e vídeo (capa +
  legenda). O slug é gerado do título e fica travado depois de publicado.
- Resumo do topo ("3 posts publicados · 1 rascunho") é calculado, não escrito à mão.
- _O rascunho "Checklist para o dia anterior" só existe no painel do protótipo: ver D7._

**Agenda** (R15). Grade de cada mês de `MESES`, cada dia é um `<button>` com
`aria-pressed` que alterna livre/ocupado. Mesmo cálculo de `diasDoMes` do site público, para
os dois nunca divergirem. **Ver agenda pública**. Adicionar meses: decisão D8.

### 5.4 Acessibilidade e responsividade

| ID  | Requisito                                                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------- |
| R16 | Todo controle é `<button>`, `<a>` ou campo de formulário nativo. Nada clicável em `<span>`.                                      |
| R17 | Todo campo tem `<label>` visível; erros ligados por `aria-describedby`; estado de salvamento anunciado por `aria-live="polite"`. |
| R18 | Funciona inteiro em 390px e em 1440px, sem rolagem horizontal, só no teclado.                                                    |

---

## 6. Critérios de aceitação

Cada item vira teste. Nenhuma fatia é "pronta" sem os seus testes verdes em `npm run check`.

1. Abrir `/admin/posts` direto e dar F5 mantém a seção. _(Playwright)_
2. Em `/admin/*` não existe `navigation` "Navegação principal" nem o rodapé do site. _(Playwright)_
3. **[B][C]** `/admin` sem sessão redireciona para o login; credencial errada mostra erro e
   não entra. _(Playwright)_
4. Digitar num campo não altera o conteúdo salvo até **Salvar**; **Descartar** volta ao valor
   salvo. _(Vitest + Playwright)_
5. Um conteúdo salvo que viola o schema (ex.: título vazio, foto que não é `/media/*.webp`)
   é recusado com a mensagem do campo. _(Vitest)_
6. Conteúdo corrompido na fonte **não** derruba o site público: a home renderiza o original e
   o painel mostra o aviso. _(Vitest)_
7. "Restaurar tudo" volta textos, álbuns, fotos, posts e agenda ao original. _(Vitest)_
8. Um rascunho criado no painel não aparece em `/blog` nem gera `/blog/[slug]`; ao publicar,
   aparece nos dois. _(Vitest + build)_
9. A lista de posts do painel e a de `/blog` vêm da mesma fonte: um post criado aparece nos
   dois, sem outra alteração. _(Vitest)_
10. Marcar 8/11/2026 como ocupado no painel risca o dia 8 em `/agenda`. _(Playwright)_
11. Trocar a foto "Capa da home" por um JPEG de 4000px gera um WebP de até 1920px, com o alt
    informado, e a home passa a usá-lo. _(Vitest + Playwright)_
12. Nenhum elemento com `onClick` em `/admin` deixa de ser `button`/`a`; axe sem violações
    sérias em 390 e 1440. _(Playwright + axe; axe entra como nova dependência, ver D9)_
13. Todos os gates existentes continuam verdes; a medição de carregamento da home (script
    `scripts/medir-carregamento.mjs`) não piora mais que 10% em nenhum cenário.

## 7. Limites (propostos, para aprovação)

| Campo                 | Limite                                               |
| --------------------- | ---------------------------------------------------- |
| Título da home        | 60 caracteres                                        |
| Frase de abertura     | 140 caracteres                                       |
| Texto do álbum        | 2.000 caracteres                                     |
| Resumo (álbum / post) | 200 caracteres                                       |
| Título do post        | 90 caracteres                                        |
| Foto enviada          | JPEG/PNG/WebP, até 15 MB, gravada como WebP ≤ 1920px |

## 8. Fatias de implementação (depois da aprovação)

Cada fatia é um commit (ou uma série curta) com os seus testes, e passa por `npm run check`.

1. **Schema único** de conteúdo (sem mudar nada visível). O site público passa a ler através
   dele. Critérios 5 e 6.
2. **Rota e layout** `/admin` com as cinco seções vazias, `noindex`, navegação. Critérios 1, 2.
3. **Persistência** conforme a opção escolhida em D1 (+ login em [B][C]). Critério 3.
4. **Agenda** (a mais simples; valida a persistência de ponta a ponta). Critério 10.
5. **Textos**, com salvar/descartar/restaurar. Critérios 4, 7.
6. **Álbuns**.
7. **Posts**, com rascunho. Critérios 8, 9.
8. **Fotos**, com conversão. Critério 11.
9. Acessibilidade e medição. Critérios 12, 13.

## 9. Riscos

- **[B]** A ferramenta de CMS escolhida pode não suportar Next 16/React 19, ou exigir subir
  alguma dependência travada (TypeScript 6.0.3, ESLint 9). Se exigir, **paro e pergunto**:
  os dois rebaixamentos existem para manter gates funcionando.
- **[B]** Fotos no repositório fazem o Git crescer. Mitigação: conversão + limite; revisar
  quando passar de ~200 MB.
- **[A]** Mostrar o painel "funcionando" pode fazer o cliente acreditar que o site já é
  editável. Mitigação: faixa de demonstração em destaque (R6a).
- **[C]** Dados pessoais (e-mail/senha) passam a ser guardados: LGPD e política de senhas
  entram no escopo.
- Mover o conteúdo de `src/content/*.ts` para dados mexe em todas as páginas. Mitigação:
  fatia 1 sem mudança visível, protegida pelos testes de rota e pelo Playwright.

## Decisões em aberto

Preciso de uma resposta para cada uma antes de implementar.

| #   | Decisão                                                                                    | Minha recomendação                                                                                                  |
| --- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| D1  | Onde o conteúdo fica guardado: **A**, **B** ou **C** (seção 4).                            | **B**                                                                                                               |
| D2  | Em [B]: qual ferramenta.                                                                   | Decidir depois de verificar a compatibilidade com Next 16 + React 19 (Keystatic primeiro, por ser feita para Next). |
| D3  | Quem faz login e como (conta GitHub do Andrei? e-mail?).                                   | Uma conta só, do Andrei.                                                                                            |
| D4  | Quais textos são editáveis além do título e da frase da home.                              | Começar só com os do protótipo + textos de álbum e posts; ampliar depois.                                           |
| D5  | Criar e excluir álbuns pelo painel, ou só editar os 6 existentes.                          | Só editar, nesta versão.                                                                                            |
| D6  | O que é a foto "Ensaios" do protótipo no site novo (foto do serviço "Ensaios"? destaque?). | Foto do serviço "Ensaios" em `/servicos`.                                                                           |
| D7  | O rascunho "Checklist para o dia anterior": criar como rascunho real ou descartar.         | Descartar; não tem corpo nem aparece no site.                                                                       |
| D8  | A agenda permite adicionar meses, ou continua Out–Dez 2026.                                | Permitir os próximos 12 meses.                                                                                      |
| D9  | Adicionar `@axe-core/playwright` (dependência nova) para o critério 12.                    | Sim.                                                                                                                |
| D10 | Limites da seção 7.                                                                        | Como estão.                                                                                                         |

## O que esta spec não verificou

- Nenhuma ferramenta de CMS foi instalada ou testada com este projeto.
- Custos e limites de plano de qualquer serviço (GitHub, Vercel, banco).
- Como o Andrei usa o painel hoje, se usa: tudo aqui parte do código do protótipo, não de
  conversa com ele.
