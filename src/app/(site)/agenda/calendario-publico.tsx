'use client';

import { useState } from 'react';
import { MES_INICIAL_DA_AGENDA, MESES_A_FRENTE } from '@/content/agenda';
import { useConteudo } from '@/dados/conteudo-do-site';
import {
  celulasDoMes,
  DIAS_DA_SEMANA,
  diasNoMes,
  mesDaData,
  mesesDaAgenda,
  NOMES_DOS_MESES,
  nomeDoMes,
  type MesDoAno,
} from '@/lib/calendario';
import { cx } from '@/lib/cx';
import { useHoje } from '@/lib/use-hoje';
import estilos from './agenda.module.css';

/** Quantos meses aparecem lado a lado. */
const VISIVEIS = 3;

function Mes({ mes, ocupados }: { mes: MesDoAno; ocupados: ReadonlySet<string> }) {
  const celulas = celulasDoMes(mes);
  const ocupadosNoMes = celulas.filter((c) => c.tipo === 'dia' && ocupados.has(c.data)).length;
  return (
    <section className={estilos.mes} aria-label={nomeDoMes(mes)}>
      <div className={estilos.mesTopo}>
        <span className={estilos.mesNome}>
          {NOMES_DOS_MESES[mes.mes - 1]} {mes.ano}
        </span>
        <span className={estilos.mesResumo}>{diasNoMes(mes) - ocupadosNoMes} datas livres</span>
      </div>

      <div className={estilos.semana} aria-hidden="true">
        {DIAS_DA_SEMANA.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className={estilos.dias}>
        {celulas.map((dia) => {
          if (dia.tipo === 'vazio') {
            return <span key={dia.chave} className={cx(estilos.dia, estilos.diaVazio)} />;
          }
          const ocupado = ocupados.has(dia.data);
          return (
            <span
              key={dia.chave}
              className={cx(
                estilos.dia,
                ocupado ? estilos.diaOcupado : '',
                !ocupado && dia.fimDeSemana ? estilos.diaFds : '',
              )}
            >
              {dia.numero}
              {ocupado && <span className="apenas-leitor"> — ocupada</span>}
            </span>
          );
        })}
      </div>
    </section>
  );
}

/** Só a data vai para o site público: título, tipo e local do compromisso ficam no painel. */
export function CalendarioPublico() {
  const ocupados = new Set(useConteudo().conteudo.agenda.compromissos.map((c) => c.data));
  const hoje = useHoje();
  const meses = mesesDaAgenda(
    hoje ? mesDaData(hoje) : MES_INICIAL_DA_AGENDA,
    MES_INICIAL_DA_AGENDA,
    MESES_A_FRENTE,
  );
  const [deslocamento, setDeslocamento] = useState(0);
  const maximo = Math.max(0, meses.length - VISIVEIS);
  const inicio = Math.min(deslocamento, maximo);
  const visiveis = meses.slice(inicio, inicio + VISIVEIS);

  return (
    <>
      <div className={estilos.navegacao}>
        <button
          type="button"
          className={estilos.navBotao}
          disabled={inicio === 0}
          onClick={() => {
            setDeslocamento(inicio - 1);
          }}
        >
          ← Mês anterior
        </button>
        <button
          type="button"
          className={estilos.navBotao}
          disabled={inicio >= maximo}
          onClick={() => {
            setDeslocamento(inicio + 1);
          }}
        >
          Próximo mês →
        </button>
      </div>

      <div className={estilos.meses} aria-live="polite">
        {visiveis.map((mes) => (
          <Mes key={nomeDoMes(mes)} mes={mes} ocupados={ocupados} />
        ))}
      </div>
    </>
  );
}
