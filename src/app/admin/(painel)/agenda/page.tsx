import type { Metadata } from 'next';
import { SecaoAgenda } from '@/admin/secoes/agenda';

export const metadata: Metadata = { title: 'Agenda' };

export default function Pagina() {
  return <SecaoAgenda />;
}
