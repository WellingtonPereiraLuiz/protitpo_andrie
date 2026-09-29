import type { Metadata } from 'next';
import Link from 'next/link';
import ui from '@/components/ui.module.css';
import { MES_INICIAL_DA_AGENDA } from '@/content/agenda';
import { SEMENTE } from '@/dados/semente';
import {
  celulasDoMes,
  DIAS_DA_SEMANA,
  diasNoMes,
  NOMES_DOS_MESES,
  nomeDoMes,
  somarMeses,
} from '@/lib/calendario';
import estilos from './agenda.module.css';
import { cx } from '@/lib/cx';

export const metadata: Metadata = {
  title: 'Agenda',
  description: 'Datas livres de 2026 — consulta visual, nada é reservado pelo site.',
};

const MESES = [0, 1, 2].map((n) => somarMeses(MES_INICIAL_DA_AGENDA, n));
const OCUPADOS = new Set(SEMENTE.agenda.compromissos.map((c) => c.data));

export default function AgendaPage() {
  return (
    <div className={ui.container}>
      <header className={ui.cabecalhoDePagina}>
        <span className={ui.kicker}>Agenda</span>
        <h1 className={ui.titulo}>Datas livres de 2026</h1>
      </header>

      <div className={ui.aviso} style={{ marginTop: '28px', maxWidth: 'var(--leitura)' }}>
        <strong>Este calendário é só uma consulta visual.</strong> Nada é reservado por aqui — as
        datas mudam o tempo todo. Para segurar a sua, me chame no WhatsApp ou peça um orçamento.
      </div>

      <div className={estilos.legenda}>
        <span className={estilos.legendaItem}>
          <span className={estilos.amostra} /> Livre
        </span>
        <span className={estilos.legendaItem}>
          <span className={cx(estilos.amostra, estilos.amostraOcupada)} /> Ocupada (exemplo)
        </span>
        <span className={estilos.legendaItem}>
          <span className={cx(estilos.amostra, estilos.amostraFds)} /> Fim de semana livre
        </span>
      </div>

      <div className={estilos.meses}>
        {MESES.map((mes) => {
          const celulas = celulasDoMes(mes);
          const ocupadosNoMes = celulas.filter(
            (c) => c.tipo === 'dia' && OCUPADOS.has(c.data),
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
                  const ocupado = OCUPADOS.has(dia.data);
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

      <div className={estilos.fecho}>
        <Link href="/contato" className={ui.botao}>
          Consultar minha data
        </Link>
      </div>
    </div>
  );
}
