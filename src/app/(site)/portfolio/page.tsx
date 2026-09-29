import type { Metadata } from 'next';
import { PaginaDoPortfolio } from './pagina-do-portfolio';

export const metadata: Metadata = {
  title: 'Portfólio',
  description: 'Casamentos, ensaios e filmes fotografados por Andrei Heck.',
};

export default function PortfolioPage() {
  return <PaginaDoPortfolio ativa="Casamentos" />;
}
