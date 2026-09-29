'use client';

import { useId } from 'react';
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
                ↑
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
                ↓
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
  return (
    <div className={estilos.barra}>
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
