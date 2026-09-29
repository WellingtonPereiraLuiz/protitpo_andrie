import type { Metadata } from 'next';
import { SecaoEmConstrucao } from '@/admin/secao-em-construcao';

export const metadata: Metadata = { title: 'Serviços' };

export default function Pagina() {
  return <SecaoEmConstrucao titulo="Serviços" />;
}
