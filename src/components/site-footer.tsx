import Link from 'next/link';
import { AVISO_DEMONSTRACAO, CONTATO, SITE } from '@/content/site';
import { linkDoWhatsApp } from '@/lib/whatsapp';
import estilos from './site-footer.module.css';

/** Só o necessário: quem é, como falar com ele e os créditos. A navegação fica no topo. */
export function SiteFooter() {
  return (
    <footer className={estilos.rodape}>
      <div className={estilos.interno}>
        <div className={estilos.topo}>
          <Link href="/" className={estilos.marca}>
            {SITE.nome}
          </Link>
          <ul className={estilos.contatos} aria-label="Contato">
            <li>
              <a href={linkDoWhatsApp()} rel="noopener" target="_blank">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={CONTATO.instagram.url} rel="me noopener" target="_blank">
                Instagram
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>
            </li>
          </ul>
        </div>

        <p className={estilos.base}>
          © {SITE.ano} {SITE.nomeCompleto} · Site por {SITE.desenvolvidoPor}
          <span className={estilos.aviso}>{AVISO_DEMONSTRACAO}</span>
        </p>
      </div>
    </footer>
  );
}
