'use client';

import Link from 'next/link';
import { ViewTransition } from 'react';
import { FotoDoConteudo } from '@/components/foto-do-conteudo';
import { useConteudo } from '@/dados/conteudo-do-site';
import { dataCurta } from '@/lib/calendario';
import estilos from './blog.module.css';

export function ListaDePosts() {
  const publicados = useConteudo()
    .conteudo.posts.filter((p) => p.estado === 'publicado')
    .sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className={estilos.lista}>
      {publicados.map((post, i) => (
        <Link key={post.slug} href={`/blog/${post.slug}`} className={estilos.cartao}>
          {/* Mesmo nome da capa na página do post: a foto viaja de uma para a outra. */}
          <ViewTransition name={`capa-post-${post.slug}`} share="capa" default="none">
            <div className={estilos.moldura}>
              <FotoDoConteudo
                id={post.capa}
                alt={`Imagem do post “${post.titulo}”`}
                preencher
                priority={i === 0}
                sizes="(min-width: 880px) 40vw, 100vw"
              />
            </div>
          </ViewTransition>
          <div>
            <span className={estilos.meta}>
              {dataCurta(post.data)} · {post.categoria}
            </span>
            <span className={estilos.titulo}>{post.titulo}</span>
            <p className={estilos.resumo}>{post.resumo}</p>
            <span className={estilos.ler}>Ler o post</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
