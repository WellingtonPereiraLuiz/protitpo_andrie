import type { Metadata } from 'next';
import { SEMENTE } from '@/dados/semente';
import { Album } from './album';

interface Props {
  readonly params: Promise<{ readonly slug: string }>;
}

// Os álbuns da semente são gerados no build. Um álbum criado no painel existe só no
// navegador de quem o criou: o endereço é aceito e resolvido lá (spec do admin, seção 9).
export function generateStaticParams(): { slug: string }[] {
  return SEMENTE.albuns.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = SEMENTE.albuns.find((a) => a.slug === slug);
  if (!album) return { title: 'Álbum', robots: { index: false, follow: false } };
  return { title: album.nome, description: album.resumo };
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  return <Album slug={slug} />;
}
