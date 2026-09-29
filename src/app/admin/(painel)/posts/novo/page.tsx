import type { Metadata } from 'next';
import { NovoPost } from '@/admin/secoes/posts';

export const metadata: Metadata = { title: 'Novo post' };

export default function Pagina() {
  return <NovoPost />;
}
