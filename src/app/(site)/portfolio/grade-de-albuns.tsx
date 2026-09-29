'use client';

import Link from 'next/link';
import { FotoDoConteudo } from '@/components/foto-do-conteudo';
import { useConteudo } from '@/dados/conteudo-do-site';
import type { CategoriaDeAlbum } from '@/dados/schema';
import estilos from './portfolio.module.css';

export function GradeDeAlbuns({ ativa }: { readonly ativa: CategoriaDeAlbum }) {
  const { albuns } = useConteudo().conteudo;
  const visiveis = albuns.filter((a) => a.categoria === ativa);

  if (visiveis.length === 0) {
    return <p className={estilos.vazio}>Nenhum álbum nesta categoria ainda.</p>;
  }

  return (
    <div className={estilos.grade}>
      {visiveis.map((album) => (
        <Link key={album.slug} href={`/portfolio/${album.slug}`} className={estilos.cartao}>
          <div className={estilos.moldura}>
            <FotoDoConteudo
              id={album.capa}
              alt={`Capa do álbum ${album.nome}`}
              preencher
              sizes="(min-width: 880px) 33vw, (min-width: 620px) 50vw, 100vw"
            />
          </div>
          <div className={estilos.info}>
            <span className={estilos.meta}>{album.meta}</span>
            <span className={estilos.nome}>{album.nome}</span>
            <span className={estilos.resumo}>{album.resumo}</span>
            <span className={estilos.total}>Ver as {album.fotos.length + 1} fotos</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
