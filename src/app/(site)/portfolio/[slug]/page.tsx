import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Foto } from '@/components/foto';
import ui from '@/components/ui.module.css';
import { acharAlbum, ALBUNS } from '@/content/albuns';
import estilos from './album.module.css';

interface Props {
  readonly params: Promise<{ readonly slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return ALBUNS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = acharAlbum(slug);
  if (!album) return { title: 'Álbum não encontrado' };
  return { title: album.nome, description: album.resumo };
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = acharAlbum(slug);
  if (!album) notFound();

  return (
    <div className={ui.container}>
      <Link href="/portfolio" className={estilos.voltar}>
        ← Voltar ao portfólio
      </Link>

      <header>
        <span className={ui.kicker}>{album.meta}</span>
        <h1 className={ui.titulo}>{album.nome}</h1>
      </header>

      <div className={estilos.capa}>
        <Foto
          id={album.capa}
          alt={`Foto de capa do álbum ${album.nome}`}
          preencher
          priority
          sizes="(min-width: 1240px) 1192px, 100vw"
        />
      </div>

      <div className={estilos.texto}>
        {album.texto.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <div className={estilos.galeria}>
        {album.fotos.map((foto, i) => (
          <div key={foto} className={estilos.foto}>
            <Foto
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
