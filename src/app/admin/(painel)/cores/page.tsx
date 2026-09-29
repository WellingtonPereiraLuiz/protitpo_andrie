import type { Metadata } from 'next';
import { SecaoCores } from '@/admin/secoes/cores';

export const metadata: Metadata = { title: 'Cores' };

export default function Pagina() {
  return <SecaoCores />;
}
