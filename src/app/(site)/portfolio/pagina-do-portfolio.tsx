import Link from 'next/link';
import ui from '@/components/ui.module.css';
import { CATEGORIAS_DE_ALBUM, type CategoriaDeAlbum } from '@/dados/schema';
import { cx } from '@/lib/cx';
import { gerarSlug } from '@/lib/slug';
import { GradeDeAlbuns } from './grade-de-albuns';
import estilos from './portfolio.module.css';

/** "Vídeos" → "videos": o segmento da URL da categoria. */
export function slugDaCategoria(c: CategoriaDeAlbum): string {
  return gerarSlug(c);
}

export function categoriaDoSlug(slug: string): CategoriaDeAlbum | undefined {
  return CATEGORIAS_DE_ALBUM.find((c) => slugDaCategoria(c) === slug);
}

/** Casamentos é a vitrine padrão, em /portfolio; as outras têm endereço próprio e estático. */
function rotaDaCategoria(c: CategoriaDeAlbum) {
  return c === 'Casamentos'
    ? ('/portfolio' as const)
    : (`/portfolio/categoria/${slugDaCategoria(c)}` as const);
}

export function PaginaDoPortfolio({ ativa }: { readonly ativa: CategoriaDeAlbum }) {
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
            href={rotaDaCategoria(c)}
            className={cx(estilos.pilula, c === ativa ? estilos.pilulaAtiva : '')}
            aria-current={c === ativa ? 'page' : undefined}
          >
            {c}
          </Link>
        ))}
      </nav>

      <GradeDeAlbuns ativa={ativa} />
    </div>
  );
}
