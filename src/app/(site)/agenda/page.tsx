import type { Metadata } from 'next';
import Link from 'next/link';
import ui from '@/components/ui.module.css';
import { CalendarioPublico } from './calendario-publico';
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

      <CalendarioPublico />

      <div className={estilos.fecho}>
        <Link href="/contato" className={ui.botao}>
          Consultar minha data
        </Link>
      </div>
    </div>
  );
}
