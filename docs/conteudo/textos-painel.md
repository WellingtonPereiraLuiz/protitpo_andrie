# Painel administrativo — como está hoje

Este documento registra o painel **tal como o protótipo o entrega**, sem julgamento de
projeto. Serve de insumo para `docs/specs/admin.md` (Etapa 3). O que está errado nele
está listado no fim, verificado no código.

## Tela de acesso (`login`)

Sem cabeçalho e sem rodapé.

- **Faixa de aviso:** Demonstração — nada é salvo em servidor
- **Título:** Painel do fotógrafo
- **Subtítulo:** Área onde o Andrei edita os textos, troca as fotos e marca datas.
- **Campo:** E-mail — placeholder `ahgestao@gmail.com`
- **Campo:** Senha — placeholder `••••••••`
- **Botão:** Entrar
- **Nota de rodapé:** Nesta demonstração qualquer dado entra. As alterações ficam salvas só neste navegador.

O botão **Entrar** não lê os campos: chama `this.go("painel")` direto.

## Painel (`painel`)

- **Faixa de aviso:** Demonstração — as alterações ficam salvas só neste navegador
- **H1:** Painel do fotógrafo + link **Sair**
- **Abas:** Textos · Álbuns · Fotos · Posts · Agenda (padrão: Textos)

### Aba Textos
- Campo **Título da home** → `heroTitle`
- Campo **Frase de abertura** → `heroSub`
- Botão **Ver na home**
- Botão **Restaurar textos originais**

Ambos os campos gravam em `localStorage` a cada tecla (`persist`). Não há botão de salvar
porque não há momento de salvar.

### Aba Álbuns
- **Aviso:** O texto de cada álbum aparece entre a foto principal e a galeria. Pode ser uma linha ou uma história inteira.
- Um `textarea` por álbum (6 no total), com nome, `{categoria} · {total} fotos` e botão **Ver álbum**
- Grava em `localStorage` sob `albumTexts[id]`

### Aba Fotos
- **Aviso:** Arraste uma foto para substituir. Nesta demonstração, a troca vale só neste navegador.
- Grade de 4 fotos no mobile, 6 no desktop, rotuladas: Capa da home · Destaque 1 · Destaque 2 · Destaque 3 · Ensaios · Foto do Sobre
- Cada uma tem o texto **Trocar**

**Nada disso funciona.** Não há `input[type=file]`, não há handler de drop e "Trocar" é um
`<span>`, não um botão. O aviso promete arrastar; a tela não aceita.

### Aba Posts
- Linha de resumo: `3 posts publicados · 1 rascunho`
- Botão **Escrever novo post**
- Lista:

  | Título | Estado |
  |---|---|
  | Casamento no sítio da família | Publicado · 12 mar 2026 |
  | Como escolher o horário da cerimônia | Publicado · 27 fev 2026 |
  | Ensaio de gestante em casa | Publicado · 14 jan 2026 |
  | Checklist para o dia anterior | Rascunho |

- Cada linha tem **Editar** e **Excluir**

**Nada disso funciona.** "Escrever novo post" é um `<button>` sem `onClick`; "Editar" e
"Excluir" são `<span>`. Os títulos são uma lista fixa, separada da lista real do blog —
repare que o quarto item ("Checklist para o dia anterior") não existe em lugar nenhum do
site público.

### Aba Agenda
- **Aviso:** Toque em um dia para alternar entre **livre** e **ocupado**. Isso muda o calendário público desta demonstração.
- Grade de Novembro 2026, cada dia é um botão que alterna o estado
- Botão **Ver agenda pública**

Esta é a **única aba totalmente funcional**. Persiste em `localStorage` sob `ocupados`.

## Persistência atual

Chave única `ah-demo` no `localStorage`, gravando:

```json
{ "heroTitle": "...", "heroSub": "...", "ocupados": [7,14,21], "albumTexts": { "marina-teo": "..." } }
```

Lida uma vez em `componentDidMount` via `setState(JSON.parse(raw))` — **sem validação
nenhuma**. Um valor corrompido na chave quebra a renderização do site inteiro, não só do
painel.

## Defeitos verificados

Confirmei no código os sete pontos levantados no briefing, e achei mais três:

1. **Cabeçalho e rodapé de marketing aparecem no painel.** `showChrome` só é falso em
   `404` e `login` — `painel` herda a vitrine inteira, inclusive o copyright.
2. **Não é uma rota.** É um valor de `state.page`. Não tem URL, não dá para marcar nos
   favoritos, não sobrevive a um F5 (volta para `home`).
3. **Abas Fotos e Posts são maquete.** Anunciam ações que nenhum handler implementa.
4. **Não existe botão de salvar.** Só "Ver na home" e "Restaurar textos originais". Toda
   tecla grava direto, sem confirmação nem estado visível.
5. **"Sair" é um link miúdo colado no título**, sem hierarquia.
6. **As abas quebram em duas linhas** desalinhadas — são pílulas em `flex-wrap` sem grade.
7. **O login aceita qualquer coisa**, e o aviso disso fica embaixo, em corpo pequeno.
8. **"Restaurar textos originais" restaura só dois campos** — `heroTitle` e `heroSub`.
   Não limpa `albumTexts` nem `ocupados`. Não existe um "restaurar tudo".
9. **A leitura do `localStorage` não valida nada.** Ver acima.
10. **A lista de posts do painel e a do blog são duas listas diferentes**, escritas à mão
    em lugares diferentes, que já divergem hoje.
