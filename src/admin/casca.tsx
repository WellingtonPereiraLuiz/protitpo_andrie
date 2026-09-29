'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
import { criarServicos } from '@/dados/servicos';
import estilos from './admin.module.css';
import { PainelProvider, usePainel } from './painel';

export const SECOES = [
  { href: '/admin/textos', rotulo: 'Textos' },
  { href: '/admin/albuns', rotulo: 'Álbuns' },
  { href: '/admin/posts', rotulo: 'Posts' },
  { href: '/admin/depoimentos', rotulo: 'Depoimentos' },
  { href: '/admin/servicos', rotulo: 'Serviços' },
  { href: '/admin/fotos', rotulo: 'Fotos' },
  { href: '/admin/agenda', rotulo: 'Agenda' },
] as const;

const AVISO_DE_PENDENCIA = 'Há alterações não salvas nesta tela. Sair mesmo assim?';

function Navegacao() {
  const pathname = usePathname();
  const { haPendencias } = usePainel();
  return (
    <nav className={estilos.navegacao} aria-label="Seções do painel">
      {SECOES.map((s) => {
        const atual = pathname === s.href || pathname.startsWith(`${s.href}/`);
        return (
          <Link
            key={s.href}
            href={s.href}
            className={estilos.navLink}
            aria-current={atual ? 'page' : undefined}
            onClick={(e) => {
              if (haPendencias() && !window.confirm(AVISO_DE_PENDENCIA)) e.preventDefault();
            }}
          >
            {s.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}

const AVISO_DE_RESTAURAR_TUDO =
  'Restaurar TODO o conteúdo para o original? Isso apaga o que foi salvo neste navegador: ' +
  'textos, álbuns, posts, depoimentos, serviços, fotos enviadas e agenda.';

function Cabecalho() {
  const router = useRouter();
  const { haPendencias, restaurarTudo } = usePainel();
  return (
    <header className={estilos.cabecalho}>
      <h1 className={estilos.titulo}>Painel do fotógrafo</h1>
      <div className={estilos.acoes}>
        <a href="/" target="_blank" rel="noopener" className={estilos.botaoSecundario}>
          Ver o site <span className="apenas-leitor">(abre em nova aba)</span>
        </a>
        <button
          type="button"
          className={estilos.botaoPerigo}
          onClick={() => {
            if (window.confirm(AVISO_DE_RESTAURAR_TUDO)) void restaurarTudo();
          }}
        >
          Restaurar tudo
        </button>
        <button
          type="button"
          className={estilos.botaoDiscreto}
          onClick={() => {
            if (haPendencias() && !window.confirm(AVISO_DE_PENDENCIA)) return;
            void criarServicos()
              .autenticacao.sair()
              .then(() => {
                router.replace('/admin/entrar');
              });
          }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}

function Conteudo({ children }: { children: React.ReactNode }) {
  const { geracao } = usePainel();
  return (
    <main className={estilos.conteudo} id="conteudo" key={geracao}>
      <ProblemaAoCarregar />
      {children}
    </main>
  );
}

function ProblemaAoCarregar() {
  const { problema } = usePainel();
  if (!problema) return null;
  return (
    <div className={estilos.avisoErro} role="alert">
      {problema} O painel mostra o conteúdo original; salvar qualquer seção grava por cima.
    </div>
  );
}

const semAssinatura = () => () => undefined;

/** Sem sessão, qualquer rota do painel vai para o login. */
export function CascaDoPainel({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // No servidor a sessão é desconhecida (`null`): o painel só aparece no navegador.
  const sessao = useSyncExternalStore(
    semAssinatura,
    () => criarServicos().autenticacao.sessaoAtiva(),
    () => null,
  );

  useEffect(() => {
    if (sessao === false) router.replace('/admin/entrar');
  }, [sessao, router]);

  if (sessao !== true) return null;

  return (
    <PainelProvider>
      <Cabecalho />
      <div className={estilos.corpo}>
        <Navegacao />
        <Conteudo>{children}</Conteudo>
      </div>
    </PainelProvider>
  );
}
