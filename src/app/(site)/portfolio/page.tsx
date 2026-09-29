import type { Metadata } from 'next';
import Link from 'next/link';
import ui from '@/components/ui.module.css';
import { CATEGORIAS_DE_ALBUM, type CategoriaDeAlbum } from '@/dados/schema';
import { GradeDeAlbuns } from './grade-de-albuns';
import estilos from './portfolio.module.css';
import { cx } from '@/lib/cx';

export const metadata: Metadata = {
  title: 'Portfólio',
  description: 'Casamentos, ensaios e filmes fotografados por Andrei Heck.',
};

function ehCategoria(valor: string | undefined): valor is CategoriaDeAlbum {
  return valor !== undefined && (CATEGORIAS_DE_ALBUM as readonly string[]).includes(valor);
}

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const bruto = params.categoria;
  const pedida = Array.isArray(bruto) ? bruto[0] : bruto;
  const ativa: CategoriaDeAlbum = ehCategoria(pedida) ? pedida : 'Casamentos';

  return (
    <div className={ui.container}>
      <header className={ui.cabecalhoDePagina}>
        <span className={ui.kicker}>Portfólio</span>
        <h1 className={ui.titulo}>Casamentos, ensaios e filmes</h1>
      </header>

      <nav className={estilos.filtros} aria-label="Filtrar por categoria">
        {CATEGORIAS_DE_ALBUM.map((c) => (
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

      <GradeDeAlbuns ativa={ativa} />
    </div>
  );
}
