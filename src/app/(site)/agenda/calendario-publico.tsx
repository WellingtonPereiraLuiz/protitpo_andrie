'use client';

import { MES_INICIAL_DA_AGENDA } from '@/content/agenda';
import { useConteudo } from '@/dados/conteudo-do-site';
import {
  celulasDoMes,
  DIAS_DA_SEMANA,
  diasNoMes,
  NOMES_DOS_MESES,
  nomeDoMes,
  somarMeses,
} from '@/lib/calendario';
import { cx } from '@/lib/cx';
import estilos from './agenda.module.css';

const MESES = [0, 1, 2].map((n) => somarMeses(MES_INICIAL_DA_AGENDA, n));

/** Só a data vai para o site público: título, tipo e local do compromisso ficam no painel. */
export function CalendarioPublico() {
  const ocupados = new Set(useConteudo().conteudo.agenda.compromissos.map((c) => c.data));

  return (
    <div className={estilos.meses}>
      {MESES.map((mes) => {
        const celulas = celulasDoMes(mes);
        const ocupadosNoMes = celulas.filter(
          (c) => c.tipo === 'dia' && ocupados.has(c.data),
        ).length;
        return (
          <section key={nomeDoMes(mes)} className={estilos.mes} aria-label={nomeDoMes(mes)}>
            <div className={estilos.mesTopo}>
              <span className={estilos.mesNome}>
                {NOMES_DOS_MESES[mes.mes - 1]} {mes.ano}
              </span>
              <span className={estilos.mesResumo}>
                {diasNoMes(mes) - ocupadosNoMes} datas livres
              </span>
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
      })}
    </div>
  );
}
