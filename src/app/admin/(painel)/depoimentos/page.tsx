import type { Metadata } from 'next';
import { SecaoDepoimentos } from '@/admin/secoes/depoimentos';

export const metadata: Metadata = { title: 'Depoimentos' };

export default function Pagina() {
  return <SecaoDepoimentos />;
}
