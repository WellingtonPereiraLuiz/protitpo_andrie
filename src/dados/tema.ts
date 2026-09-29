import { CORES_DO_TEMA, TEMA_ORIGINAL, type ChaveDeCor } from '@/content/tema';
import { comAlfa, contraste, luminancia, misturar } from '@/lib/cor';

export type CoresDoTema = Readonly<Record<ChaveDeCor, string>>;

export interface Tema {
  readonly nome: string;
  readonly cores: CoresDoTema;
}

/** Contraste mínimo para texto normal (WCAG 2.1 AA). */
export const MINIMO_AA = 4.5;

/**
 * Todas as variáveis CSS do site a partir das 7 cores escolhidas. As que não aparecem no
 * painel são derivadas, para o site continuar coerente em paletas claras ou escuras.
 */
export function variaveisDoTema(cores: CoresDoTema): Record<string, string> {
  const escuro = luminancia(cores.fundo) < 0.4;
  return {
    '--paper': cores.fundo,
    '--surface': cores.superficie,
    '--ink': cores.texto,
    '--ink-soft': cores.textoSuave,
    '--muted': cores.apagado,
    '--gold': cores.destaque,
    '--gold-stroke': cores.contorno,
    '--surface-warm': misturar(cores.fundo, cores.superficie, 0.35),
    '--field': escuro
      ? misturar(cores.fundo, cores.texto, 0.06)
      : misturar(cores.fundo, '#ffffff', 0.7),
    '--ink-on-dark': cores.fundo,
    '--muted-strong': misturar(cores.apagado, cores.texto, 0.3),
    '--gold-deep': misturar(cores.destaque, cores.texto, 0.3),
    '--ocupado': misturar(cores.superficie, cores.destaque, 0.08),
    '--line': comAlfa(cores.texto, 0.14),
    '--line-strong': comAlfa(cores.texto, 0.25),
  };
}

export function ehOriginal(tema: Tema): boolean {
  return CORES_DO_TEMA.every((c) => tema.cores[c.chave] === TEMA_ORIGINAL.cores[c.chave]);
}

export interface Verificacao {
  readonly rotulo: string;
  readonly razao: number;
  readonly ok: boolean;
}

/** Os pares de cor em que o site põe texto, com o contraste de cada um. */
export function verificarContraste(cores: CoresDoTema): Verificacao[] {
  const ocupado = misturar(cores.superficie, cores.destaque, 0.08);
  const pares: [string, string, string][] = [
    ['Texto sobre o fundo', cores.texto, cores.fundo],
    ['Texto suave sobre o fundo', cores.textoSuave, cores.fundo],
    ['Apagado sobre o fundo (legendas)', cores.apagado, cores.fundo],
    ['Apagado sobre a superfície', cores.apagado, cores.superficie],
    ['Destaque sobre o fundo (links, botões)', cores.destaque, cores.fundo],
    ['Apagado sobre dia ocupado (agenda)', cores.apagado, ocupado],
  ];
  return pares.map(([rotulo, a, b]) => {
    const razao = contraste(a, b);
    return { rotulo, razao, ok: razao >= MINIMO_AA };
  });
}

/** O texto que "Copiar paleta" põe na área de transferência. */
export function textoDaPaleta(tema: Tema): string {
  return [
    `Paleta "${tema.nome}"`,
    ...CORES_DO_TEMA.map((c) => `${c.rotulo}: ${tema.cores[c.chave].toUpperCase()}`),
  ].join('\n');
}
