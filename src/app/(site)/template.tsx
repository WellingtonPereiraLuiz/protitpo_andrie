import { ViewTransition } from 'react';

/**
 * O template é remontado a cada navegação (o layout não): é aqui que a página que sai e a
 * que entra ganham animação. As classes estão em globals.css.
 */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="pagina-entra" exit="pagina-sai" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
