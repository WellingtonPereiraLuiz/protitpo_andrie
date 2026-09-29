import type { MediaId } from './media';

export const SOBRE = {
  kicker: 'Sobre mim',
  titulo: 'Andrei Heck',
  retrato: 'retrato-sobre' satisfies MediaId,
  paragrafos: [
    'Comecei fotografando festas de família em Alto Paraíso, com uma câmera emprestada e muita vergonha de pedir licença. Descobri que o melhor das festas acontecia nos cantos — e que ninguém estava olhando pra lá.',
    'Hoje fotografo casamentos em Rondônia inteira. Continuo procurando os cantos.',
  ],
  faixa: ['p1062', 'sobre-3', 'p823'] satisfies MediaId[],
} as const;

export interface Jeito {
  readonly titulo: string;
  readonly texto: string;
}

export const JEITOS: readonly Jeito[] = [
  {
    titulo: 'Discreto',
    texto:
      'Não interrompo, não dirijo a cena. Se vocês esquecerem que estou ali, o trabalho está certo.',
  },
  {
    titulo: 'Por perto o dia todo',
    texto: 'Chego cedo, fico até o fim. Os melhores momentos raramente avisam antes.',
  },
  {
    titulo: 'Entrega com calma',
    texto: 'Prévia em uma semana, galeria completa em até 45 dias, revisada foto a foto.',
  },
];
