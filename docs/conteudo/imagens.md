# Imagens — inventário, conversão e substituições

## O que havia

O protótipo embutia **96 assets em base64** dentro do `index.html`. Desses, **68 eram
imagens JPEG**, somando **8.837.353 bytes (8,43 MB)** já decodificados — e cerca de 11,2 MB
na forma base64 em que ficavam guardados (o base64 infla 33%).

As 68 imagens não são 68 fotos. São **37 fotos distintas** guardadas em múltiplos recortes:
o protótipo usava `picsum.photos`, que serve recortes centrais sob medida, e o empacotador
baixou e embutiu um arquivo para cada tamanho pedido. A foto `p1043`, por exemplo, estava
guardada seis vezes: 1200×800, 900×1350, 800×1000, 800×600, 600×600 e 600×400.

Origem das 37: **33 fotos do Lorem Picsum** (que por sua vez as tira do Unsplash) e
**4 fotos que só existiam no markup**, sem passar pelo mapa de recursos.

## O que foi feito

1. **Deduplicação por foto.** Uma foto, um arquivo — o recorte de maior área. O
   `next/image` gera os tamanhos derivados sob demanda, então guardar recortes prontos é
   trabalho repetido. **68 arquivos → 37.**
2. **Conversão para WebP**, qualidade 80, `method=6`, metadados removidos.
3. **Teto de 1920px de largura.** Não houve nenhum redimensionamento: o maior original tem
   1600px, já abaixo do teto.

### Resultado

| | Arquivos | Peso |
|---|---|---|
| Antes (JPEG embutido, decodificado) | 68 | 8.837.353 B — **8,43 MB** |
| Antes (como estava no HTML, base64) | 68 | ~11,2 MB |
| Depois (WebP em `public/media/`) | **37** | 5.107.850 B — **4,87 MB** |

Redução de **42%** sobre o peso decodificado e de **57%** sobre o que o navegador
realmente baixava. A maior parte do ganho vem da deduplicação, não do codec: os JPEGs do
Picsum já vêm bem comprimidos, e em 6 dos 37 arquivos o WebP ficou até um pouco **maior**
que o JPEG (pior caso: `post-capa`, +9%). Mantive WebP mesmo assim, por uniformidade do
pipeline e porque o `next/image` reencoda na entrega — o peso que chega ao navegador é o do
derivado, não o do arquivo-mestre, e será medido na Etapa 2.

Conferência visual a 100% entre original e WebP q80 (recorte de `p1043`): sem diferença
perceptível.

### Fontes

Os 24 WOFF2 (501 KB) **não foram extraídos**. Cobriam sete subsets — `latin`, `latin-ext`,
`cyrillic`, `cyrillic-ext`, `vietnamese`, `math` e `symbols` — dos quais cinco não têm uso
em português. Na Etapa 2 as fontes vêm pelo `next/font/google`, que baixa só o necessário.

## Mapa de uso — qual arquivo em qual lugar

| Tela | Posição | Arquivo |
|---|---|---|
| Home | Hero (fundo, parallax) | `p1011.webp` |
| Home | Destaque · Marina & Téo | `p1043.webp` |
| Home | Destaque · Luana & Rafa | `p1062.webp` |
| Home | Destaque · Bia & Caio (só desktop) | `p1015.webp` |
| Home | Faixa de chamada final (parallax) | `p1015.webp` |
| Portfólio | Miniatura · Marina & Téo | `p1011.webp` |
| Portfólio | Miniatura · Bia & Caio | `p1043.webp` |
| Portfólio | Miniatura · Júlia & Vitor | `p1039.webp` |
| Portfólio | Miniatura · Luana & Rafa | `p1062.webp` |
| Portfólio | Miniatura · Esperando a Alice | `p823.webp` |
| Portfólio | Miniatura · Filme · Marina & Téo | `p1015.webp` |
| Serviços | Casamento | `p1011.webp` |
| Serviços | Ensaios | `p1062.webp` |
| Serviços | Vídeo | `p1015.webp` |
| Sobre | Retrato do fotógrafo | `retrato-sobre.webp` |
| Sobre | Faixa 1 (só desktop) | `p1062.webp` |
| Sobre | Faixa 2 (só desktop) | `sobre-3.webp` |
| Sobre | Faixa 3 (só desktop) | `p823.webp` |
| Blog | Cartão · sítio da família | `p1043.webp` |
| Blog | Cartão · horário da cerimônia | `p1039.webp` |
| Blog | Cartão · gestante em casa | `p823.webp` |
| Post | Capa (parallax) | `post-capa.webp` |
| Post | Galeria 1 | `p1039.webp` |
| Post | Galeria 2 | `p110.webp` |
| Post | Galeria 3 (só desktop) | `post-foto-3.webp` |
| Post | Miniatura do vídeo | `p1015.webp` |
| Contato | Lateral (só desktop) | `p1024.webp` |

### Álbuns

| Álbum | Capa | Fotos da galeria |
|---|---|---|
| `marina-teo` | `p1011.webp` | `p1043.webp`, `p1039.webp`, `p110.webp`, `p152.webp`, `p1024.webp`, `p1016.webp`, `p1025.webp`, `p1035.webp`, `p1040.webp` |
| `bia-caio` | `p1043.webp` | `p1036.webp`, `p1038.webp`, `p1041.webp`, `p1044.webp`, `p1047.webp`, `p1049.webp` |
| `julia-vitor` | `p1039.webp` | `p1050.webp`, `p1051.webp`, `p1053.webp`, `p1054.webp` |
| `luana-rafa` | `p1062.webp` | `p1080.webp`, `p823.webp`, `p1060.webp`, `p1063.webp`, `p1065.webp` |
| `alice` | `p823.webp` | `p1066.webp`, `p1067.webp`, `p1069.webp` |
| `filme-mt` | `p1015.webp` | `p1016.webp`, `p1018.webp`, `p1019.webp` |

### Painel (aba Fotos)

- Capa da home — `p1011.webp`
- Destaque 1 — `p1043.webp`
- Destaque 2 — `p1062.webp`
- Destaque 3 — `p1015.webp`
- Ensaios — `p823.webp`
- Foto do Sobre — `p1027.webp`
## ⚠️ Substituições de imagem — PENDENTE DE DECISÃO

O briefing pedia: *"Se alguma imagem extraída for paisagem sem relação com casamento,
troque por outra genérica de casamento, de banco de imagem livre, e anote a troca."*

Revisei as 37 fotos uma a uma, em prancha de contato (`prancha-de-contato.png`, neste diretório). **Nenhuma tem relação com casamento.**
Não é "alguma": é o acervo inteiro. O Lorem Picsum é uma coleção genérica de fotografia de
stock, sem tema. O que está no site hoje:

| Foto | Conteúdo real | Onde aparece |
|---|---|---|
| `p1011` | Mulher de canoa num lago com pinheiros | **Hero da home** e capa do álbum "Marina & Téo" |
| `p1043` | Vale do Yosemite | Capa do álbum "Bia & Caio", destaque da home, cartão do blog |
| `p1062` | **Um pug deitado numa cama** | Capa do álbum "Luana & Rafa", serviço "Ensaios" |
| `p1015` | Fiorde | Capa do álbum "Filme · Marina & Téo", serviço "Vídeo" |
| `p1039` | Cachoeira na floresta | Capa do álbum "Júlia & Vitor" |
| `p823` | Mulher de gorro vermelho com uma câmera | Capa do álbum "Esperando a Alice" |
| `p1024` | **Uma águia em voo** | Lateral da tela de Contato |
| `p1025` | **Um pug enrolado num cobertor** | Galeria de álbum |
| `p1040` | **O castelo de Neuschwanstein** | Galeria de álbum |
| `p1069` | **Uma água-viva** | Galeria de álbum |
| `p1080`, `sobre-3` | **Morangos** | Galeria de álbum e faixa do "Sobre" |
| `p1060` | **Coador de café** | Galeria de álbum |
| `p152`, `post-foto-3` | **Flores roxas** | Galeria de álbum e galeria do post |
| `retrato-sobre` | Retrato de uma mulher | **Foto do "Sobre", legendada `alt="Andrei Heck"`** |
| `p1066` | Bebê no berço | Álbum "Esperando a Alice" — **a única plausível** |
| demais 22 | Paisagens, mar, montanha, cidade, prédios | Galerias de álbum e post |

Duas consequências que não dá para resolver sozinho:

1. **É o acervo inteiro, não um ajuste.** Substituir "as que não têm relação" significa
   substituir 36 das 37.
2. **Licença.** As atuais vêm do Unsplash via Picsum: uso comercial livre, sem atribuição.
   Testei as fontes gratuitas alcançáveis desta máquina — o Pexels bloqueia sem chave (403)
   e o Openverse responde, mas seu acervo de casamento em CC0 é fotografia de arquivo dos
   anos 1920 e fotos amadoras de Flickr a no máximo 1024px. O que é CC BY exigiria uma
   página de créditos no site do cliente.

**Aguardando decisão** — ver a pergunta levantada no relatório da Etapa 1. Os nomes de
arquivo acima ficam estáveis: trocar as fotos depois é substituir arquivos em
`public/media/`, sem tocar em código.
