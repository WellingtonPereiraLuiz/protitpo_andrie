/**
 * Junta classes CSS descartando as ausentes.
 *
 * Com `noUncheckedIndexedAccess`, ler uma classe de um CSS Module devolve
 * `string | undefined` — interpolar isso direto num template gera `"undefined"`
 * no HTML. Este helper existe para que o tipo seja tratado, não silenciado.
 */
export function cx(...classes: readonly (string | false | null | undefined)[]): string {
  return classes.filter((c): c is string => typeof c === 'string' && c !== '').join(' ');
}
