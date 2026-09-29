'use client';

import Link from 'next/link';
import { ViewTransition } from 'react';
import { FotoDoConteudo } from '@/components/foto-do-conteudo';
import { Carregando, NaoEncontrado } from '@/components/nao-encontrado';
import ui from '@/components/ui.module.css';
import { useConteudo } from '@/dados/conteudo-do-site';
import estilos from './album.module.css';

export function Album({ slug }: { readonly slug: string }) {
  const { conteudo, carregado } = useConteudo();
  const album = conteudo.albuns.find((a) => a.slug === slug);

  if (!album) {
    return carregado ? (
      <NaoEncontrado oque="Não encontrei esse álbum" voltar="/portfolio" />
    ) : (
      <Carregando />
    );
  }

  return (
    <div className={ui.container}>
      <Link href="/portfolio" className={estilos.voltar}>
        ← Voltar ao portfólio
      </Link>

      <header>
        <span className={ui.kicker}>{album.meta}</span>
        <h1 className={ui.titulo}>{album.nome}</h1>
      </header>

      <ViewTransition name={`capa-${album.slug}`} share="capa" default="none">
        <div className={estilos.capa}>
          <FotoDoConteudo
            id={album.capa}
            alt={`Foto de capa do álbum ${album.nome}`}
            preencher
            priority
            sizes="(min-width: 1240px) 1192px, 100vw"
          />
        </div>
      </ViewTransition>

      <div className={estilos.texto}>
        {album.texto.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className={estilos.galeria}>
        {album.fotos.map((foto, i) => (
          <div key={`${foto}-${String(i)}`} className={estilos.foto}>
            <FotoDoConteudo
              id={foto}
              alt={`Foto ${String(i + 2)} do álbum ${album.nome}`}
              preencher
              sizes="(min-width: 880px) 33vw, 50vw"
            />
          </div>
        ))}
      </div>

      <div className={estilos.pe}>
        <span className={estilos.contagem}>{album.fotos.length + 1} fotos neste álbum</span>
        <Link href="/contato" className={ui.botao}>
          Quero um dia assim
        </Link>
      </div>
    </div>
  );
}
