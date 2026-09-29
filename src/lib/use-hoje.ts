import { useSyncExternalStore } from 'react';
import { hojeISO } from './calendario';

const semAssinatura = () => () => undefined;

/**
 * A data de hoje no relógio de quem está vendo. No servidor (e no primeiro render, para a
 * hidratação bater) é `null`: quem usa decide o que mostrar até saber o dia.
 */
export function useHoje(): string | null {
  return useSyncExternalStore(
    semAssinatura,
    () => hojeISO(),
    () => null,
  );
}
