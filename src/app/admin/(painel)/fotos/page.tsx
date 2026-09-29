import type { Metadata } from 'next';
import { SecaoFotos } from '@/admin/secoes/fotos';

export const metadata: Metadata = { title: 'Fotos' };

export default function Pagina() {
  return <SecaoFotos />;
}
