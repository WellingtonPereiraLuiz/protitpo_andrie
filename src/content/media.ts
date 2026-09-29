// GERADO a partir de public/media/. Não editar à mão.
// Rode `npm run media:manifest` depois de trocar qualquer arquivo.

export type MediaId =
  | 'p1011'
  | 'p1015'
  | 'p1016'
  | 'p1018'
  | 'p1019'
  | 'p1024'
  | 'p1025'
  | 'p1027'
  | 'p1035'
  | 'p1036'
  | 'p1038'
  | 'p1039'
  | 'p1040'
  | 'p1041'
  | 'p1043'
  | 'p1044'
  | 'p1047'
  | 'p1049'
  | 'p1050'
  | 'p1051'
  | 'p1053'
  | 'p1054'
  | 'p1060'
  | 'p1062'
  | 'p1063'
  | 'p1065'
  | 'p1066'
  | 'p1067'
  | 'p1069'
  | 'p1080'
  | 'p110'
  | 'p152'
  | 'p823'
  | 'post-capa'
  | 'post-foto-3'
  | 'retrato-sobre'
  | 'sobre-3';

export interface MediaEntry {
  readonly src: `/media/${MediaId}.webp`;
  readonly width: number;
  readonly height: number;
}

export const MEDIA: Readonly<Record<MediaId, MediaEntry>> = {
  p1011: { src: '/media/p1011.webp', width: 1600, height: 1067 },
  p1015: { src: '/media/p1015.webp', width: 1600, height: 900 },
  p1016: { src: '/media/p1016.webp', width: 1600, height: 900 },
  p1018: { src: '/media/p1018.webp', width: 1600, height: 900 },
  p1019: { src: '/media/p1019.webp', width: 1600, height: 900 },
  p1024: { src: '/media/p1024.webp', width: 900, height: 1350 },
  p1025: { src: '/media/p1025.webp', width: 1080, height: 1350 },
  p1027: { src: '/media/p1027.webp', width: 600, height: 400 },
  p1035: { src: '/media/p1035.webp', width: 1600, height: 900 },
  p1036: { src: '/media/p1036.webp', width: 1200, height: 800 },
  p1038: { src: '/media/p1038.webp', width: 800, height: 1200 },
  p1039: { src: '/media/p1039.webp', width: 1200, height: 1200 },
  p1040: { src: '/media/p1040.webp', width: 1000, height: 1000 },
  p1041: { src: '/media/p1041.webp', width: 1600, height: 700 },
  p1043: { src: '/media/p1043.webp', width: 900, height: 1350 },
  p1044: { src: '/media/p1044.webp', width: 1000, height: 1000 },
  p1047: { src: '/media/p1047.webp', width: 900, height: 1350 },
  p1049: { src: '/media/p1049.webp', width: 1200, height: 800 },
  p1050: { src: '/media/p1050.webp', width: 1000, height: 1000 },
  p1051: { src: '/media/p1051.webp', width: 1200, height: 800 },
  p1053: { src: '/media/p1053.webp', width: 800, height: 1200 },
  p1054: { src: '/media/p1054.webp', width: 1600, height: 700 },
  p1060: { src: '/media/p1060.webp', width: 1000, height: 1000 },
  p1062: { src: '/media/p1062.webp', width: 1600, height: 1067 },
  p1063: { src: '/media/p1063.webp', width: 900, height: 1350 },
  p1065: { src: '/media/p1065.webp', width: 1600, height: 700 },
  p1066: { src: '/media/p1066.webp', width: 1200, height: 800 },
  p1067: { src: '/media/p1067.webp', width: 1000, height: 1000 },
  p1069: { src: '/media/p1069.webp', width: 800, height: 1200 },
  p1080: { src: '/media/p1080.webp', width: 800, height: 1200 },
  p110: { src: '/media/p110.webp', width: 1000, height: 1000 },
  p152: { src: '/media/p152.webp', width: 1600, height: 700 },
  p823: { src: '/media/p823.webp', width: 900, height: 1350 },
  'post-capa': { src: '/media/post-capa.webp', width: 1600, height: 900 },
  'post-foto-3': { src: '/media/post-foto-3.webp', width: 700, height: 900 },
  'retrato-sobre': { src: '/media/retrato-sobre.webp', width: 900, height: 1200 },
  'sobre-3': { src: '/media/sobre-3.webp', width: 800, height: 800 },
};
