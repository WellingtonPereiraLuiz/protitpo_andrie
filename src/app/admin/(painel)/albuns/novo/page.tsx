import type { Metadata } from 'next';
import { NovoAlbum } from '@/admin/secoes/albuns';

export const metadata: Metadata = { title: 'Novo álbum' };

export default function Pagina() {
  return <NovoAlbum />;
}
