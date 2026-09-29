import type { TipoDeCompromisso } from '@/dados/schema';

/** Primeiro mês que a agenda mostra, mesmo que o relógio de quem visita esteja antes dele. */
export const MES_INICIAL_DA_AGENDA = { ano: 2026, mes: 10 } as const;

/** Quantos meses depois do mês atual a agenda deixa navegar. */
export const MESES_A_FRENTE = 12;

export interface CompromissoDeExemplo {
  readonly data: string;
  readonly titulo: string;
  readonly tipo: TipoDeCompromisso;
}

/** Datas já comprometidas — exemplo fictício, as mesmas do protótipo. */
export const COMPROMISSOS_DE_EXEMPLO: readonly CompromissoDeExemplo[] = [
  { data: '2026-10-03', titulo: 'Casamento (exemplo)', tipo: 'Casamento' },
  { data: '2026-10-10', titulo: 'Casamento (exemplo)', tipo: 'Casamento' },
  { data: '2026-10-17', titulo: 'Ensaio (exemplo)', tipo: 'Ensaio' },
  { data: '2026-10-24', titulo: 'Casamento (exemplo)', tipo: 'Casamento' },
  { data: '2026-11-07', titulo: 'Casamento (exemplo)', tipo: 'Casamento' },
  { data: '2026-11-14', titulo: 'Casamento (exemplo)', tipo: 'Casamento' },
  { data: '2026-11-21', titulo: 'Ensaio (exemplo)', tipo: 'Ensaio' },
  { data: '2026-12-05', titulo: 'Casamento (exemplo)', tipo: 'Casamento' },
  { data: '2026-12-12', titulo: 'Casamento (exemplo)', tipo: 'Casamento' },
  { data: '2026-12-19', titulo: 'Casamento (exemplo)', tipo: 'Casamento' },
  { data: '2026-12-31', titulo: 'Réveillon (exemplo)', tipo: 'Outro' },
];
