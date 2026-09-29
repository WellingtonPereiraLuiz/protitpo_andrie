'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CONTATO, NAV, SITE } from '@/content/site';
import { linkDoWhatsApp } from '@/lib/whatsapp';
import estilos from './site-header.module.css';
import { cx } from '@/lib/cx';

function estaAtivo(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/portfolio') return pathname.startsWith('/portfolio');
  if (href === '/blog') return pathname.startsWith('/blog');
  return pathname === href;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const botaoMenu = useRef<HTMLButtonElement>(null);

  const fechar = useCallback(() => {
    setMenuAberto(false);
    botaoMenu.current?.focus();
  }, []);

  // O menu é um diálogo: Esc fecha e a página atrás não rola.
  useEffect(() => {
    if (!menuAberto) return undefined;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar();
    };
    document.addEventListener('keydown', aoTeclar);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [menuAberto, fechar]);

  return (
    <header className={estilos.cabecalho}>
      <div className={estilos.faixa}>
        <Link href="/" className={estilos.marca}>
          {SITE.nome}
        </Link>

        <nav className={estilos.navegacao} aria-label="Navegação principal">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cx(estilos.link, estaAtivo(pathname, item.href) ? estilos.linkAtivo : '')}
              aria-current={estaAtivo(pathname, item.href) ? 'page' : undefined}
            >
              {item.rotulo}
            </Link>
          ))}
          <Link href="/contato" className={estilos.orcamento}>
            Orçamento
          </Link>
        </nav>

        <button
          ref={botaoMenu}
          type="button"
          className={estilos.hamburguer}
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
          onClick={() => {
            setMenuAberto(true);
          }}
        >
          <span />
          <span />
        </button>
      </div>

      {menuAberto && (
        <>
          <button
            type="button"
            className={estilos.fundo}
            aria-label="Fechar menu"
            onClick={fechar}
          />
          <div className={estilos.painel} role="dialog" aria-modal="true" aria-label="Menu">
            <div className={estilos.fecharLinha}>
              <button
                type="button"
                className={estilos.fechar}
                aria-label="Fechar menu"
                onClick={fechar}
              >
                ×
              </button>
            </div>

            <nav className={estilos.painelLinks} aria-label="Navegação">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={estilos.painelLink}
                  onClick={fechar}
                  aria-current={estaAtivo(pathname, item.href) ? 'page' : undefined}
                >
                  {item.rotulo}
                </Link>
              ))}
            </nav>

            <div className={estilos.painelPe}>
              <Link href="/contato" className={estilos.orcamento} onClick={fechar}>
                Pedir um orçamento
              </Link>
              <div className={estilos.painelContato}>
                <a href={linkDoWhatsApp()}>WhatsApp · {CONTATO.whatsapp.exibicao}</a>
                <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>
                <a href={CONTATO.instagram.url}>{CONTATO.instagram.usuario}</a>
                <a href={CONTATO.facebook.url}>Facebook</a>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
