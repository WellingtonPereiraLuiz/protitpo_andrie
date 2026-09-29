import type { Metadata } from 'next';
import { SecaoEmConstrucao } from '@/admin/secao-em-construcao';

export const metadata: Metadata = { title: 'Depoimentos' };

export default function Pagina() {
  return <SecaoEmConstrucao titulo="Depoimentos" />;
}
