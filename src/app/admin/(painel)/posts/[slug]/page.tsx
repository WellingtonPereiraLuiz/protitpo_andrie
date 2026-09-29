import type { Metadata } from 'next';
import { EditarPost } from '@/admin/secoes/posts';

export const metadata: Metadata = { title: 'Editar post' };

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EditarPost slug={slug} />;
}
