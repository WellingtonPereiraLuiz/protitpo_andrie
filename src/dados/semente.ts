import { COMPROMISSOS_DE_EXEMPLO } from '@/content/agenda';
import { ALBUNS } from '@/content/albuns';
import { DEPOIMENTOS, DESTAQUES, HERO } from '@/content/home';
import { POSTS } from '@/content/posts';
import { SERVICOS } from '@/content/servicos';
import { SOBRE } from '@/content/sobre';
import { gerarSlug } from '@/lib/slug';
import type { ConteudoDoSite } from './schema';

/**
 * O conteúdo original do site, no formato do documento editável.
 * É o que o site mostra quando nada foi salvo e para onde "Restaurar" volta.
 */
export const SEMENTE: ConteudoDoSite = {
  versao: 1,
  home: { heroTitulo: HERO.titulo, heroSubtitulo: HERO.subtitulo, heroFoto: HERO.foto },
  sobre: { retrato: SOBRE.retrato },
  destaques: DESTAQUES.map((d) => ({ slug: d.slug, tipo: d.tipo, foto: d.foto })),
  albuns: ALBUNS.map((a) => ({ ...a, texto: [...a.texto], fotos: [...a.fotos] })),
  posts: POSTS.map((p) => ({
    slug: p.slug,
    estado: 'publicado',
    titulo: p.titulo,
    data: p.data,
    categoria: p.categoria,
    resumo: p.resumo,
    capa: p.capa,
    blocos: p.blocos.map((b) => (b.tipo === 'galeria' ? { ...b, fotos: [...b.fotos] } : { ...b })),
    links: p.links.map((l) => ({ ...l })),
  })),
  depoimentos: DEPOIMENTOS.map((d) => ({ id: gerarSlug(d.autor), autor: d.autor, texto: d.texto })),
  servicos: SERVICOS.map((s) => ({ ...s, itens: [...s.itens] })),
  agenda: {
    compromissos: COMPROMISSOS_DE_EXEMPLO.map((c) => ({
      id: `c-${c.data}`,
      data: c.data,
      titulo: c.titulo,
      tipo: c.tipo,
      local: '',
      observacao: '',
    })),
  },
  fotosEnviadas: {},
};

/** Uma cópia nova da semente, que pode ser alterada sem tocar na original. */
export function copiaDaSemente(): ConteudoDoSite {
  return structuredClone(SEMENTE);
}
