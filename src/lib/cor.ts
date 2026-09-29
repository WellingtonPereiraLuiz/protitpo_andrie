/** Cores em hexadecimal (#rrggbb): contraste WCAG e misturas simples. */

export const HEX = /^#[0-9a-f]{6}$/i;

function canais(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function paraHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}

/** Luminância relativa (WCAG 2.1). */
export function luminancia(hex: string): number {
  const [r, g, b] = canais(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste entre duas cores, de 1 a 21. */
export function contraste(a: string, b: string): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number];
  return (claro + 0.05) / (escuro + 0.05);
}

/** `a` misturada com `b` na proporção `quantoDeB` (0 a 1). */
export function misturar(a: string, b: string, quantoDeB: number): string {
  const [ra, ga, ba] = canais(a);
  const [rb, gb, bb] = canais(b);
  return paraHex([
    ra + (rb - ra) * quantoDeB,
    ga + (gb - ga) * quantoDeB,
    ba + (bb - ba) * quantoDeB,
  ]);
}

/** A cor com transparência, para linhas e fundos translúcidos. */
export function comAlfa(hex: string, alfa: number): string {
  const [r, g, b] = canais(hex);
  return `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(alfa)})`;
}
