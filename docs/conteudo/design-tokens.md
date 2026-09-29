# Design tokens — Andrei Heck Fotografia

Extraído de `index.html` (revisão `a8c2cee`). A tela "Paleta" do protótipo já publicava
estes valores como referência oficial; os nomes de variável abaixo são os que ela declara.

## Paleta

| Nome              | Hex       | Uso                | Variável         |
| ----------------- | --------- | ------------------ | ---------------- |
| Papel             | `#F4F2EF` | Fundo principal    | `--paper`        |
| Superfície        | `#E9E6E1` | Molduras e blocos  | `--surface`      |
| Superfície quente | `#FBF7F0` | Avisos e destaques | `--surface-warm` |
| Tinta             | `#201F1D` | Texto e rodapé     | `--ink`          |
| Tinta suave       | `#3D3936` | Parágrafos         | `--ink-soft`     |
| Apagado           | `#85807A` | Legendas e kickers | `--muted`        |
| Ouro              | `#A06F24` | Links e ações      | `--gold`         |
| Ouro traço        | `#B68235` | Contornos de botão | `--gold-stroke`  |
| Erro              | `#8A3B2A` | Campo obrigatório  | `--erro`         |

Bloco `:root` publicado pelo protótipo:

```css
:root {
  --paper: #f4f2ef;
  --surface: #e9e6e1;
  --surface-warm: #fbf7f0;
  --ink: #201f1d;
  --ink-soft: #3d3936;
  --muted: #85807a;
  --line: rgba(32, 31, 29, 0.14);
  --gold: #a06f24;
  --gold-stroke: rgba(182, 130, 53, 0.55);
  --erro: #8a3b2a;
  --radius: 4px;
}
```

Atenção a duas inconsistências do protótipo, a resolver na migração:

1. `--gold-stroke` vale `#B68235` na tabela da tela de Paleta, mas `rgba(182,130,53,0.55)`
   no bloco `:root` da mesma tela. `rgb(182,130,53)` **é** `#B68235`, então os dois
   descrevem a mesma cor — muda só a opacidade. Adotar `#B68235` como token sólido e
   aplicar a opacidade no uso.
2. `--line` aparece no `:root` mas não na tabela de cores. É `rgba(32,31,29,0.14)`, ou seja
   `--ink` a 14%.

### Cores presentes no código mas ausentes da paleta oficial

Usadas em estilos inline e que precisam virar token ou ser substituídas:

| Hex             | Onde                                       | Observação                     |
| --------------- | ------------------------------------------ | ------------------------------ |
| `#2A2825`       | Fundo da área do visualizador de protótipo | Morre junto com a moldura      |
| `#F7F4EF`       | Texto sobre fundo escuro (chips ativos)    | Variante clara de `--paper`    |
| `#FFFDFB`       | Fundo de campos de formulário              | Quase branco                   |
| `#FDF6F4`       | Fundo de campo com erro                    | `--erro` a ~4%                 |
| `#E3DDD3`       | Dia ocupado no calendário                  | Variante quente de `--surface` |
| `#B9B2A8`       | Texto de chip inativo                      | Cinza claro                    |
| `#D9D3CA`       | Texto sobre o lightbox                     | Cinza claro                    |
| `#57524C`       | Links do menu                              | Entre `--ink-soft` e `--muted` |
| `#8F887E`       | Contador do lightbox                       | Próximo de `--muted`           |
| `#7D5411`       | Número de fim de semana livre              | `--gold` escurecido            |
| `#A06F24` a 14% | Fundo de pílula ativa                      | `rgba(182,130,53,0.14)`        |

## Tipografia

Duas famílias, ambas Google Fonts.

| Papel   | Família                | Pesos              | Itálico  | Uso                                  |
| ------- | ---------------------- | ------------------ | -------- | ------------------------------------ |
| Títulos | **Cormorant Garamond** | 300, 400, 500, 600 | 300, 400 | Títulos, botões e números            |
| Texto   | **Lora**               | 400, 500, 600      | 400      | Corpo de 15–17px, entrelinha 1.8–1.9 |

Pilhas usadas no protótipo:

```css
--font-heading: 'Cormorant Garamond', Georgia, serif;
--font-body: 'Lora', Georgia, serif;
```

O protótipo embute **24 arquivos WOFF2 (501 KB)** cobrindo os subsets
`latin`, `latin-ext`, `cyrillic`, `cyrillic-ext`, `vietnamese`, `math` e `symbols`.
Para um site em português só `latin` e `latin-ext` têm uso — os outros cinco subsets são
peso morto. O `next/font/google` faz esse recorte sozinho.

## Padrões recorrentes

- **Raio de borda:** `4px` em tudo (`--radius`); `3px` em chips e pílulas; `6px` só na
  moldura do protótipo, que será removida.
- **Kicker / eyebrow:** 11–12px, `letter-spacing` 0.18em, `text-transform: uppercase`, `--muted`.
- **Filtro das fotos:** `sepia(0.18) saturate(0.88) contrast(1.04)` — aplicado às fotos de
  álbum. Dá a dominante quente que unifica o material do banco de imagem.
- **Barra superior:** `rgba(244,242,239,0.92)` com `backdrop-filter: blur(8px)` e borda
  inferior `1px solid rgba(32,31,29,0.14)`.
- **Movimento:** easing `cubic-bezier(.22,.7,.2,1)`; entrada de página 400ms; revelação ao
  rolar 700ms com atraso escalonado de 70ms (teto de 3 elementos); troca de página 160ms.
  Tudo respeita `prefers-reduced-motion: reduce`.
