import type { Metadata } from 'next';
import { SecaoTextos } from '@/admin/secoes/textos';

export const metadata: Metadata = { title: 'Textos' };

export default function Pagina() {
  return <SecaoTextos />;
}
