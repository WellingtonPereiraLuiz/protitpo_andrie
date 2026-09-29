import type { Metadata } from 'next';
import Link from 'next/link';
import { Foto } from '@/components/foto';
import ui from '@/components/ui.module.css';
import { ALBUNS, CATEGORIAS, type Categoria } from '@/content/albuns';
import estilos from './portfolio.module.css';
import { cx } from '@/lib/cx';

export const metadata: Metadata = {
  title: 'Portfólio',
  description: 'Casamentos, ensaios e filmes fotografados por Andrei Heck.',
};

function ehCategoria(valor: string | undefined): valor is Categoria {
  return valor !== undefined && (CATEGORIAS as readonly string[]).includes(valor);
}

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const bruto = params.categoria;
  const pedida = Array.isArray(bruto) ? bruto[0] : bruto;
  const ativa: Categoria = ehCategoria(pedida) ? pedida : 'Casamentos';
  const visiveis = ALBUNS.filter((a) => a.categoria === ativa);

  return (
    <div className={ui.container}>
      <header className={ui.cabecalhoDePagina}>
        <span className={ui.kicker}>Portfólio</span>
        <h1 className={ui.titulo}>Casamentos, ensaios e filmes</h1>
      </header>

      <nav className={estilos.filtros} aria-label="Filtrar por categoria">
        {CATEGORIAS.map((c) => (
          <Link
            key={c}
            href={
              c === 'Casamentos' ? '/portfolio' : `/portfolio?categoria=${encodeURIComponent(c)}`
            }
            className={cx(estilos.pilula, c === ativa ? estilos.pilulaAtiva : '')}
            aria-current={c === ativa ? 'true' : undefined}
          >
            {c}
          </Link>
        ))}
      </nav>

      <div className={estilos.grade}>
        {visiveis.map((album) => (
          <Link key={album.slug} href={`/portfolio/${album.slug}`} className={estilos.cartao}>
            <div className={estilos.moldura}>
              <Foto
                id={album.capa}
                alt={`Capa do álbum ${album.nome}`}
                preencher
                sizes="(min-width: 880px) 33vw, (min-width: 620px) 50vw, 100vw"
              />
            </div>
            <div className={estilos.info}>
              <span className={estilos.meta}>{album.meta}</span>
              <span className={estilos.nome}>{album.nome}</span>
              <span className={estilos.resumo}>{album.resumo}</span>
              <span className={estilos.total}>Ver as {album.fotos.length + 1} fotos</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
