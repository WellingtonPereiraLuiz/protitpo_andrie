import type { Metadata } from 'next';
import { ListaDeAlbuns } from '@/admin/secoes/albuns';

export const metadata: Metadata = { title: 'Álbuns' };

export default function Pagina() {
  return <ListaDeAlbuns />;
}
