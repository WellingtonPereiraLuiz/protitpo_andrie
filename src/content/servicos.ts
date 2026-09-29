import type { MediaId } from './media';

export interface Servico {
  readonly slug: string;
  readonly titulo: string;
  readonly texto: string;
  readonly itens: readonly string[];
  readonly foto: MediaId;
}

export const SERVICOS: readonly Servico[] = [
  {
    slug: 'casamento',
    titulo: 'Casamento',
    texto:
      'Acompanho desde o making of até a pista vazia. Fotos em cor e preto e branco, entregues em galeria online.',
    itens: [
      'Cobertura de 8 a 12 horas',
      'Galeria online com download em alta',
      'Prévia em até 7 dias',
    ],
    foto: 'p1011',
  },
  {
    slug: 'ensaios',
    titulo: 'Ensaios',
    texto: 'Pré-wedding, gestante, família ou retrato. Ao ar livre no fim da tarde ou em estúdio.',
    itens: ['1 a 2 horas de ensaio', 'Locação combinada com vocês', 'Entre 40 e 80 fotos tratadas'],
    foto: 'p1062',
  },
  {
    slug: 'video',
    titulo: 'Vídeo',
    texto:
      'Um filme curto do dia, com os votos e os discursos. Pode ser contratado junto com a fotografia.',
    itens: [
      'Filme de 3 a 6 minutos',
      'Áudio dos votos captado',
      'Versão vertical para o Instagram',
    ],
    foto: 'p1015',
  },
];

export interface AvisoComercial {
  readonly titulo: string;
  readonly partes: readonly (string | { readonly forte: string })[];
}

export const AVISOS_COMERCIAIS: readonly AvisoComercial[] = [
  {
    titulo: 'Atendo outras cidades',
    partes: [
      'Viajo para o casamento de vocês onde for preciso. Fora de Alto Paraíso, somo uma ',
      { forte: 'taxa de locomoção' },
      ' ao orçamento — calculada pela distância e combinada antes de fechar, sem surpresa depois.',
    ],
  },
  {
    titulo: 'Ensaio em estúdio',
    partes: [
      'Quando o ensaio for em estúdio, o ',
      { forte: 'aluguel do estúdio é pago à parte' },
      ', direto ao espaço. Eu indico as opções da região e ajudo a escolher — meu valor cobre só a fotografia.',
    ],
  },
];
