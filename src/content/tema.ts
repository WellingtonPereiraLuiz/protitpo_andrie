/** As cores do site que o painel deixa trocar. As demais são derivadas destas. */
export const CORES_DO_TEMA = [
  { chave: 'fundo', rotulo: 'Fundo', variavel: '--paper' },
  { chave: 'superficie', rotulo: 'Superfície', variavel: '--surface' },
  { chave: 'texto', rotulo: 'Texto', variavel: '--ink' },
  { chave: 'textoSuave', rotulo: 'Texto suave', variavel: '--ink-soft' },
  { chave: 'apagado', rotulo: 'Apagado', variavel: '--muted' },
  { chave: 'destaque', rotulo: 'Destaque', variavel: '--gold' },
  { chave: 'contorno', rotulo: 'Contorno', variavel: '--gold-stroke' },
] as const;

export type ChaveDeCor = (typeof CORES_DO_TEMA)[number]['chave'];

export interface PaletaPronta {
  readonly nome: string;
  readonly cores: Readonly<Record<ChaveDeCor, string>>;
}

/** A paleta de globals.css (já com o ajuste de contraste AA de 29/09/2026). */
export const TEMA_ORIGINAL: PaletaPronta = {
  nome: 'Original',
  cores: {
    fundo: '#f4f2ef',
    superficie: '#e9e6e1',
    texto: '#201f1d',
    textoSuave: '#3d3936',
    apagado: '#625d57',
    destaque: '#7d5411',
    contorno: '#b68235',
  },
};

/** Paletas prontas para começar. Todas passam no contraste AA (há teste para isso). */
export const PALETAS_PRONTAS: readonly PaletaPronta[] = [
  TEMA_ORIGINAL,
  {
    nome: 'Areia',
    cores: {
      fundo: '#f7f1e8',
      superficie: '#ece2d3',
      texto: '#2b2520',
      textoSuave: '#453c34',
      apagado: '#5f5449',
      destaque: '#8a4b2a',
      contorno: '#c08a62',
    },
  },
  {
    nome: 'Oliva',
    cores: {
      fundo: '#f2f3ee',
      superficie: '#e3e6dc',
      texto: '#1f231d',
      textoSuave: '#373d33',
      apagado: '#51584a',
      destaque: '#4f5f2a',
      contorno: '#8c9a63',
    },
  },
  {
    nome: 'Noite',
    cores: {
      fundo: '#1c1b1a',
      superficie: '#292725',
      texto: '#f2eee8',
      textoSuave: '#d9d3ca',
      apagado: '#aaa298',
      destaque: '#e0b36a',
      contorno: '#9c7a45',
    },
  },
];
