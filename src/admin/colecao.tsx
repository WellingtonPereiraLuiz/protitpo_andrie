'use client';

import { mover } from '@/dados/operacoes';
import estilos from './admin.module.css';

/**
 * Edita uma lista de itens dentro de um formulário: cada item vira um grupo com os próprios
 * campos e os botões Subir / Descer / Remover; "Adicionar" põe um item novo no fim.
 */
export function ItensEditaveis<T>({
  itens,
  aoMudar,
  nomeDoItem,
  novo,
  rotuloAdicionar,
  children,
}: {
  readonly itens: readonly T[];
  readonly aoMudar: (itens: T[]) => void;
  /** Nome do item para os botões e a legenda, ex.: "Depoimento de Marina & Téo". */
  readonly nomeDoItem: (item: T, indice: number) => string;
  readonly novo: () => T;
  readonly rotuloAdicionar: string;
  /** Os campos de um item. `mudar` troca o item inteiro. */
  readonly children: (item: T, indice: number, mudar: (item: T) => void) => React.ReactNode;
}) {
  return (
    <>
      {itens.map((item, i) => {
        const nome = nomeDoItem(item, i);
        return (
          <fieldset key={i} className={estilos.grupo}>
            <legend>{nome}</legend>
            {children(item, i, (atualizado) => {
              aoMudar(itens.map((x, j) => (j === i ? atualizado : x)));
            })}
            <div className={estilos.acoes}>
              <button
                type="button"
                className={estilos.botaoDiscreto}
                disabled={i === 0}
                aria-label={`Subir ${nome}`}
                onClick={() => {
                  aoMudar(mover(itens, i, i - 1));
                }}
              >
                ↑ Subir
              </button>
              <button
                type="button"
                className={estilos.botaoDiscreto}
                disabled={i === itens.length - 1}
                aria-label={`Descer ${nome}`}
                onClick={() => {
                  aoMudar(mover(itens, i, i + 1));
                }}
              >
                ↓ Descer
              </button>
              <button
                type="button"
                className={estilos.botaoPerigo}
                aria-label={`Remover ${nome}`}
                onClick={() => {
                  if (window.confirm(`Remover ${nome}? Só vale depois de Salvar.`)) {
                    aoMudar(itens.filter((_, j) => j !== i));
                  }
                }}
              >
                Remover
              </button>
            </div>
          </fieldset>
        );
      })}
      <div>
        <button
          type="button"
          className={estilos.botaoSecundario}
          onClick={() => {
            aoMudar([...itens, novo()]);
          }}
        >
          {rotuloAdicionar}
        </button>
      </div>
    </>
  );
}
