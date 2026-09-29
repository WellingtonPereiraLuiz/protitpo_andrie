/**
 * Calendário e datas em AAAA-MM-DD, sem fuso: um dia é um dia, em qualquer lugar.
 * Tudo em UTC por dentro para o horário de verão nunca mover uma data.
 */

export const NOMES_DOS_MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

const MESES_CURTOS = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
] as const;

export const DIAS_DA_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;
const DIAS_DA_SEMANA_POR_EXTENSO = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
] as const;

/** Mês do calendário; `mes` vai de 1 a 12. */
export interface MesDoAno {
  readonly ano: number;
  readonly mes: number;
}

export type Celula =
  | { readonly tipo: 'vazio'; readonly chave: string }
  | {
      readonly tipo: 'dia';
      readonly chave: string;
      readonly data: string;
      readonly numero: number;
      readonly fimDeSemana: boolean;
    };

function doisDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

export function paraISO(ano: number, mes: number, dia: number): string {
  return `${String(ano)}-${doisDigitos(mes)}-${doisDigitos(dia)}`;
}

function partes(iso: string): [number, number, number] {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return [ano ?? 0, mes ?? 0, dia ?? 0];
}

export function diaDaSemana(iso: string): number {
  const [ano, mes, dia] = partes(iso);
  return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
}

export function diasNoMes({ ano, mes }: MesDoAno): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
}

/** A grade de um mês: células vazias até o primeiro dia da semana certo, depois os dias. */
export function celulasDoMes(m: MesDoAno): readonly Celula[] {
  const primeiro = diaDaSemana(paraISO(m.ano, m.mes, 1));
  const celulas: Celula[] = [];
  for (let i = 0; i < primeiro; i++) {
    celulas.push({ tipo: 'vazio', chave: `${String(m.ano)}-${String(m.mes)}-vazio-${String(i)}` });
  }
  for (let d = 1; d <= diasNoMes(m); d++) {
    const data = paraISO(m.ano, m.mes, d);
    const semana = diaDaSemana(data);
    celulas.push({
      tipo: 'dia',
      chave: data,
      data,
      numero: d,
      fimDeSemana: semana === 0 || semana === 6,
    });
  }
  return celulas;
}

export function somarMeses({ ano, mes }: MesDoAno, n: number): MesDoAno {
  const total = ano * 12 + (mes - 1) + n;
  return { ano: Math.floor(total / 12), mes: (total % 12) + 1 };
}

export function compararMeses(a: MesDoAno, b: MesDoAno): number {
  return a.ano * 12 + a.mes - (b.ano * 12 + b.mes);
}

export function mesDaData(iso: string): MesDoAno {
  const [ano, mes] = partes(iso);
  return { ano, mes };
}

export function nomeDoMes({ ano, mes }: MesDoAno): string {
  return `${NOMES_DOS_MESES[mes - 1] ?? ''} de ${String(ano)}`;
}

/** Hoje, no relógio de quem está usando. */
export function hojeISO(agora: Date = new Date()): string {
  return paraISO(agora.getFullYear(), agora.getMonth() + 1, agora.getDate());
}

/** "12 mar 2026" */
export function dataCurta(iso: string): string {
  const [ano, mes, dia] = partes(iso);
  return `${String(dia)} ${MESES_CURTOS[mes - 1] ?? ''} ${String(ano)}`;
}

/** "12 de março de 2026" */
export function dataLonga(iso: string): string {
  const [ano, mes, dia] = partes(iso);
  return `${String(dia)} de ${(NOMES_DOS_MESES[mes - 1] ?? '').toLowerCase()} de ${String(ano)}`;
}

/** "sábado, 7 de novembro de 2026" — nome acessível de um dia da agenda. */
export function dataPorExtenso(iso: string): string {
  return `${DIAS_DA_SEMANA_POR_EXTENSO[diaDaSemana(iso)] ?? ''}, ${dataLonga(iso)}`;
}

export function maiorMes(a: MesDoAno, b: MesDoAno): MesDoAno {
  return compararMeses(a, b) >= 0 ? a : b;
}

/**
 * Os meses que a agenda deixa ver: do mês atual (nunca antes de `inicial`) até
 * `aFrente` meses depois do mês atual.
 */
export function mesesDaAgenda(
  hoje: MesDoAno,
  inicial: MesDoAno,
  aFrente: number,
): readonly MesDoAno[] {
  const primeiro = maiorMes(inicial, hoje);
  const ultimo = somarMeses(hoje, aFrente);
  const meses: MesDoAno[] = [];
  for (let m = primeiro; compararMeses(m, ultimo) <= 0; m = somarMeses(m, 1)) meses.push(m);
  return meses;
}
