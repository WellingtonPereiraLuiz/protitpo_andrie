import Image from 'next/image';
import { MEDIA, type MediaId } from '@/content/media';

interface FotoProps {
  readonly id: MediaId;
  /**
   * As fotos deste site são genéricas de banco de imagem — não retratam o que o texto
   * ao redor descreve. O `alt` diz o papel da imagem, nunca um conteúdo inventado.
   * Ver docs/conteudo/imagens.md.
   */
  readonly alt: string;
  readonly sizes: string;
  readonly className?: string;
  readonly priority?: boolean;
  /** Preenche o elemento pai posicionado, em vez de ocupar o fluxo. */
  readonly preencher?: boolean;
}

export function Foto({
  id,
  alt,
  sizes,
  className,
  priority = false,
  preencher = false,
}: FotoProps) {
  const entrada = MEDIA[id];

  if (preencher) {
    return (
      <Image
        src={entrada.src}
        alt={alt}
        fill
        sizes={sizes}
        className={className ?? ''}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
      />
    );
  }

  return (
    <Image
      src={entrada.src}
      alt={alt}
      width={entrada.width}
      height={entrada.height}
      sizes={sizes}
      className={className ?? ''}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}
