# Contato / orçamento

- **Kicker:** Orçamento
- **H1:** Me contem sobre o dia de vocês
- **Parágrafo:** Preencham com calma. Ao final, o botão abre o WhatsApp com tudo isso já escrito — é só apertar enviar.

## Campos

| Campo      | Rótulo              | Placeholder                            | Obrigatório |
| ---------- | ------------------- | -------------------------------------- | ----------- |
| `nome`     | Nome dos noivos     | Marina e Téo                           | sim         |
| `telefone` | Telefone / WhatsApp | (69) 9xxxx-xxxx                        | sim         |
| `data`     | Data do evento      | 18/07/2026                             | sim         |
| `tipo`     | Tipo de serviço     | Casamento, ensaio ou vídeo             | sim         |
| `cidade`   | Cidade              | Alto Paraíso, RO                       | sim         |
| `mensagem` | Mensagem            | Contem um pouco de como imaginam o dia | não         |

## Mensagens de erro

| Campo      | Mensagem                                   |
| ---------- | ------------------------------------------ |
| `nome`     | Como podemos chamar vocês?                 |
| `telefone` | Precisamos do seu telefone para responder. |
| `data`     | Mesmo uma data aproximada ajuda.           |
| `tipo`     | Escolha o tipo de serviço.                 |
| `cidade`   | Em qual cidade será?                       |

Resumo no topo quando há erros:
**Faltou preencher alguns campos obrigatórios. Sem eles não consigo montar a mensagem do WhatsApp.**

## Ação

- **Botão:** Abrir o WhatsApp com a mensagem pronta
- **Nota abaixo:** Nada é enviado por este site: ao tocar, abre a conversa com o Andrei no WhatsApp com o texto já escrito.

### Mensagem montada

```
Oi, Andrei! Somos {nome}.
Data: {data} · {tipo} em {cidade}.
{mensagem}
Meu contato: {telefone}
```

Campos vazios viram `…`. No protótipo o resultado é só **exibido** em um bloco de
demonstração ("Demonstração — abriria o WhatsApp com:"). **Na migração o botão abre de
fato o `wa.me/5569995116147` com a mensagem codificada**, conforme o design aprovado.

## Coluna lateral

Imagem (só desktop) e bloco de contato:

- Ou, se preferirem
- WhatsApp · +55 69 9951-6147
- ahgestao@gmail.com
- @andreiheck

## Seletor de estados (apenas protótipo)

Havia uma barra "Ver estado: Vazio · Preenchido · Com erro" para demonstrar os três estados
do formulário. **É ferramenta de apresentação, não produto — sai na migração.**

Os dados que ela injetava, caso sirvam de fixture de teste:

```
nome:     Marina e Téo
telefone: (69) 99xxx-xxxx
data:     18/07/2026
tipo:     Casamento
cidade:   Alto Paraíso, RO
mensagem: Vamos casar no sítio da família, cerimônia às 17h. Somos uns 80 convidados.
```
