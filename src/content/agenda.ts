export interface Mes {
  readonly nome: string;
  readonly ano: number;
  /** Dias já comprometidos — exemplo fictício. */
  readonly ocupados: readonly number[];
  /** Dia da semana em que o mês começa: 0 = domingo. */
  readonly primeiroDiaDaSemana: number;
  readonly totalDeDias: number;
}

export const MESES: readonly Mes[] = [
  {
    nome: 'Outubro',
    ano: 2026,
    ocupados: [3, 10, 17, 24],
    primeiroDiaDaSemana: 4,
    totalDeDias: 31,
  },
  { nome: 'Novembro', ano: 2026, ocupados: [7, 14, 21], primeiroDiaDaSemana: 0, totalDeDias: 30 },
  {
    nome: 'Dezembro',
    ano: 2026,
    ocupados: [5, 12, 19, 31],
    primeiroDiaDaSemana: 2,
    totalDeDias: 31,
  },
];

export const DIAS_DA_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;

export type Dia =
  | { readonly tipo: 'vazio'; readonly chave: string }
  | {
      readonly tipo: 'dia';
      readonly chave: string;
      readonly numero: number;
      readonly ocupado: boolean;
      readonly fimDeSemana: boolean;
    };

export function diasDoMes(mes: Mes): readonly Dia[] {
  const dias: Dia[] = [];
  for (let i = 0; i < mes.primeiroDiaDaSemana; i++) {
    dias.push({ tipo: 'vazio', chave: `${mes.nome}-vazio-${String(i)}` });
  }
  for (let d = 1; d <= mes.totalDeDias; d++) {
    const diaDaSemana = (mes.primeiroDiaDaSemana + d - 1) % 7;
    dias.push({
      tipo: 'dia',
      chave: `${mes.nome}-${String(d)}`,
      numero: d,
      ocupado: mes.ocupados.includes(d),
      fimDeSemana: diaDaSemana === 0 || diaDaSemana === 6,
    });
  }
  return dias;
}

export function datasLivres(mes: Mes): number {
  return mes.totalDeDias - mes.ocupados.length;
}
