'use client';

import { useEffect, useRef, useState } from 'react';
import { MES_INICIAL_DA_AGENDA, MESES_A_FRENTE } from '@/content/agenda';
import {
  LIMITES,
  TIPOS_DE_COMPROMISSO,
  type Compromisso,
  type TipoDeCompromisso,
} from '@/dados/schema';
import {
  celulasDoMes,
  compararMeses,
  DIAS_DA_SEMANA,
  dataCurta,
  dataPorExtenso,
  mesDaData,
  mesesDaAgenda,
  nomeDoMes,
} from '@/lib/calendario';
import { cx } from '@/lib/cx';
import { useHoje } from '@/lib/use-hoje';
import estilos from '../admin.module.css';
import { BarraDeSalvar, CampoArea, CampoSelecao, CampoTexto } from '../campos';
import { useRascunho } from '../painel';
import agenda from './agenda.module.css';

function vazio(data: string): Compromisso {
  return { id: `c-${data}`, data, titulo: '', tipo: 'Casamento', local: '', observacao: '' };
}

export function SecaoAgenda() {
  const hoje = useHoje();
  const r = useRascunho(
    'agenda',
    (c) => c.agenda.compromissos,
    (c, compromissos) => ({ ...c, agenda: { compromissos } }),
  );
  const compromissos = r.valor;
  const porData = new Map(compromissos.map((c) => [c.data, c]));

  const meses = mesesDaAgenda(
    hoje ? mesDaData(hoje) : MES_INICIAL_DA_AGENDA,
    MES_INICIAL_DA_AGENDA,
    MESES_A_FRENTE,
  );
  const [indice, setIndice] = useState(0);
  const atual = Math.min(indice, meses.length - 1);
  const mes = meses[atual] ?? MES_INICIAL_DA_AGENDA;

  const [selecionada, setSelecionada] = useState<string | null>(null);
  const noDia = selecionada ? porData.get(selecionada) : undefined;
  const posicao = selecionada ? compromissos.findIndex((c) => c.data === selecionada) : -1;

  /** Muda um campo do compromisso do dia escolhido; cria o compromisso se ainda não existe. */
  const mudar = <K extends keyof Compromisso>(campo: K, valor: Compromisso[K]) => {
    if (!selecionada) return;
    r.alterar((lista) => {
      const existe = lista.some((c) => c.data === selecionada);
      const base = existe ? lista : [...lista, vazio(selecionada)];
      return base
        .map((c) => (c.data === selecionada ? { ...c, [campo]: valor } : c))
        .sort((a, b) => a.data.localeCompare(b.data));
    });
  };

  // "Abrir" na lista de próximos: o formulário do dia fica acima da lista, então a tela
  // precisa ir até ele — senão o clique parece não fazer nada.
  const detalhes = useRef<HTMLFieldSetElement>(null);
  const [pedidosDeAbrir, setPedidosDeAbrir] = useState(0);
  useEffect(() => {
    if (pedidosDeAbrir === 0) return;
    detalhes.current?.scrollIntoView({ block: 'start' });
    detalhes.current?.focus({ preventScroll: true });
  }, [pedidosDeAbrir]);

  const abrirDia = (data: string) => {
    setSelecionada(data);
    const i = meses.findIndex((m) => compararMeses(m, mesDaData(data)) === 0);
    if (i >= 0) setIndice(i);
    setPedidosDeAbrir((n) => n + 1);
  };

  const proximos = compromissos.filter((c) => (hoje ? c.data >= hoje : true));
  const erroDoCampo = (campo: string) =>
    posicao >= 0 ? r.erroDe(`agenda.compromissos.${String(posicao)}.${campo}`) : undefined;

  return (
    <form
      className={estilos.formulario}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void r.salvar();
      }}
    >
      <div>
        <h2 className={estilos.secaoTitulo}>Agenda</h2>
        <p className={estilos.secaoIntro}>
          Escolha um dia e atribua a ele um compromisso. Dia com compromisso aparece como ocupado no
          site — só a data; título, tipo e local ficam aqui.
        </p>
      </div>

      <div className={agenda.navegacao}>
        <button
          type="button"
          className={estilos.botaoDiscreto}
          disabled={atual === 0}
          onClick={() => {
            setIndice(atual - 1);
          }}
        >
          ← Mês anterior
        </button>
        <h3 className={agenda.mesNome} aria-live="polite">
          {nomeDoMes(mes)}
        </h3>
        <button
          type="button"
          className={estilos.botaoDiscreto}
          disabled={atual >= meses.length - 1}
          onClick={() => {
            setIndice(atual + 1);
          }}
        >
          Próximo mês →
        </button>
      </div>

      <div className={agenda.grade} role="group" aria-label={`Dias de ${nomeDoMes(mes)}`}>
        {DIAS_DA_SEMANA.map((d, i) => (
          <span key={`s${String(i)}`} className={agenda.semana} aria-hidden="true">
            {d}
          </span>
        ))}
        {celulasDoMes(mes).map((cel) => {
          if (cel.tipo === 'vazio') return <span key={cel.chave} />;
          const c = porData.get(cel.data);
          return (
            <button
              key={cel.chave}
              type="button"
              className={cx(
                agenda.dia,
                c ? agenda.diaOcupado : '',
                cel.data === selecionada ? agenda.diaEscolhido : '',
              )}
              aria-pressed={cel.data === selecionada}
              aria-label={`${dataPorExtenso(cel.data)} — ${c ? c.titulo || 'compromisso sem título' : 'livre'}`}
              onClick={() => {
                setSelecionada(cel.data);
              }}
            >
              <span className={agenda.numero}>{cel.numero}</span>
              {c && (
                <span className={agenda.rotulo} aria-hidden="true">
                  {c.titulo}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selecionada && (
        <fieldset
          ref={detalhes}
          tabIndex={-1}
          className={cx(estilos.grupo, agenda.detalhes)}
          id="compromisso"
        >
          <legend>{dataPorExtenso(selecionada)}</legend>
          <p className={estilos.ajuda} style={{ margin: 0 }}>
            {noDia ? 'Dia ocupado.' : 'Dia livre. Preencha para marcar como ocupado.'}
          </p>
          <CampoTexto
            rotulo="Título"
            obrigatorio
            limite={LIMITES.tituloDoCompromisso}
            ajuda='Ex.: "Casamento Marina & Téo". Não aparece no site.'
            valor={noDia?.titulo ?? ''}
            aoMudar={(v) => {
              mudar('titulo', v);
            }}
            erro={erroDoCampo('titulo')}
          />
          <CampoSelecao<TipoDeCompromisso>
            rotulo="Tipo"
            valor={noDia?.tipo ?? 'Casamento'}
            opcoes={TIPOS_DE_COMPROMISSO}
            aoMudar={(v) => {
              mudar('tipo', v);
            }}
          />
          <CampoTexto
            rotulo="Local"
            limite={LIMITES.campoCurto}
            valor={noDia?.local ?? ''}
            aoMudar={(v) => {
              mudar('local', v);
            }}
            erro={erroDoCampo('local')}
          />
          <CampoArea
            rotulo="Observação"
            limite={LIMITES.resumo}
            linhas={3}
            valor={noDia?.observacao ?? ''}
            aoMudar={(v) => {
              mudar('observacao', v);
            }}
            erro={erroDoCampo('observacao')}
          />
          <div className={estilos.acoes}>
            {noDia && (
              <button
                type="button"
                className={estilos.botaoPerigo}
                onClick={() => {
                  r.alterar((lista) => lista.filter((c) => c.data !== selecionada));
                }}
              >
                Liberar este dia
              </button>
            )}
            <button
              type="button"
              className={estilos.botaoDiscreto}
              onClick={() => {
                setSelecionada(null);
              }}
            >
              Fechar
            </button>
          </div>
        </fieldset>
      )}

      <BarraDeSalvar status={r.status} sujo={r.sujo} aoDescartar={r.descartar} />

      <section aria-labelledby="proximos">
        <h3 id="proximos" className={agenda.subtitulo}>
          Próximos compromissos
        </h3>
        {proximos.length === 0 ? (
          <p className={estilos.ajuda}>Nenhum compromisso marcado.</p>
        ) : (
          <ul className={estilos.lista}>
            {proximos.map((c) => (
              <li key={c.id} className={cx(estilos.item, estilos.itemSemFoto)}>
                <div className={estilos.itemTexto}>
                  <span className={estilos.itemNome}>{c.titulo || 'Sem título'}</span>
                  <span className={estilos.itemMeta}>
                    {dataCurta(c.data)} · {c.tipo}
                    {c.local && ` · ${c.local}`}
                  </span>
                  {c.observacao && <span className={estilos.itemMeta}>{c.observacao}</span>}
                </div>
                <div className={estilos.itemAcoes}>
                  <button
                    type="button"
                    className={estilos.botaoSecundario}
                    aria-label={`Abrir ${dataPorExtenso(c.data)}`}
                    onClick={() => {
                      abrirDia(c.data);
                    }}
                  >
                    Abrir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </form>
  );
}
