import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { ConteudoProvider } from '@/dados/conteudo-do-site';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConteudoProvider>
      <a href="#conteudo" className="pular-para-conteudo">
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo">{children}</main>
      <SiteFooter />
    </ConteudoProvider>
  );
}
