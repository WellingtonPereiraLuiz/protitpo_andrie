import { slugUnico } from '@/lib/slug';
import type { AlbumDoSite, ConteudoDoSite } from './schema';

/** Operações sobre o documento. Puras: recebem um documento e devolvem outro. */

export function mover<T>(lista: readonly T[], de: number, para: number): T[] {
  if (para < 0 || para >= lista.length) return [...lista];
  const nova = [...lista];
  const [item] = nova.splice(de, 1);
  if (item !== undefined) nova.splice(para, 0, item);
  return nova;
}

export interface ReferenciasDoAlbum {
  readonly destaques: number;
  /** Títulos dos posts que têm link para o álbum. */
  readonly posts: readonly string[];
}

export function referenciasDoAlbum(c: ConteudoDoSite, slug: string): ReferenciasDoAlbum {
  return {
    destaques: c.destaques.filter((d) => d.slug === slug).length,
    posts: c.posts
      .filter((p) => p.links.some((l) => l.tipo === 'album' && l.slug === slug))
      .map((p) => p.titulo),
  };
}

/** Exclui o álbum e tudo o que aponta para ele: destaques da home e links de posts. */
export function excluirAlbum(c: ConteudoDoSite, slug: string): ConteudoDoSite {
  return {
    ...c,
    albuns: c.albuns.filter((a) => a.slug !== slug),
    destaques: c.destaques.filter((d) => d.slug !== slug),
    posts: c.posts.map((p) => ({
      ...p,
      links: p.links.filter((l) => !(l.tipo === 'album' && l.slug === slug)),
    })),
  };
}

export type DadosDeAlbumNovo = Omit<AlbumDoSite, 'slug'>;

export const ALBUM_EM_BRANCO: DadosDeAlbumNovo = {
  categoria: 'Casamentos',
  nome: '',
  meta: '',
  resumo: '',
  texto: [''],
  capa: '',
  fotos: [],
};

/** Acrescenta um álbum no fim, com um endereço gerado do nome e que ainda não existe. */
export function adicionarAlbum(
  c: ConteudoDoSite,
  dados: DadosDeAlbumNovo,
): { conteudo: ConteudoDoSite; slug: string } {
  const slug = slugUnico(
    dados.nome,
    c.albuns.map((a) => a.slug),
    'album',
  );
  return { conteudo: { ...c, albuns: [...c.albuns, { slug, ...dados }] }, slug };
}
