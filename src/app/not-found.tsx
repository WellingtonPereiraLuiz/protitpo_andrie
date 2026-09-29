import type { Metadata } from 'next';
import Link from 'next/link';
import ui from '@/components/ui.module.css';
import estilos from './not-found.module.css';
import { cx } from '@/lib/cx';

export const metadata: Metadata = {
  title: 'Página não encontrada',
};

export default function NotFound() {
  return (
    <div className={estilos.tela}>
      <span className={estilos.marcador}>404</span>
      <h1 className={estilos.titulo}>Essa página se perdeu na festa</h1>
      <p className={estilos.texto}>
        Acontece. Volte para o começo ou veja os últimos casamentos que fotografei.
      </p>
      <div className={estilos.acoes}>
        <Link href="/" className={ui.botao}>
          Ir para a home
        </Link>
        <Link href="/portfolio" className={cx(ui.botao, ui.botaoSecundario)}>
          Ver o portfólio
        </Link>
      </div>
    </div>
  );
}
