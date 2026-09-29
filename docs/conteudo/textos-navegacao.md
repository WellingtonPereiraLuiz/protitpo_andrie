# Navegação, rodapé e contato

## Dados de contato (reais)

| Campo     | Valor                  |
| --------- | ---------------------- |
| WhatsApp  | +55 69 9951-6147       |
| E-mail    | ahgestao@gmail.com     |
| Instagram | @andreiheck            |
| Facebook  | /andreiheckfoto        |
| Praça     | Alto Paraíso, Rondônia |

No protótipo o telefone aparece em dois formatos: `+55 69 9951-6147` (menu e rodapé) e
`(69) 9951-6147` (chamada da home). Padronizar na migração.

## Cabeçalho

- Marca: **Andrei Heck** (leva para a home)
- Desktop: menu horizontal + botão **Orçamento**
- Mobile: botão hamburguer (`aria-label="Menu"`)

Itens do menu, nesta ordem: Home · Portfólio · Serviços · Sobre · Blog · Agenda · Contato

Portfólio fica marcado como ativo também quando a tela é um álbum.

## Menu mobile aberto

Fundo clicável para fechar (`aria-label="Fechar menu"`), lista de links, e no pé:

- Botão: **Pedir um orçamento**
- WhatsApp · +55 69 9951-6147
- ahgestao@gmail.com
- @andreiheck · Facebook

## Rodapé

**Coluna 1**

- Andrei Heck
- Casamentos, ensaios e vídeo em Alto Paraíso e região — Rondônia.

**Coluna 2 — Navegar** (só no desktop)

- Os mesmos sete itens do menu

**Coluna 3 — Redes e contato**

- Instagram @andreiheck
- Facebook /andreiheckfoto
- ahgestao@gmail.com
- WhatsApp · +55 69 9951-6147

**Base**

- © 2026 Andrei Heck Fotografia
- Site desenvolvido pela TRIRREME

> No protótipo os quatro links do rodapé apontam para `#`. Na migração apontam para os
> perfis reais, `mailto:` e `wa.me`.

O cabeçalho e o rodapé **não aparecem** nas telas 404 e de login do painel
(condição `showChrome` no protótipo).
