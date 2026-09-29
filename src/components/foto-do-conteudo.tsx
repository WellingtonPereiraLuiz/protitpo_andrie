'use client';

import Image from 'next/image';
import { MEDIA, type MediaId } from '@/content/media';
import { useConteudo, useEnderecoDeFotoEnviada } from '@/dados/conteudo-do-site';
import { Foto } from './foto';

function ehDaBiblioteca(id: string): id is MediaId {
  return id in MEDIA;
}

interface Props {
  /** Id de uma foto da biblioteca ou de uma foto enviada pelo painel. */
  readonly id: string;
  /** Usado para fotos da biblioteca; a foto enviada traz o próprio texto alternativo. */
  readonly alt: string;
  readonly sizes: string;
  readonly className?: string;
  readonly priority?: boolean;
  readonly preencher?: boolean;
}

/** Uma foto citada no conteúdo editável — da biblioteca ou enviada pelo painel. */
export function FotoDoConteudo({ id, alt, sizes, className, priority, preencher }: Props) {
  const { conteudo } = useConteudo();
  const enviada = ehDaBiblioteca(id) ? undefined : conteudo.fotosEnviadas[id];
  const endereco = useEnderecoDeFotoEnviada(enviada ? id : null);

  if (ehDaBiblioteca(id)) {
    return (
      <Foto
        id={id}
        alt={alt}
        sizes={sizes}
        {...(className === undefined ? {} : { className })}
        {...(priority === undefined ? {} : { priority })}
        {...(preencher === undefined ? {} : { preencher })}
      />
    );
  }

  // Foto enviada: vive no navegador (blob:), não passa pelo otimizador do Next.
  if (!enviada || endereco === null) return null;
  return preencher ? (
    <Image
      src={endereco}
      alt={enviada.alt}
      fill
      sizes={sizes}
      unoptimized
      className={className ?? ''}
    />
  ) : (
    <Image
      src={endereco}
      alt={enviada.alt}
      width={enviada.largura}
      height={enviada.altura}
      sizes={sizes}
      unoptimized
      className={className ?? ''}
    />
  );
}
