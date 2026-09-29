# Spec — Painel do fotógrafo (`/admin`)

**Estado: APROVADA com revisões — 29/09/2026.** Versão 2.

- Autor: Claude (engenheiro do projeto). Aprovação: Wellington.
- Insumo: `docs/conteudo/textos-painel.md` (painel do protótipo e os 10 defeitos verificados)
- Branch: `feat/next-migration`

### Revisões pedidas na aprovação

1. **D1 = Opção A.** O painel é um **MVP para apresentação e testes**: grava no navegador.
   Mas a estrutura tem que **poder evoluir para um banco** sem reescrever telas (seção 4).
2. **Login com um usuário genérico e fácil de digitar**: `admin` / `admin`.
3. **Tudo o que é coleção no site é editável e aumentável**: cada álbum (casamento, ensaio,
   filme) tem título, descrição etc. editáveis, e dá para **adicionar novos** para aumentar
   o currículo. O mesmo vale para as outras coleções: posts, depoimentos e serviços.
4. **A agenda funciona como agenda de verdade**: o admin escolhe um dia e **atribui esse dia
   a um compromisso**. Dia com compromisso = ocupado no site público.
5. O restante foi aprovado como estava, com as recomendações de D2–D10.

---

## 1. Problema

O protótipo tem um "painel do fotógrafo" que promete que o Andrei edita textos, troca fotos,
escreve posts e marca datas. Na prática só a **agenda** funciona; **Fotos** e **Posts** são
maquete; não tem URL, não tem login e herda cabeçalho e rodapé da vitrine. O conteúdo do
site Next.js mora em `src/content/*.ts`: hoje só um desenvolvedor muda um texto.

## 2. Objetivo

Um painel com endereço próprio onde o Andrei (ou quem estiver apresentando o MVP) **muda e
aumenta o conteúdo do site e vê o resultado no site público**, com estado sempre visível e
sem poder quebrar o site por engano. A arquitetura separa **o que o painel faz** de **onde o
dado fica guardado**, para que trocar o navegador por um banco seja uma fatia só.

## 3. Fora do escopo

- Reserva de data pelo visitante, pagamentos, contratos, área do cliente.
- Upload de vídeo.
- Mais de um usuário, papéis ou permissões.
- Editar a estrutura das páginas (ordem de seções, layout). Só **conteúdo**.
- Dados de contato, textos legais e navegação continuam no código.
- Os três "jeitos" do Sobre e os dois avisos comerciais de Serviços continuam no código:
  são textos fixos de apresentação, não coleções que crescem. Entram numa próxima versão
  se for pedido.
- Banco de dados, API e deploy. Nenhuma ação na Vercel.

---

## 4. Persistência: Opção A, pronta para evoluir

### 4.1 O que o MVP faz

- Todo o conteúdo editável vive num **documento único** (`ConteudoDoSite`), validado por um
  **schema Zod** que também gera os tipos do site público.
- O conteúdo original (hoje em `src/content/*.ts`) vira a **semente**: é o que o site mostra
  quando nada foi salvo, e é para onde "Restaurar" volta.
- O painel grava no `localStorage` (documento) e no **IndexedDB** (fotos enviadas: o
  `localStorage` tem ~5 MB e não cabe foto).
- O site público renderiza a semente no servidor (continua estático) e, **no navegador onde
  houver conteúdo salvo**, troca pelo conteúdo salvo depois de carregar. Quem nunca abriu o
  painel vê exatamente o site de hoje.

> ⚠️ Consequência aceita no MVP: o que se edita só aparece **no mesmo navegador**. Numa
> apresentação, editar no painel e abrir o site na mesma máquina funciona; outra pessoa, em
> outro aparelho, vê o original.

### 4.2 Como evolui para um banco

Três interfaces em `src/dados/` (o site público também as usa), e **nenhuma tela conhece a implementação**:

| Interface               | MVP (agora)                                | Depois (banco)                         |
| ----------------------- | ------------------------------------------ | -------------------------------------- |
| `RepositorioDeConteudo` | `localStorage`, chave `ah-mvp:conteudo:v1` | API HTTP → banco                       |
| `RepositorioDeFotos`    | IndexedDB, referência `upload:<id>`        | armazenamento de arquivos (Blob/S3)    |
| `Autenticacao`          | credencial fixa `admin`/`admin`            | autenticação de verdade (sessão/OAuth) |

- Um único ponto (`criarServicos()`) escolhe as implementações. Trocar para banco = escrever
  as três implementações novas e mudar esse ponto.
- O documento tem `versao: 1`. Mudança de formato ganha migração, não quebra dado salvo.
- O mesmo schema Zod valida o dado no navegador hoje e na API amanhã.

---

## 5. Requisitos

### 5.1 Rota, layout e acesso

| ID  | Requisito                                                                                                                                                                                                              | Corrige |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| R1  | O painel mora em `/admin`, com uma rota por seção: `textos`, `albuns`, `posts`, `depoimentos`, `servicos`, `fotos`, `agenda`. F5 mantém a seção; cada uma pode ir para os favoritos.                                   | 2       |
| R2  | Layout próprio (fora do grupo `(site)`): **sem** o cabeçalho e o rodapé de marketing.                                                                                                                                  | 1       |
| R3  | Cabeçalho do painel: "Painel do fotógrafo", **Ver o site** (nova aba) e botão **Sair**, com peso visual de botão, separado do título.                                                                                  | 5       |
| R4  | Navegação entre seções em lista vertical no desktop e faixa rolável de uma linha no mobile (390px). Nunca quebra em duas linhas. Seção atual com `aria-current="page"`.                                                | 6       |
| R5  | `/admin/*`: `noindex, nofollow`; nenhum link para o painel no site público.                                                                                                                                            | —       |
| R6  | Sem sessão, qualquer rota de `/admin` leva a `/admin/entrar`. Login com usuário e senha **`admin` / `admin`**; credencial errada mostra erro e não entra.                                                              | 7       |
| R6a | Faixa fixa no topo de todo o painel, em destaque (não em nota de rodapé): "Demonstração — o que você mudar aqui fica só neste navegador." A tela de login diz qual é a credencial, porque ela não protege nada no MVP. | 7       |

### 5.2 Salvar e restaurar

| ID  | Requisito                                                                                                                                                                               | Corrige |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| R7  | Editar **não** grava a cada tecla. Formulários têm **Salvar** e **Descartar alterações**.                                                                                               | 4       |
| R8  | Estado sempre visível: "Tudo salvo" · "Alterações não salvas" · "Salvando…" · "Erro ao salvar — [motivo]", anunciado por `aria-live`. Sair com alterações não salvas pede confirmação.  | 4       |
| R9  | **Restaurar o original** por seção **e** **Restaurar tudo** (inclui fotos enviadas e agenda). Os dois pedem confirmação e dizem o que será apagado.                                     | 8       |
| R10 | Todo conteúdo lido ou gravado passa pelo schema. Dado inválido é recusado com mensagem por campo. Dado corrompido na leitura cai na semente e o painel avisa; **nunca** derruba o site. | 9       |

### 5.3 Seções

Toda **coleção** tem: lista com **Adicionar**, **Editar**, **Excluir** (com confirmação que
diz o nome) e ordem (**Subir** / **Descer**). Tudo o que é criado aparece no site público.

**Textos.** Título e frase de abertura da home. Limites da seção 7, com contador.

**Álbuns** (casamentos, ensaios, filmes — o portfólio/currículo).

- Campos: nome, categoria (Casamentos · Ensaios · Vídeos), linha de detalhe
  (ex. "Casamento · Alto Paraíso"), resumo do cartão, texto (parágrafos), capa, fotos.
- **Adicionar álbum** cria um álbum novo com página própria em `/portfolio/<slug>`. O slug é
  gerado do nome, único, e não muda depois de criado.
- Fotos: escolher da biblioteca existente ou enviar novas; reordenar; remover.
- Excluir um álbum usado num destaque da home ou num link de post avisa antes e remove as
  referências.

**Posts.** Mesma fonte do blog público (corrige 10). Rascunho e publicado; rascunho não
aparece no site. Campos: título, data, categoria, resumo, capa e blocos (texto, galeria,
vídeo). Resumo "N publicados · N rascunhos" calculado.

**Depoimentos.** Autor e texto. Aparecem na home.

**Serviços.** Título, texto, itens (lista), foto.

**Fotos** (corrige 3). Os lugares fixos do site: Capa da home · Destaque 1 · Destaque 2 ·
Destaque 3 · Ensaios (foto do serviço "Ensaios") · Foto do Sobre.

- Trocar abre um seletor de arquivo real, acionado por `<button>`; arrastar é um extra.
- JPEG/PNG/WebP até 15 MB; convertido no navegador para WebP com no máximo 1920px.
- Texto alternativo obrigatório. Pré-visualização antes de salvar.

**Agenda** (revisão 4).

- Calendário mês a mês, com **mês anterior / próximo**, do mês atual até 12 meses à frente.
- Escolher um dia abre o formulário do **compromisso**: título (obrigatório, ex. "Casamento
  Marina & Téo"), tipo (Casamento · Ensaio · Vídeo · Outro), local e observação (opcionais).
  **Um compromisso por dia.**
- Dia com compromisso aparece marcado no painel, com o título. Clicar edita ou remove.
- Lista "Próximos compromissos" em ordem de data.
- No site público, dia com compromisso aparece **riscado como ocupado — sem título, tipo nem
  local** (privacidade do cliente). O site público também navega pelos meses.

### 5.4 Acessibilidade e responsividade

| ID  | Requisito                                                                                                                   |
| --- | --------------------------------------------------------------------------------------------------------------------------- |
| R16 | Todo controle é `<button>`, `<a>` ou campo nativo. Nada clicável em `<span>`.                                               |
| R17 | Todo campo tem `<label>` visível; erros ligados por `aria-describedby`.                                                     |
| R18 | Funciona inteiro em 390px e em 1440px, sem rolagem horizontal, só no teclado. Dias da agenda: `<button>` com nome completo. |

---

## 6. Critérios de aceitação

Cada item vira teste; nenhuma fatia está pronta sem os seus testes verdes em `npm run check`.

1. `/admin/posts` aberto direto, depois F5: continua em Posts. _(Playwright)_
2. Em `/admin/*` não existe a "Navegação principal" nem o rodapé do site. _(Playwright)_
3. `/admin` sem sessão → `/admin/entrar`; `admin`/`errada` mostra erro; `admin`/`admin`
   entra. _(Playwright)_
4. Digitar num campo não muda o conteúdo salvo até **Salvar**; **Descartar** volta ao salvo.
   _(Vitest + Playwright)_
5. Conteúdo que viola o schema é recusado com a mensagem do campo. _(Vitest)_
6. Conteúdo corrompido no `localStorage` não derruba o site: a home mostra a semente e o
   painel avisa. _(Vitest + Playwright)_
7. **Restaurar tudo** volta textos, coleções, fotos e agenda à semente. _(Vitest + Playwright)_
8. Rascunho não aparece em `/blog`; publicado aparece. _(Playwright)_
9. Um post criado no painel aparece em `/blog` sem outra alteração. _(Playwright)_
10. Atribuir 8/11/2026 a um compromisso no painel risca o dia 8 em `/agenda`, e o título do
    compromisso **não** aparece em `/agenda`. _(Playwright)_
11. Trocar a "Capa da home" por uma imagem de 4000px grava um WebP de até 1920px, com o alt
    informado, e a home passa a mostrá-la. _(Playwright)_
12. axe sem violações sérias ou críticas no painel em 390 e 1440. _(Playwright + axe)_
13. Todos os gates continuam verdes; a medição da home (`scripts/medir-carregamento.mjs`) não
    piora mais que 10% em nenhum cenário.
14. **Adicionar álbum** "Ana & Pedro" (Ensaios) faz o cartão aparecer em
    `/portfolio?categoria=Ensaios` e a página `/portfolio/ana-pedro` abrir com o texto
    salvo. _(Playwright)_
15. Editar o nome e a descrição de um álbum existente muda o cartão e a página. _(Playwright)_
16. As telas do painel não importam `localStorage`/IndexedDB direto: só as interfaces de
    4.2. _(Vitest: teste de arquitetura sobre os imports)_

## 7. Limites

| Campo                 | Limite                                               |
| --------------------- | ---------------------------------------------------- |
| Título da home        | 60 caracteres                                        |
| Frase de abertura     | 140 caracteres                                       |
| Nome de álbum         | 60 caracteres                                        |
| Texto do álbum        | 2.000 caracteres                                     |
| Resumo (álbum / post) | 200 caracteres                                       |
| Título do post        | 90 caracteres                                        |
| Título do compromisso | 80 caracteres                                        |
| Foto enviada          | JPEG/PNG/WebP, até 15 MB, gravada como WebP ≤ 1920px |

## 8. Fatias de implementação

1. **Schema + semente + repositórios** (sem mudança visível). Critérios 5, 6 (parte Vitest), 16.
2. **Site público lê o conteúdo salvo**: páginas passam a usar o documento; rotas de álbum e
   post aceitam slugs criados no painel. Critério 13 medido aqui.
3. **Rota, layout e login** do `/admin`. Critérios 1, 2, 3.
4. **Agenda** com compromissos (pública e painel). Critério 10.
5. **Textos** + salvar/descartar/restaurar. Critérios 4, 7.
6. **Álbuns** com adicionar/editar/excluir. Critérios 14, 15.
7. **Posts**, **depoimentos** e **serviços**. Critérios 8, 9.
8. **Fotos** com envio e conversão. Critério 11.
9. **Acessibilidade** (axe) e medição final. Critérios 12, 13.

## 9. Riscos

- **O site público passa a carregar o conteúdo em JavaScript** para poder trocar pela versão
  salva. Mitigação: critério 13 (no máximo +10% na medição). Se estourar, **paro e reporto**.
- **Troca visível ("pisca")** no navegador que tem conteúdo salvo: o HTML chega com a semente
  e troca depois de carregar. Aceito no MVP; some quando houver banco.
- **Slugs criados no painel** não existem no build. As rotas de álbum e post renderizam sob
  demanda para slugs desconhecidos e resolvem no navegador; um slug que não existe em lugar
  nenhum mostra "não encontrado" com status 200 (não 404) e `noindex`. Corrigido quando
  houver banco.
- **Credencial pública** (`admin`/`admin`): o painel não protege nada no MVP; está dito na
  tela (R6a). **Não pode ir para produção assim.**
- Novas dependências: `zod` (aprovada) e `@axe-core/playwright` (D9, aprovada).

## Decisões

| #   | Decisão                                  | Resposta                                                                                    |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| D1  | Onde o conteúdo fica guardado            | **A — navegador**, estruturado para evoluir para banco (4.2)                                |
| D2  | Ferramenta de CMS                        | Não se aplica (Opção A)                                                                     |
| D3  | Login                                    | `admin` / `admin`, usuário único                                                            |
| D4  | O que é editável                         | Textos da home + **todas as coleções**: álbuns, posts, depoimentos, serviços; fotos; agenda |
| D5  | Criar e excluir álbuns                   | **Sim** (revisão 3)                                                                         |
| D6  | A foto "Ensaios"                         | Foto do serviço "Ensaios" em `/servicos`                                                    |
| D7  | Rascunho "Checklist para o dia anterior" | Descartado                                                                                  |
| D8  | Meses da agenda                          | Do mês atual até 12 meses à frente, com navegação                                           |
| D9  | `@axe-core/playwright`                   | Sim                                                                                         |
| D10 | Limites                                  | Como na seção 7                                                                             |
| D11 | Validação                                | Zod (aprovado em 29/09/2026)                                                                |

## O que esta spec não verificou

- Como o Andrei usa o painel hoje: tudo parte do código do protótipo.
- Comportamento em Safari/Firefox do IndexedDB e da conversão para WebP via `canvas`
  (Safari antigo não gera WebP pelo `canvas`; os testes rodam só no Chromium).
