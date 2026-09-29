'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CONTATO, NAV, SITE } from '@/content/site';
import { cx } from '@/lib/cx';
import { linkDoWhatsApp } from '@/lib/whatsapp';
import estilos from './site-header.module.css';

/** Tem que bater com a duração de `sair` em site-header.module.css. */
const DURACAO_DO_FECHAMENTO = 260;

function estaAtivo(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/portfolio') return pathname.startsWith('/portfolio');
  if (href === '/blog') return pathname.startsWith('/blog');
  return pathname === href;
}

type EstadoDoMenu = 'fechado' | 'aberto' | 'fechando';

export function SiteHeader() {
  const pathname = usePathname();
  const [menu, setMenu] = useState<EstadoDoMenu>('fechado');
  const botaoMenu = useRef<HTMLButtonElement>(null);
  const botaoFechar = useRef<HTMLButtonElement>(null);

  // Fecha com animação: o painel sai de cena antes de ser desmontado.
  const fechar = useCallback(() => {
    setMenu((m) => (m === 'aberto' ? 'fechando' : m));
  }, []);

  useEffect(() => {
    if (menu !== 'fechando') return undefined;
    const t = window.setTimeout(() => {
      setMenu('fechado');
      botaoMenu.current?.focus();
    }, DURACAO_DO_FECHAMENTO);
    return () => {
      window.clearTimeout(t);
    };
  }, [menu]);

  // O menu é um diálogo: o foco entra nele, Esc fecha e a página atrás não rola.
  useEffect(() => {
    if (menu !== 'aberto') return undefined;
    botaoFechar.current?.focus();
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
  }, [menu, fechar]);

  return (
    // Nome próprio na transição de página: o cabeçalho fica parado enquanto o conteúdo troca.
    <header className={estilos.cabecalho} style={{ viewTransitionName: 'cabecalho-do-site' }}>
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
          aria-expanded={menu === 'aberto'}
          onClick={() => {
            setMenu('aberto');
          }}
        >
          <span />
          <span />
        </button>
      </div>

      {/*
        Portal no <body>: o cabeçalho tem backdrop-filter, que prende qualquer filho
        position:fixed dentro da caixa dele. Fora dele, o menu cobre a página inteira.
      */}
      {menu !== 'fechado' &&
        createPortal(
          <div className={cx(estilos.menu, menu === 'fechando' ? estilos.menuSaindo : '')}>
            <button
              type="button"
              className={estilos.fundo}
              aria-label="Fechar menu"
              tabIndex={-1}
              onClick={fechar}
            />
            <div className={estilos.painel} role="dialog" aria-modal="true" aria-label="Menu">
              <div className={estilos.fecharLinha}>
                <button
                  ref={botaoFechar}
                  type="button"
                  className={estilos.fechar}
                  aria-label="Fechar menu"
                  onClick={fechar}
                >
                  ×
                </button>
              </div>

              <nav className={estilos.painelLinks} aria-label="Navegação">
                {NAV.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cx(
                      estilos.painelLink,
                      estaAtivo(pathname, item.href) ? estilos.linkAtivo : '',
                    )}
                    style={{ '--ordem': i } as React.CSSProperties}
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
          </div>,
          document.body,
        )}
    </header>
  );
}
