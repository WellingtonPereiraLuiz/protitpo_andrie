import type { MediaId } from './media';

export const HERO = {
  kicker: 'Fotografia de casamento · Alto Paraíso, RO',
  titulo: 'Andrei Heck',
  subtitulo: 'O que vocês sentirem naquele dia, eu guardo pra sempre.',
  foto: 'p1011' satisfies MediaId,
} as const;

export const APRESENTACAO = {
  kicker: 'Prazer, sou o Andrei',
  titulo: 'Chego cedo, fico quieto e deixo o dia acontecer',
  paragrafos: [
    'Fotografo casamentos há alguns anos aqui em Rondônia. O abraço da mãe, a mão que treme na hora do sim, a festa que vira madrugada — nada disso se repete, e é por isso que eu não tiro os olhos de vocês.',
    'No fim, vocês não recebem só fotos. Recebem de volta o que sentiram.',
  ],
} as const;

export interface Destaque {
  readonly nome: string;
  readonly tipo: string;
  readonly foto: MediaId;
  /** Slug do álbum; o href é montado no ponto de uso para o Link inferir a rota. */
  readonly slug: string;
}

export const DESTAQUES: readonly Destaque[] = [
  { nome: 'Marina & Téo', tipo: 'Casamento', foto: 'p1043', slug: 'marina-teo' },
  { nome: 'Luana & Rafa', tipo: 'Ensaio', foto: 'p1062', slug: 'luana-rafa' },
  { nome: 'Bia & Caio', tipo: 'Filme do dia', foto: 'p1015', slug: 'bia-caio' },
];

export interface Depoimento {
  readonly autor: string;
  readonly texto: string;
}

export const DEPOIMENTOS: readonly Depoimento[] = [
  {
    autor: 'Marina & Téo',
    texto:
      'Abrimos as fotos de madrugada e choramos os dois. Estava tudo ali, do jeito que a gente lembrava.',
  },
  {
    autor: 'Luana & Rafa',
    texto: 'Nem percebemos ele trabalhando. Depois vimos que ele tinha visto tudo.',
  },
];

export const CHAMADA_FINAL = {
  kicker: 'Sua data',
  titulo: 'Me contem sobre o dia de vocês',
  texto:
    'Respondo cada mensagem pessoalmente. Sem compromisso — só uma conversa pra ver se a gente combina.',
  foto: 'p1015' satisfies MediaId,
} as const;
