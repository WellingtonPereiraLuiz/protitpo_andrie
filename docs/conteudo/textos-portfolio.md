# Portfólio e álbuns

## Tela de listagem

- **Kicker:** Portfólio
- **H1:** Casamentos, ensaios e filmes

Filtro por categoria (pílulas): **Casamentos** · **Ensaios** · **Vídeos**.
Padrão: Casamentos.

Cada cartão mostra: miniatura, `{meta}`, `{nome}`, `{resumo}` (só desktop) e
`Ver as {total} fotos`, onde `total = fotos + 1` (a capa conta).

## Tela de álbum

- **Voltar:** ← Voltar ao portfólio
- `{meta}` como kicker, `{nome}` como H1
- Foto de capa, clicável (abre o lightbox na posição 0)
- `{texto}` do álbum *(editável pelo painel)*
- Grade de fotos em colunas (2 no mobile, 3 no desktop), cada uma abre o lightbox
- Pé: `{total} fotos neste álbum` + botão **Quero um dia assim** → `/contato`

### Lightbox

- Legenda: nome do álbum
- Fechar: `×` (`aria-label="Fechar"`)
- Navegação: **← Anterior** · `{posição} / {total}` · **Próxima →** (circular)

## Os seis álbuns

### 1. Marina & Téo — `marina-teo`
- **Categoria:** Casamentos
- **Meta:** Casamento · Alto Paraíso
- **Resumo:** Casamento no sítio da família, com a luz das cinco da tarde.
- **Fotos:** 9 + capa
- **Texto:**

  A Marina queria casar no sítio onde passou todas as férias de infância. O Téo só pediu espaço para dançar.

  Chegamos às três da tarde, quando a cozinha ainda cheirava a bolo e ninguém estava pronto. Às cinco, o sol baixou atrás das mangueiras e pintou o terreiro inteiro de dourado. A festa foi até o galo cantar.

### 2. Bia & Caio — `bia-caio`
- **Categoria:** Casamentos
- **Meta:** Casamento · Ji-Paraná
- **Resumo:** Cerimônia na igreja e festa no salão da cidade.
- **Fotos:** 6 + capa
- **Texto:** Uma linha só, pra testar texto curto.

### 3. Júlia & Vitor — `julia-vitor`
- **Categoria:** Casamentos
- **Meta:** Casamento · Ouro Preto do Oeste
- **Resumo:** Casamento pequeno, no quintal, com trinta convidados.
- **Fotos:** 4 + capa
- **Texto:** Trinta convidados, uma mesa comprida e muita conversa. Foi o casamento mais silencioso que já fotografei — e um dos mais bonitos.

### 4. Luana & Rafa — `luana-rafa`
- **Categoria:** Ensaios
- **Meta:** Ensaio pré-wedding · Cachoeira
- **Resumo:** Fim de tarde na cachoeira, uma semana antes do casamento.
- **Fotos:** 5 + capa
- **Texto:** Pedi que eles só caminhassem. O resto foi deles.

### 5. Esperando a Alice — `alice`
- **Categoria:** Ensaios
- **Meta:** Ensaio gestante · Em casa
- **Resumo:** Ensaio em casa, no quarto que já estava pronto pra ela.
- **Fotos:** 3 + capa
- **Texto:** A casa conta mais do que qualquer cenário. Fotografamos no quarto da Alice, que ainda não tinha chegado.

### 6. Filme · Marina & Téo — `filme-mt`
- **Categoria:** Vídeos
- **Meta:** Filme do dia · 4 min
- **Resumo:** Quadros do filme de casamento.
- **Fotos:** 3 + capa
- **Texto:** Quadros do filme. O vídeo completo entra aqui quando o Andrei publicar.

> Os `id` acima viram os slugs de `/portfolio/[slug]`.
> Os textos de tamanho deliberadamente variado (de uma linha a dois parágrafos) são um
> teste de layout — preservar essa variação.
