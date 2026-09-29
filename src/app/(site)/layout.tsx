import { FaixaDeAdministrador } from '@/components/faixa-de-administrador';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { ConteudoProvider } from '@/dados/conteudo-do-site';
import { SCRIPT_DO_TEMA } from '@/dados/tema-antes-da-pintura';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConteudoProvider>
      {/* Aplica a paleta escolhida no painel antes da primeira pintura (ver o arquivo). */}
      <script dangerouslySetInnerHTML={{ __html: SCRIPT_DO_TEMA }} />
      <a href="#conteudo" className="pular-para-conteudo">
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo">{children}</main>
      <SiteFooter />
      <FaixaDeAdministrador />
    </ConteudoProvider>
  );
}
