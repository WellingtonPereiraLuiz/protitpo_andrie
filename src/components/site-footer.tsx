import Link from 'next/link';
import { AVISO_DEMONSTRACAO, CONTATO, NAV, SITE } from '@/content/site';
import { linkDoWhatsApp } from '@/lib/whatsapp';
import estilos from './site-footer.module.css';

export function SiteFooter() {
  return (
    <footer className={estilos.rodape}>
      <div className={estilos.interno}>
        <div className={estilos.colunas}>
          <div>
            <span className={estilos.titulo}>{SITE.nome}</span>
            <p className={estilos.descricao}>{SITE.descricao}</p>
          </div>

          <nav aria-label="Navegação do rodapé">
            <span className={estilos.rotulo}>Navegar</span>
            <div className={estilos.lista}>
              {NAV.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.rotulo}
                </Link>
              ))}
            </div>
          </nav>

          <div>
            <span className={estilos.rotulo}>Redes e contato</span>
            <div className={estilos.lista}>
              <a href={CONTATO.instagram.url} rel="me noopener" target="_blank">
                Instagram {CONTATO.instagram.usuario}
              </a>
              <a href={CONTATO.facebook.url} rel="me noopener" target="_blank">
                Facebook {CONTATO.facebook.usuario}
              </a>
              <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>
              <a href={linkDoWhatsApp()} rel="noopener" target="_blank">
                WhatsApp · {CONTATO.whatsapp.exibicao}
              </a>
            </div>
          </div>
        </div>

        <div className={estilos.linha} />

        <div className={estilos.base}>
          <span>
            © {SITE.ano} {SITE.nomeCompleto}
          </span>
          <span>Site desenvolvido pela {SITE.desenvolvidoPor}</span>
        </div>
        <p className={estilos.aviso}>{AVISO_DEMONSTRACAO}</p>
      </div>
    </footer>
  );
}
