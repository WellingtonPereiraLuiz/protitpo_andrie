import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Foto } from '@/components/foto';
import ui from '@/components/ui.module.css';
import { acharPost, POSTS, type Bloco } from '@/content/posts';
import estilos from './post.module.css';
import { dataLonga } from '@/lib/calendario';
import { cx } from '@/lib/cx';

interface Props {
  readonly params: Promise<{ readonly slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = acharPost(slug);
  if (!post) return { title: 'Post não encontrado' };
  return { title: post.titulo, description: post.resumo };
}

function Blocos({ blocos, titulo }: { blocos: readonly Bloco[]; titulo: string }) {
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
                  <div key={foto} className={estilos.galeriaFoto}>
                    <Foto
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
                  <Foto
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

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = acharPost(slug);
  if (!post) notFound();

  const escrito = post.blocos.length > 0;

  return (
    <article>
      <div className={estilos.capa}>
        <Foto
          id={post.capa}
          alt={`Imagem de capa do post “${post.titulo}”`}
          preencher
          priority
          sizes="100vw"
        />
      </div>

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
