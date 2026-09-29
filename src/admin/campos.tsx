'use client';

import { useEffect, useId, useRef } from 'react';
import { cx } from '@/lib/cx';
import estilos from './admin.module.css';
import type { Status } from './painel';

interface Base {
  readonly rotulo: string;
  readonly valor: string;
  readonly aoMudar: (valor: string) => void;
  readonly erro?: string | undefined;
  readonly ajuda?: string;
  /** Mostra "12 / 60" e marca quando estoura. O schema é quem recusa, ao salvar. */
  readonly limite?: number;
  readonly obrigatorio?: boolean;
}

function Rotulo({
  id,
  rotulo,
  valor,
  limite,
  obrigatorio,
}: {
  id: string;
  rotulo: string;
  valor: string;
  limite?: number | undefined;
  obrigatorio?: boolean | undefined;
}) {
  return (
    <div className={estilos.rotuloLinha}>
      <label htmlFor={id} className={estilos.rotulo}>
        {rotulo}
        {obrigatorio && <span aria-hidden="true"> *</span>}
      </label>
      {limite !== undefined && (
        <span
          className={cx(estilos.contador, valor.length > limite ? estilos.contadorEstourado : '')}
          aria-live="polite"
        >
          {valor.length} / {limite}
        </span>
      )}
    </div>
  );
}

function Rodape({
  idAjuda,
  idErro,
  ajuda,
  erro,
}: {
  idAjuda: string;
  idErro: string;
  ajuda?: string | undefined;
  erro?: string | undefined;
}) {
  return (
    <>
      {ajuda && (
        <span id={idAjuda} className={estilos.ajuda}>
          {ajuda}
        </span>
      )}
      {erro && (
        <span id={idErro} className={estilos.mensagemErro}>
          {erro}
        </span>
      )}
    </>
  );
}

function descritoPor(idAjuda: string, idErro: string, ajuda?: string, erro?: string) {
  const ids = [ajuda ? idAjuda : '', erro ? idErro : ''].filter(Boolean).join(' ');
  return ids || undefined;
}

export function CampoTexto({
  rotulo,
  valor,
  aoMudar,
  erro,
  ajuda,
  limite,
  obrigatorio,
  tipo = 'text',
  autoComplete,
}: Base & { readonly tipo?: 'text' | 'password' | 'date'; readonly autoComplete?: string }) {
  const id = useId();
  return (
    <div className={estilos.campo}>
      <Rotulo id={id} rotulo={rotulo} valor={valor} limite={limite} obrigatorio={obrigatorio} />
      <input
        id={id}
        type={tipo}
        className={cx(estilos.entrada, erro ? estilos.entradaErro : '')}
        value={valor}
        onChange={(e) => {
          aoMudar(e.target.value);
        }}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descritoPor(`${id}-ajuda`, `${id}-erro`, ajuda, erro)}
        aria-required={obrigatorio === true ? true : undefined}
        autoComplete={autoComplete}
      />
      <Rodape idAjuda={`${id}-ajuda`} idErro={`${id}-erro`} ajuda={ajuda} erro={erro} />
    </div>
  );
}

export function CampoArea({
  rotulo,
  valor,
  aoMudar,
  erro,
  ajuda,
  limite,
  obrigatorio,
  linhas = 4,
}: Base & { readonly linhas?: number }) {
  const id = useId();
  return (
    <div className={estilos.campo}>
      <Rotulo id={id} rotulo={rotulo} valor={valor} limite={limite} obrigatorio={obrigatorio} />
      <textarea
        id={id}
        rows={linhas}
        className={cx(estilos.area, erro ? estilos.entradaErro : '')}
        value={valor}
        onChange={(e) => {
          aoMudar(e.target.value);
        }}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descritoPor(`${id}-ajuda`, `${id}-erro`, ajuda, erro)}
        aria-required={obrigatorio === true ? true : undefined}
      />
      <Rodape idAjuda={`${id}-ajuda`} idErro={`${id}-erro`} ajuda={ajuda} erro={erro} />
    </div>
  );
}

export function CampoSelecao<T extends string>({
  rotulo,
  valor,
  opcoes,
  aoMudar,
  erro,
}: {
  readonly rotulo: string;
  readonly valor: T;
  readonly opcoes: readonly T[];
  readonly aoMudar: (valor: T) => void;
  readonly erro?: string | undefined;
}) {
  const id = useId();
  return (
    <div className={estilos.campo}>
      <label htmlFor={id} className={estilos.rotulo}>
        {rotulo}
      </label>
      <select
        id={id}
        className={cx(estilos.selecao, erro ? estilos.entradaErro : '')}
        value={valor}
        onChange={(e) => {
          const escolhida = opcoes.find((o) => o === e.target.value);
          if (escolhida) aoMudar(escolhida);
        }}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : undefined}
      >
        {opcoes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {erro && (
        <span id={`${id}-erro`} className={estilos.mensagemErro}>
          {erro}
        </span>
      )}
    </div>
  );
}

/**
 * Uma lista de textos editável: parágrafos de um álbum, itens de um serviço.
 * Cada linha pode subir, descer ou sair; "Adicionar" põe uma linha vazia no fim.
 */
export function ListaDeTextos({
  legenda,
  rotuloDoItem,
  itens,
  aoMudar,
  erroDe,
  caminho,
  area = false,
  limite,
}: {
  readonly legenda: string;
  readonly rotuloDoItem: string;
  readonly itens: readonly string[];
  readonly aoMudar: (itens: string[]) => void;
  readonly erroDe: (caminho: string) => string | undefined;
  /** Caminho da lista no documento, para achar o erro de cada item. */
  readonly caminho: string;
  readonly area?: boolean;
  readonly limite?: number;
}) {
  const mover = (de: number, para: number) => {
    const nova = [...itens];
    const [item] = nova.splice(de, 1);
    if (item !== undefined) nova.splice(para, 0, item);
    aoMudar(nova);
  };
  return (
    <fieldset className={estilos.grupo}>
      <legend>{legenda}</legend>
      {erroDe(caminho) && <span className={estilos.mensagemErro}>{erroDe(caminho)}</span>}
      {itens.map((item, i) => {
        const rotulo = `${rotuloDoItem} ${String(i + 1)}`;
        const mudar = (v: string) => {
          aoMudar(itens.map((x, j) => (j === i ? v : x)));
        };
        const erro = erroDe(`${caminho}.${String(i)}`);
        return (
          <div key={i} className={estilos.linhaDeItem}>
            {area ? (
              <CampoArea
                rotulo={rotulo}
                valor={item}
                aoMudar={mudar}
                erro={erro}
                {...(limite ? { limite } : {})}
              />
            ) : (
              <CampoTexto
                rotulo={rotulo}
                valor={item}
                aoMudar={mudar}
                erro={erro}
                {...(limite ? { limite } : {})}
              />
            )}
            <div className={estilos.acoes} style={{ marginTop: '28px' }}>
              <button
                type="button"
                className={estilos.botaoDiscreto}
                disabled={i === 0}
                aria-label={`Subir ${rotulo.toLowerCase()}`}
                onClick={() => {
                  mover(i, i - 1);
                }}
              >
                <Seta para="cima" />
              </button>
              <button
                type="button"
                className={estilos.botaoDiscreto}
                disabled={i === itens.length - 1}
                aria-label={`Descer ${rotulo.toLowerCase()}`}
                onClick={() => {
                  mover(i, i + 1);
                }}
              >
                <Seta para="baixo" />
              </button>
              <button
                type="button"
                className={estilos.botaoPerigo}
                aria-label={`Remover ${rotulo.toLowerCase()}`}
                onClick={() => {
                  aoMudar(itens.filter((_, j) => j !== i));
                }}
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
      <div>
        <button
          type="button"
          className={estilos.botaoSecundario}
          onClick={() => {
            aoMudar([...itens, '']);
          }}
        >
          Adicionar {rotuloDoItem.toLowerCase()}
        </button>
      </div>
    </fieldset>
  );
}

const TEXTO_DO_STATUS: Record<Status['tipo'], string> = {
  salvo: 'Tudo salvo',
  sujo: 'Alterações não salvas',
  salvando: 'Salvando…',
  erro: 'Erro ao salvar',
};

/**
 * Estado do formulário + Salvar + Descartar. O estado é anunciado para leitores de tela.
 * "Salvar" é o `submit` do formulário em volta: quem salva é o `onSubmit` dele.
 */
export function BarraDeSalvar({
  status,
  sujo,
  aoDescartar,
  extra,
}: {
  readonly status: Status;
  readonly sujo: boolean;
  readonly aoDescartar: () => void;
  readonly extra?: React.ReactNode;
}) {
  const barra = useRef<HTMLDivElement>(null);

  // A barra fica colada no pé da tela. Um controle focado pelo teclado que caia atrás dela
  // é rolado para cima dela (WCAG 2.2, 2.4.11). O navegador não faz isso sozinho quando o
  // controle já está parcialmente visível.
  useEffect(() => {
    const aoFocar = (e: FocusEvent) => {
      const alvo = e.target;
      const elemento = barra.current;
      if (!(alvo instanceof HTMLElement) || !elemento || elemento.contains(alvo)) return;
      const escondido = alvo.getBoundingClientRect().bottom - elemento.getBoundingClientRect().top;
      if (escondido > 0) window.scrollBy({ top: escondido + 12 });
    };
    document.addEventListener('focusin', aoFocar);
    return () => {
      document.removeEventListener('focusin', aoFocar);
    };
  }, []);

  return (
    <div className={estilos.barra} ref={barra}>
      <span
        role="status"
        className={cx(
          estilos.status,
          status.tipo === 'sujo' ? estilos.statusSujo : '',
          status.tipo === 'erro' ? estilos.statusErro : '',
        )}
      >
        {TEXTO_DO_STATUS[status.tipo]}
        {status.tipo === 'erro' && ` — ${status.motivo}`}
      </span>
      {extra}
      <button
        type="button"
        className={estilos.botaoDiscreto}
        disabled={!sujo}
        onClick={aoDescartar}
      >
        Descartar alterações
      </button>
      <button
        type="submit"
        className={estilos.botao}
        disabled={!sujo || status.tipo === 'salvando'}
      >
        Salvar
      </button>
    </div>
  );
}

/**
 * "Restaurar o original" de uma seção: pede confirmação dizendo o que será perdido.
 * Quem chama decide o que é "o original" daquela seção e grava.
 */
export function RestaurarOriginal({
  oque,
  aoRestaurar,
}: {
  /** Ex.: "o título e a frase de abertura da home". */
  readonly oque: string;
  readonly aoRestaurar: () => void;
}) {
  return (
    <button
      type="button"
      className={estilos.botaoPerigo}
      onClick={() => {
        if (
          window.confirm(`Restaurar ${oque} para o original? O que você salvou aqui será perdido.`)
        ) {
          aoRestaurar();
        }
      }}
    >
      Restaurar o original
    </button>
  );
}

/** Seta para cima/baixo em SVG: o caractere ↑ vira emoji colorido em algumas fontes. */
export function Seta({ para }: { readonly para: 'cima' | 'baixo' }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      aria-hidden="true"
      style={para === 'baixo' ? { transform: 'rotate(180deg)' } : undefined}
    >
      <path
        d="M7 12V2M2.5 6.5 7 2l4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
