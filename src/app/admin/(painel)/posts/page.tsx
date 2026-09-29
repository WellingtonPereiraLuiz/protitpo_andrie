import type { Metadata } from 'next';
import { ListaDePosts } from '@/admin/secoes/posts';

export const metadata: Metadata = { title: 'Posts' };

export default function Pagina() {
  return <ListaDePosts />;
}
