/** "Ana & Pedro — Ensaio" → "ana-pedro-ensaio". */
export function gerarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Um slug que ainda não está em uso: acrescenta -2, -3… quando precisa. */
export function slugUnico(texto: string, emUso: Iterable<string>, reserva = 'item'): string {
  const base = gerarSlug(texto) || reserva;
  const usados = new Set(emUso);
  if (!usados.has(base)) return base;
  let n = 2;
  while (usados.has(`${base}-${String(n)}`)) n++;
  return `${base}-${String(n)}`;
}
