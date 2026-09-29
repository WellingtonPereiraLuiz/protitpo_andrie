import type { MediaId } from './media';

export type CampoId = 'nome' | 'telefone' | 'data' | 'tipo' | 'cidade';

export interface Campo {
  readonly id: CampoId;
  readonly rotulo: string;
  readonly placeholder: string;
  readonly erro: string;
  readonly autoComplete: string;
}

export const CAMPOS: readonly Campo[] = [
  {
    id: 'nome',
    rotulo: 'Nome dos noivos',
    placeholder: 'Marina e Téo',
    erro: 'Como podemos chamar vocês?',
    autoComplete: 'name',
  },
  {
    id: 'telefone',
    rotulo: 'Telefone / WhatsApp',
    placeholder: '(69) 9xxxx-xxxx',
    erro: 'Precisamos do seu telefone para responder.',
    autoComplete: 'tel',
  },
  {
    id: 'data',
    rotulo: 'Data do evento',
    placeholder: '18/07/2026',
    erro: 'Mesmo uma data aproximada ajuda.',
    autoComplete: 'off',
  },
  {
    id: 'tipo',
    rotulo: 'Tipo de serviço',
    placeholder: 'Casamento, ensaio ou vídeo',
    erro: 'Escolha o tipo de serviço.',
    autoComplete: 'off',
  },
  {
    id: 'cidade',
    rotulo: 'Cidade',
    placeholder: 'Alto Paraíso, RO',
    erro: 'Em qual cidade será?',
    autoComplete: 'address-level2',
  },
];

export const CONTATO_PAGINA = {
  kicker: 'Orçamento',
  titulo: 'Me contem sobre o dia de vocês',
  texto:
    'Preencham com calma. Ao final, o botão abre o WhatsApp com tudo isso já escrito — é só apertar enviar.',
  resumoDeErro:
    'Faltou preencher alguns campos obrigatórios. Sem eles não consigo montar a mensagem do WhatsApp.',
  notaDoBotao:
    'Nada é enviado por este site: ao tocar, abre a conversa com o Andrei no WhatsApp com o texto já escrito.',
  foto: 'p1024' satisfies MediaId,
} as const;
