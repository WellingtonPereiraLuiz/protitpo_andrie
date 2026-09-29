import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIAS_DE_ALBUM } from '@/dados/schema';
import { categoriaDoSlug, PaginaDoPortfolio, slugDaCategoria } from '../../pagina-do-portfolio';

interface Props {
  readonly params: Promise<{ readonly categoria: string }>;
}

// As categorias são fixas no schema: todas geradas no build, qualquer outra é 404.
export const dynamicParams = false;

export function generateStaticParams(): { categoria: string }[] {
  return CATEGORIAS_DE_ALBUM.map((c) => ({ categoria: slugDaCategoria(c) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoria = categoriaDoSlug((await params).categoria);
  return {
    title: categoria ? `Portfólio · ${categoria}` : 'Portfólio',
    description: 'Casamentos, ensaios e filmes fotografados por Andrei Heck.',
  };
}

export default async function CategoriaPage({ params }: Props) {
  const categoria = categoriaDoSlug((await params).categoria);
  if (!categoria) notFound();
  return <PaginaDoPortfolio ativa={categoria} />;
}
