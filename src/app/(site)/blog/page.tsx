import type { Metadata } from 'next';
import ui from '@/components/ui.module.css';
import { ListaDePosts } from './lista-de-posts';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Histórias e conselhos sobre casamento e fotografia.',
};

export default function BlogPage() {
  return (
    <div className={ui.container}>
      <header className={ui.cabecalhoDePagina}>
        <span className={ui.kicker}>Diário</span>
        <h1 className={ui.titulo}>Histórias e conselhos</h1>
      </header>

      <ListaDePosts />
    </div>
  );
}
