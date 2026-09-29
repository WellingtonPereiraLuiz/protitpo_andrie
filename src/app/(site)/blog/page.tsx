import type { Metadata } from 'next';
import Link from 'next/link';
import { Foto } from '@/components/foto';
import ui from '@/components/ui.module.css';
import { POSTS } from '@/content/posts';
import estilos from './blog.module.css';

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

      <div className={estilos.lista}>
        {POSTS.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className={estilos.cartao}>
            <div className={estilos.moldura}>
              <Foto
                id={post.capa}
                alt={`Imagem do post “${post.titulo}”`}
                preencher
                sizes="(min-width: 880px) 40vw, 100vw"
              />
            </div>
            <div>
              <span className={estilos.meta}>
                {post.data} · {post.categoria}
              </span>
              <span className={estilos.titulo}>{post.titulo}</span>
              <p className={estilos.resumo}>{post.resumo}</p>
              <span className={estilos.ler}>Ler o post</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
