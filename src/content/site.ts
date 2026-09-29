export const SITE = {
  nome: 'Andrei Heck',
  nomeCompleto: 'Andrei Heck Fotografia',
  descricao: 'Casamentos, ensaios e vídeo em Alto Paraíso e região — Rondônia.',
  praca: 'Alto Paraíso, RO',
  desenvolvidoPor: 'TRIRREME',
  ano: 2026,
} as const;

export const CONTATO = {
  whatsapp: {
    /** Só dígitos, formato internacional — o que o wa.me espera. */
    numero: '5569995116147',
    exibicao: '+55 69 9951-6147',
  },
  email: 'ahgestao@gmail.com',
  instagram: {
    usuario: '@andreiheck',
    url: 'https://www.instagram.com/andreiheck/',
  },
  facebook: {
    usuario: '/andreiheckfoto',
    url: 'https://www.facebook.com/andreiheckfoto',
  },
} as const;

export const NAV = [
  { href: '/', rotulo: 'Home' },
  { href: '/portfolio', rotulo: 'Portfólio' },
  { href: '/servicos', rotulo: 'Serviços' },
  { href: '/sobre', rotulo: 'Sobre' },
  { href: '/blog', rotulo: 'Blog' },
  { href: '/agenda', rotulo: 'Agenda' },
  { href: '/contato', rotulo: 'Contato' },
] as const;

/**
 * As fotos deste site são genéricas de banco de imagem, não são trabalho do Andrei.
 * O protótipo avisava isso num modal de abertura; aqui o aviso vive no rodapé.
 * Ver docs/conteudo/imagens.md.
 */
export const AVISO_DEMONSTRACAO =
  'Demonstração: textos e fotos são genéricos, apenas para mostrar o layout.';
