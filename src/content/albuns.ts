import type { MediaId } from './media';

export type Categoria = 'Casamentos' | 'Ensaios' | 'Vídeos';

export interface Album {
  readonly slug: string;
  readonly categoria: Categoria;
  readonly nome: string;
  readonly meta: string;
  readonly resumo: string;
  readonly texto: readonly string[];
  readonly capa: MediaId;
  readonly fotos: readonly MediaId[];
}

export const CATEGORIAS: readonly Categoria[] = ['Casamentos', 'Ensaios', 'Vídeos'];

export const ALBUNS: readonly Album[] = [
  {
    slug: 'marina-teo',
    categoria: 'Casamentos',
    nome: 'Marina & Téo',
    meta: 'Casamento · Alto Paraíso',
    resumo: 'Casamento no sítio da família, com a luz das cinco da tarde.',
    texto: [
      'A Marina queria casar no sítio onde passou todas as férias de infância. O Téo só pediu espaço para dançar.',
      'Chegamos às três da tarde, quando a cozinha ainda cheirava a bolo e ninguém estava pronto. Às cinco, o sol baixou atrás das mangueiras e pintou o terreiro inteiro de dourado. A festa foi até o galo cantar.',
    ],
    capa: 'p1011',
    fotos: ['p1043', 'p1039', 'p110', 'p152', 'p1024', 'p1016', 'p1025', 'p1035', 'p1040'],
  },
  {
    slug: 'bia-caio',
    categoria: 'Casamentos',
    nome: 'Bia & Caio',
    meta: 'Casamento · Ji-Paraná',
    resumo: 'Cerimônia na igreja e festa no salão da cidade.',
    texto: ['Uma linha só, pra testar texto curto.'],
    capa: 'p1043',
    fotos: ['p1036', 'p1038', 'p1041', 'p1044', 'p1047', 'p1049'],
  },
  {
    slug: 'julia-vitor',
    categoria: 'Casamentos',
    nome: 'Júlia & Vitor',
    meta: 'Casamento · Ouro Preto do Oeste',
    resumo: 'Casamento pequeno, no quintal, com trinta convidados.',
    texto: [
      'Trinta convidados, uma mesa comprida e muita conversa. Foi o casamento mais silencioso que já fotografei — e um dos mais bonitos.',
    ],
    capa: 'p1039',
    fotos: ['p1050', 'p1051', 'p1053', 'p1054'],
  },
  {
    slug: 'luana-rafa',
    categoria: 'Ensaios',
    nome: 'Luana & Rafa',
    meta: 'Ensaio pré-wedding · Cachoeira',
    resumo: 'Fim de tarde na cachoeira, uma semana antes do casamento.',
    texto: ['Pedi que eles só caminhassem. O resto foi deles.'],
    capa: 'p1062',
    fotos: ['p1080', 'p823', 'p1060', 'p1063', 'p1065'],
  },
  {
    slug: 'alice',
    categoria: 'Ensaios',
    nome: 'Esperando a Alice',
    meta: 'Ensaio gestante · Em casa',
    resumo: 'Ensaio em casa, no quarto que já estava pronto pra ela.',
    texto: [
      'A casa conta mais do que qualquer cenário. Fotografamos no quarto da Alice, que ainda não tinha chegado.',
    ],
    capa: 'p823',
    fotos: ['p1066', 'p1067', 'p1069'],
  },
  {
    slug: 'filme-mt',
    categoria: 'Vídeos',
    nome: 'Filme · Marina & Téo',
    meta: 'Filme do dia · 4 min',
    resumo: 'Quadros do filme de casamento.',
    texto: ['Quadros do filme. O vídeo completo entra aqui quando o Andrei publicar.'],
    capa: 'p1015',
    fotos: ['p1016', 'p1018', 'p1019'],
  },
];

export function acharAlbum(slug: string): Album | undefined {
  return ALBUNS.find((a) => a.slug === slug);
}

/** Capa + galeria, na ordem em que o lightbox navega. */
export function fotosDoAlbum(album: Album): readonly MediaId[] {
  return [album.capa, ...album.fotos];
}
