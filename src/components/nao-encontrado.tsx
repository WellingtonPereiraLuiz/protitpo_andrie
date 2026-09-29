import Link from 'next/link';
import ui from './ui.module.css';

/**
 * "Não encontrado" dentro do layout do site. Usado quando um endereço só pode ser
 * resolvido no navegador (álbum ou post criado no painel) e não existe.
 */
export function NaoEncontrado({
  oque,
  voltar,
}: {
  readonly oque: string;
  readonly voltar: '/portfolio' | '/blog';
}) {
  return (
    <div className={ui.container}>
      <header className={ui.cabecalhoDePagina}>
        <span className={ui.kicker}>Não encontrado</span>
        <h1 className={ui.titulo}>{oque}</h1>
        <p className={ui.intro}>O endereço pode ter mudado ou o conteúdo foi removido.</p>
        <p style={{ margin: '28px 0 64px' }}>
          <Link href={voltar} className={ui.botao}>
            Voltar
          </Link>
        </p>
      </header>
    </div>
  );
}

export function Carregando() {
  return (
    <div className={ui.container}>
      <p className={ui.intro} role="status" style={{ padding: '56px 0' }}>
        Carregando…
      </p>
    </div>
  );
}
