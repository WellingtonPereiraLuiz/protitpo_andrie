# Agenda

- **Kicker:** Agenda
- **H1:** Datas livres de 2026

## Aviso (bloco destacado, `--surface-warm`)

**Este calendário é só uma consulta visual.** Nada é reservado por aqui — as datas mudam o tempo todo. Para segurar a sua, me chame no WhatsApp ou peça um orçamento.

## Legenda

- Livre
- Ocupada (exemplo)
- Fim de semana livre

## Calendário

Mobile mostra **só Novembro**; desktop mostra **Outubro, Novembro e Dezembro** de 2026.

Cabeçalho da semana: `D S T Q Q S S` (semana começa no domingo).

Datas ocupadas de exemplo:

| Mês           | Dias ocupados | Primeiro dia da grade | Total |
| ------------- | ------------- | --------------------- | ----- |
| Outubro 2026  | 3, 10, 17, 24 | quinta (offset 4)     | 31    |
| Novembro 2026 | 7, 14, 21     | domingo (offset 0)    | 30    |
| Dezembro 2026 | 5, 12, 19, 31 | terça (offset 2)      | 31    |

Resumo por mês: `{total - ocupados} datas livres`.

Estados de um dia:

- **Ocupado** — fundo `#E3DDD3`, texto `#85807A`, riscado
- **Fim de semana livre** — borda dourada `rgba(182,130,53,0.75)`, texto `#7D5411`
- **Livre** — borda `rgba(32,31,29,0.18)`
- **Vazio** — célula transparente de preenchimento

> Só Novembro é editável pelo painel; Outubro e Dezembro são fixos no código.

## Fecho

- **Botão:** Consultar minha data → `/contato`
