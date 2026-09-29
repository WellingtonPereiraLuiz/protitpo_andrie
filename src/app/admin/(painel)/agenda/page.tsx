import type { Metadata } from 'next';
import { SecaoEmConstrucao } from '@/admin/secao-em-construcao';

export const metadata: Metadata = { title: 'Agenda' };

export default function Pagina() {
  return <SecaoEmConstrucao titulo="Agenda" />;
}
