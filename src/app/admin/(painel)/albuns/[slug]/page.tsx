import type { Metadata } from 'next';
import { EditarAlbum } from '@/admin/secoes/albuns';

export const metadata: Metadata = { title: 'Editar álbum' };

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EditarAlbum slug={slug} />;
}
