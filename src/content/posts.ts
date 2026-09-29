import type { MediaId } from './media';

export interface BlocoTexto {
  readonly tipo: 'texto';
  readonly texto: string;
}
export interface BlocoGaleria {
  readonly tipo: 'galeria';
  readonly fotos: readonly MediaId[];
}
export interface BlocoVideo {
  readonly tipo: 'video';
  readonly capa: MediaId;
  readonly legenda: string;
}
export type Bloco = BlocoTexto | BlocoGaleria | BlocoVideo;

/** Um item de "Links do post". `inativo` é um destino que não existe — aparece sem virar link. */
export type LinkDoPost =
  | { readonly tipo: 'album'; readonly rotulo: string; readonly slug: string }
  | { readonly tipo: 'inativo'; readonly rotulo: string };

export interface Post {
  readonly slug: string;
  readonly titulo: string;
  readonly data: string;
  readonly dataLonga: string;
  readonly categoria: string;
  readonly resumo: string;
  readonly capa: MediaId;
  /** Vazio quando o post ainda não foi escrito — a página avisa em vez de inventar. */
  readonly blocos: readonly Bloco[];
  readonly links: readonly LinkDoPost[];
}

export const POSTS: readonly Post[] = [
  {
    slug: 'casamento-no-sitio-da-familia',
    titulo: 'Casamento no sítio da família: a luz das cinco da tarde',
    data: '12 mar 2026',
    dataLonga: '12 de março de 2026',
    categoria: 'Casamentos',
    resumo: 'Por que eu sempre peço quinze minutos com o casal antes do sol sumir.',
    capa: 'post-capa',
    blocos: [
      {
        tipo: 'texto',
        texto:
          'A Marina queria casar no sítio onde passou todas as férias de infância. O Téo só pediu que houvesse espaço para dançar. Chegamos às três da tarde, quando a cozinha ainda cheirava a bolo e ninguém estava pronto — e é sempre esse o meu momento favorito.',
      },
      {
        tipo: 'texto',
        texto:
          'Às cinco, o sol baixou atrás das mangueiras e pintou o terreiro inteiro de dourado. Esse é o horário que eu peço, sempre: quinze minutos só dos dois, longe de todo mundo. Nenhuma pose. Só uma caminhada devagar até a porteira e de volta.',
      },
      { tipo: 'galeria', fotos: ['p1039', 'p110', 'post-foto-3'] },
      {
        tipo: 'texto',
        texto:
          'O filme do dia ficou com quatro minutos. Coloquei ele aqui embaixo — repare no silêncio antes da entrada.',
      },
      { tipo: 'video', capa: 'p1015', legenda: 'Filme · 4 min · exemplo' },
    ],
    links: [
      { tipo: 'album', rotulo: 'Galeria completa deste casamento', slug: 'marina-teo' },
      { tipo: 'inativo', rotulo: 'Fornecedores do dia (exemplo fictício)' },
    ],
  },
  {
    slug: 'como-escolher-o-horario-da-cerimonia',
    titulo: 'Como escolher o horário da cerimônia',
    data: '27 fev 2026',
    dataLonga: '27 de fevereiro de 2026',
    categoria: 'Dicas',
    resumo: 'Um guia curto para não acabar com as fotos sob o sol de meio-dia.',
    capa: 'p1039',
    blocos: [],
    links: [],
  },
  {
    slug: 'ensaio-de-gestante-em-casa',
    titulo: 'Ensaio de gestante em casa',
    data: '14 jan 2026',
    dataLonga: '14 de janeiro de 2026',
    categoria: 'Ensaios',
    resumo: 'A casa de vocês conta mais da história do que qualquer cenário.',
    capa: 'p823',
    blocos: [],
    links: [],
  },
];

export function acharPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
