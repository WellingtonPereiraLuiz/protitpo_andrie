import type { Metadata } from 'next';
import Link from 'next/link';
import ui from '@/components/ui.module.css';
import { datasLivres, DIAS_DA_SEMANA, diasDoMes, MESES } from '@/content/agenda';
import estilos from './agenda.module.css';
import { cx } from '@/lib/cx';

export const metadata: Metadata = {
  title: 'Agenda',
  description: 'Datas livres de 2026 — consulta visual, nada é reservado pelo site.',
};

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
        {MESES.map((mes) => (
          <section
            key={mes.nome}
            className={estilos.mes}
            aria-label={`${mes.nome} de ${String(mes.ano)}`}
          >
            <div className={estilos.mesTopo}>
              <span className={estilos.mesNome}>
                {mes.nome} {mes.ano}
              </span>
              <span className={estilos.mesResumo}>{datasLivres(mes)} datas livres</span>
            </div>

            <div className={estilos.semana} aria-hidden="true">
              {DIAS_DA_SEMANA.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>

            <div className={estilos.dias}>
              {diasDoMes(mes).map((dia) =>
                dia.tipo === 'vazio' ? (
                  <span key={dia.chave} className={cx(estilos.dia, estilos.diaVazio)} />
                ) : (
                  <span
                    key={dia.chave}
                    className={cx(
                      estilos.dia,
                      dia.ocupado ? estilos.diaOcupado : '',
                      !dia.ocupado && dia.fimDeSemana ? estilos.diaFds : '',
                    )}
                  >
                    {dia.numero}
                    {dia.ocupado && <span className="apenas-leitor"> — ocupada</span>}
                  </span>
                ),
              )}
            </div>
          </section>
        ))}
      </div>

      <div className={estilos.fecho}>
        <Link href="/contato" className={ui.botao}>
          Consultar minha data
        </Link>
      </div>
    </div>
  );
}
