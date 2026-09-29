'use client';

import Link from 'next/link';
import { FotoDoConteudo } from '@/components/foto-do-conteudo';
import { HERO } from '@/content/home';
import { useConteudo } from '@/dados/conteudo-do-site';
import estilos from './home.module.css';

export function HeroDaHome() {
  const { home } = useConteudo().conteudo;
  return (
    <section className={estilos.hero}>
      <FotoDoConteudo
        id={home.heroFoto}
        alt="Imagem de abertura do site"
        preencher
        priority
        sizes="100vw"
      />
      <div className={estilos.heroVeu} />
      <div className={estilos.heroTexto}>
        <span className={estilos.heroKicker}>{HERO.kicker}</span>
        <h1 className={estilos.heroTitulo}>{home.heroTitulo}</h1>
        <div className={estilos.heroRisco} />
        <p className={estilos.heroSub}>{home.heroSubtitulo}</p>
      </div>
    </section>
  );
}

export function DestaquesDaHome() {
  const { destaques, albuns } = useConteudo().conteudo;
  return (
    <div className={estilos.grade}>
      {destaques.map((d) => {
        const nome = albuns.find((a) => a.slug === d.slug)?.nome ?? '';
        return (
          <Link key={d.slug} href={`/portfolio/${d.slug}`} className={estilos.cartao}>
            <div className={estilos.moldura}>
              <FotoDoConteudo
                id={d.foto}
                alt={`Capa do álbum ${nome}`}
                preencher
                sizes="(min-width: 880px) 33vw, 50vw"
              />
            </div>
            <div className={estilos.legenda}>
              <span className={estilos.legendaNome}>{nome}</span>
              <span className={estilos.legendaTipo}>{d.tipo}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function DepoimentosDaHome() {
  const { depoimentos } = useConteudo().conteudo;
  return (
    <div className={estilos.depoimentosGrade}>
      {depoimentos.map((d) => (
        <figure key={d.id} className={estilos.depoimento}>
          <p>{d.texto}</p>
          <figcaption>
            {d.autor}
            {d.exemplo && ' · exemplo fictício'}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
