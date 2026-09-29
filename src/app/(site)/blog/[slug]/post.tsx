'use client';

import Link from 'next/link';
import { ViewTransition } from 'react';
import { FotoDoConteudo } from '@/components/foto-do-conteudo';
import { Carregando, NaoEncontrado } from '@/components/nao-encontrado';
import ui from '@/components/ui.module.css';
import { useConteudo } from '@/dados/conteudo-do-site';
import type { BlocoDoPost } from '@/dados/schema';
import { dataLonga } from '@/lib/calendario';
import estilos from './post.module.css';
import { cx } from '@/lib/cx';

function Blocos({ blocos, titulo }: { blocos: readonly BlocoDoPost[]; titulo: string }) {
  return (
    <>
      {blocos.map((bloco, i) => {
        switch (bloco.tipo) {
          case 'texto':
            return (
              <p key={i} className={estilos.texto}>
                {bloco.texto}
              </p>
            );
          case 'galeria':
            return (
              <div key={i} className={estilos.galeria}>
                {bloco.fotos.map((foto, j) => (
                  <div key={`${foto}-${String(j)}`} className={estilos.galeriaFoto}>
                    <FotoDoConteudo
                      id={foto}
                      alt={`Foto ${String(j + 1)} da galeria do post “${titulo}”`}
                      preencher
                      sizes="(min-width: 880px) 33vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            );
          case 'video':
            return (
              <div key={i}>
                <div className={estilos.video}>
                  <FotoDoConteudo
                    id={bloco.capa}
                    alt={`Miniatura do vídeo do post “${titulo}”`}
                    preencher
                    sizes="(min-width: 880px) 760px, 100vw"
                  />
                  <span className={estilos.videoBotao} aria-hidden="true">
                    ▶
                  </span>
                </div>
                <span className={estilos.videoLegenda}>{bloco.legenda}</span>
              </div>
            );
        }
      })}
    </>
  );
}

export function Post({ slug }: { readonly slug: string }) {
  const { conteudo, carregado } = useConteudo();
  const post = conteudo.posts.find((p) => p.slug === slug && p.estado === 'publicado');

  if (!post) {
    return carregado ? (
      <NaoEncontrado oque="Não encontrei esse post" voltar="/blog" />
    ) : (
      <Carregando />
    );
  }

  const escrito = post.blocos.length > 0;

  return (
    <article>
      <ViewTransition name={`capa-post-${post.slug}`} share="capa" default="none">
        <div className={estilos.capa}>
          <FotoDoConteudo
            id={post.capa}
            alt={`Imagem de capa do post “${post.titulo}”`}
            preencher
            priority
            sizes="100vw"
          />
        </div>
      </ViewTransition>

      <div className={estilos.corpo}>
        <Link href="/blog" className={estilos.voltar}>
          ← Voltar ao diário
        </Link>

        <span className={estilos.meta}>
          {dataLonga(post.data)} · {post.categoria}
        </span>
        <h1 className={estilos.titulo}>{post.titulo}</h1>

        {escrito ? (
          <Blocos blocos={post.blocos} titulo={post.titulo} />
        ) : (
          <>
            <p className={estilos.texto}>{post.resumo}</p>
            <div className={cx(ui.aviso, estilos.emPreparo)}>
              Este post ainda não foi escrito. Nesta demonstração só o primeiro tem corpo — o resto
              entra pelo painel.
            </div>
          </>
        )}

        {post.links.length > 0 && (
          <div className={estilos.links}>
            <span className={estilos.linksRotulo}>Links do post</span>
            <div className={estilos.linksLista}>
              {post.links.map((link) =>
                link.tipo === 'inativo' ? (
                  <span key={link.rotulo} className={estilos.linkInativo}>
                    {link.rotulo}
                  </span>
                ) : (
                  <Link key={link.rotulo} href={`/portfolio/${link.slug}`}>
                    {link.rotulo}
                  </Link>
                ),
              )}
            </div>
          </div>
        )}

        <div className={estilos.fecho}>
          <Link href="/contato" className={ui.botao}>
            Quero fotos assim
          </Link>
        </div>
      </div>
    </article>
  );
}
