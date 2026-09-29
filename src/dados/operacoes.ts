import { slugUnico } from '@/lib/slug';
import type { AlbumDoSite, ConteudoDoSite, PostDoSite } from './schema';

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

/** Segmentos de /portfolio/… que já são rotas do site e não podem virar álbum. */
export const ENDERECOS_RESERVADOS_DO_PORTFOLIO = ['categoria'] as const;

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
    [...c.albuns.map((a) => a.slug), ...ENDERECOS_RESERVADOS_DO_PORTFOLIO],
    'album',
  );
  return { conteudo: { ...c, albuns: [...c.albuns, { slug, ...dados }] }, slug };
}

export type DadosDePostNovo = Omit<PostDoSite, 'slug'>;

export function postEmBranco(hoje: string): DadosDePostNovo {
  return {
    estado: 'rascunho',
    titulo: '',
    data: hoje,
    categoria: '',
    resumo: '',
    capa: '',
    blocos: [{ tipo: 'texto', texto: '' }],
    links: [],
  };
}

/** Acrescenta um post, com endereço gerado do título e que ainda não existe. */
export function adicionarPost(
  c: ConteudoDoSite,
  dados: DadosDePostNovo,
): { conteudo: ConteudoDoSite; slug: string } {
  const slug = slugUnico(
    dados.titulo,
    c.posts.map((p) => p.slug),
    'post',
  );
  return { conteudo: { ...c, posts: [...c.posts, { slug, ...dados }] }, slug };
}

export function contarPosts(c: ConteudoDoSite): { publicados: number; rascunhos: number } {
  const publicados = c.posts.filter((p) => p.estado === 'publicado').length;
  return { publicados, rascunhos: c.posts.length - publicados };
}
