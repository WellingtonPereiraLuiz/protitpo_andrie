import type { Metadata } from 'next';
import estilos from '@/admin/admin.module.css';

export const metadata: Metadata = {
  title: { default: 'Painel do fotógrafo', template: '%s · Painel do fotógrafo' },
  robots: { index: false, follow: false },
};

// Fora do grupo (site): o painel não tem o cabeçalho nem o rodapé de marketing.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className={estilos.faixa} role="note">
        <strong>Demonstração</strong> — o que você mudar aqui fica só neste navegador.
      </div>
      {children}
    </>
  );
}
