import type { Metadata } from 'next';
import { SecaoServicos } from '@/admin/secoes/servicos';

export const metadata: Metadata = { title: 'Serviços' };

export default function Pagina() {
  return <SecaoServicos />;
}
