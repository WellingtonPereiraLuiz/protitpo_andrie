'use client';

import { criarServicos } from '@/dados/servicos';

/**
 * Leva do painel para o site, na mesma aba, em modo "visualizando como administrador":
 * o site mostra a faixa com a seta de volta para esta mesma tela do painel.
 * É um <a> comum (navegação completa): com alterações não salvas, o navegador pergunta antes.
 */
export function VerNoSite({
  href,
  className,
  children,
}: {
  readonly href: string;
  readonly className?: string | undefined;
  readonly children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        criarServicos().visualizacao.entrar(window.location.pathname);
      }}
    >
      {children}
    </a>
  );
}
