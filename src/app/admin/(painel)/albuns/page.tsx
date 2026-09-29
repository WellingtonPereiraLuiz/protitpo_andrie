import type { Metadata } from 'next';
import { SecaoEmConstrucao } from '@/admin/secao-em-construcao';

export const metadata: Metadata = { title: 'Álbuns' };

export default function Pagina() {
  return <SecaoEmConstrucao titulo="Álbuns" />;
}
