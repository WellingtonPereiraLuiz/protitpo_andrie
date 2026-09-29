import { z } from 'zod';
import { MEDIA } from '@/content/media';

/**
 * O documento único com todo o conteúdo editável do site.
 *
 * Este schema é a fronteira: tudo o que é lido ou gravado passa por ele — hoje no
 * navegador, amanhã numa API. Os tipos do site vêm daqui, não de interfaces à parte.
 */

export const LIMITES = {
  heroTitulo: 60,
  heroSubtitulo: 140,
  nomeDoAlbum: 60,
  metaDoAlbum: 80,
  textoDoAlbum: 2000,
  resumo: 200,
  tituloDoPost: 90,
  tituloDoCompromisso: 80,
  campoCurto: 80,
  textoLongo: 2000,
} as const;

export const CATEGORIAS_DE_ALBUM = ['Casamentos', 'Ensaios', 'Vídeos'] as const;
export const TIPOS_DE_COMPROMISSO = ['Casamento', 'Ensaio', 'Vídeo', 'Outro'] as const;

/** Prefixo das fotos enviadas pelo painel; o resto do id é gerado na hora do envio. */
export const PREFIXO_DE_ENVIO = 'upload-';

const texto = (max: number, rotulo: string) =>
  z
    .string()
    .trim()
    .min(1, `${rotulo} não pode ficar vazio.`)
    .max(max, `${rotulo} passa de ${String(max)} caracteres.`);

const textoOpcional = (max: number, rotulo: string) =>
  z
    .string()
    .trim()
    .max(max, `${rotulo} passa de ${String(max)} caracteres.`);

export const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Endereço inválido: use letras minúsculas, números e hífens.',
  );

/** AAAA-MM-DD, e tem que ser uma data que existe no calendário. */
export const dataSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida.')
  .refine((valor) => {
    const [ano, mes, dia] = valor.split('-').map(Number) as [number, number, number];
    const d = new Date(Date.UTC(ano, mes - 1, dia));
    return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
  }, 'Data inválida.');

/** Uma foto é um arquivo da biblioteca (`public/media`) ou uma foto enviada pelo painel. */
export const fotoSchema = z.string().min(1, 'Escolha uma foto.');

export const fotoEnviadaSchema = z.object({
  largura: z.number().int().positive(),
  altura: z.number().int().positive(),
  alt: texto(LIMITES.campoCurto, 'O texto alternativo'),
});

export const albumSchema = z.object({
  slug: slugSchema,
  categoria: z.enum(CATEGORIAS_DE_ALBUM),
  nome: texto(LIMITES.nomeDoAlbum, 'O nome'),
  meta: textoOpcional(LIMITES.metaDoAlbum, 'A linha de detalhe'),
  resumo: texto(LIMITES.resumo, 'O resumo'),
  texto: z
    .array(texto(LIMITES.textoDoAlbum, 'O parágrafo'))
    .refine(
      (ps) => ps.join('').length <= LIMITES.textoDoAlbum,
      `O texto passa de ${String(LIMITES.textoDoAlbum)} caracteres.`,
    ),
  capa: fotoSchema,
  fotos: z.array(fotoSchema),
});

const blocoSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('texto'), texto: texto(LIMITES.textoLongo, 'O parágrafo') }),
  z.object({
    tipo: z.literal('galeria'),
    fotos: z.array(fotoSchema).min(1, 'A galeria está vazia.'),
  }),
  z.object({
    tipo: z.literal('video'),
    capa: fotoSchema,
    legenda: textoOpcional(LIMITES.campoCurto, 'A legenda'),
  }),
]);

const linkDoPostSchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('album'),
    rotulo: texto(LIMITES.campoCurto, 'O rótulo'),
    slug: slugSchema,
  }),
  z.object({ tipo: z.literal('inativo'), rotulo: texto(LIMITES.campoCurto, 'O rótulo') }),
]);

export const postSchema = z.object({
  slug: slugSchema,
  estado: z.enum(['publicado', 'rascunho']),
  titulo: texto(LIMITES.tituloDoPost, 'O título'),
  data: dataSchema,
  categoria: texto(LIMITES.campoCurto, 'A categoria'),
  resumo: texto(LIMITES.resumo, 'O resumo'),
  capa: fotoSchema,
  blocos: z.array(blocoSchema),
  links: z.array(linkDoPostSchema),
});

export const depoimentoSchema = z.object({
  id: slugSchema,
  autor: texto(LIMITES.campoCurto, 'O autor'),
  texto: texto(LIMITES.resumo * 2, 'O depoimento'),
  /** Depoimento inventado para a demonstração: o site mostra "exemplo fictício". */
  exemplo: z.boolean(),
});

export const servicoSchema = z.object({
  slug: slugSchema,
  titulo: texto(LIMITES.campoCurto, 'O título'),
  texto: texto(LIMITES.resumo * 2, 'O texto'),
  itens: z.array(texto(LIMITES.campoCurto, 'O item')),
  foto: fotoSchema,
});

export const destaqueSchema = z.object({
  slug: slugSchema,
  tipo: texto(LIMITES.campoCurto, 'O tipo'),
  foto: fotoSchema,
});

export const compromissoSchema = z.object({
  id: slugSchema,
  data: dataSchema,
  titulo: texto(LIMITES.tituloDoCompromisso, 'O título'),
  tipo: z.enum(TIPOS_DE_COMPROMISSO),
  local: textoOpcional(LIMITES.campoCurto, 'O local'),
  observacao: textoOpcional(LIMITES.resumo, 'A observação'),
});

function repetidos(valores: readonly string[]): string[] {
  return valores.filter((v, i) => valores.indexOf(v) !== i);
}

export const conteudoSchema = z
  .object({
    versao: z.literal(1),
    home: z.object({
      heroTitulo: texto(LIMITES.heroTitulo, 'O título da home'),
      heroSubtitulo: texto(LIMITES.heroSubtitulo, 'A frase de abertura'),
      heroFoto: fotoSchema,
    }),
    sobre: z.object({ retrato: fotoSchema }),
    destaques: z.array(destaqueSchema).max(3, 'A home tem no máximo 3 destaques.'),
    albuns: z.array(albumSchema),
    posts: z.array(postSchema),
    depoimentos: z.array(depoimentoSchema),
    servicos: z.array(servicoSchema),
    agenda: z.object({ compromissos: z.array(compromissoSchema) }),
    fotosEnviadas: z.record(z.string().startsWith(PREFIXO_DE_ENVIO), fotoEnviadaSchema),
  })
  .superRefine((c, ctx) => {
    const unicos = (valores: string[], caminho: string, oque: string) => {
      for (const v of new Set(repetidos(valores))) {
        ctx.addIssue({ code: 'custom', path: [caminho], message: `${oque} repetido: ${v}.` });
      }
    };
    unicos(
      c.albuns.map((a) => a.slug),
      'albuns',
      'Endereço de álbum',
    );
    unicos(
      c.posts.map((p) => p.slug),
      'posts',
      'Endereço de post',
    );
    unicos(
      c.depoimentos.map((d) => d.id),
      'depoimentos',
      'Depoimento',
    );
    unicos(
      c.servicos.map((s) => s.slug),
      'servicos',
      'Serviço',
    );
    unicos(
      c.agenda.compromissos.map((x) => x.id),
      'agenda',
      'Compromisso',
    );
    unicos(
      c.agenda.compromissos.map((x) => x.data),
      'agenda',
      'Já existe um compromisso no dia',
    );

    const albuns = new Set(c.albuns.map((a) => a.slug));
    c.destaques.forEach((d, i) => {
      if (!albuns.has(d.slug)) {
        ctx.addIssue({
          code: 'custom',
          path: ['destaques', i, 'slug'],
          message: `O destaque aponta para um álbum que não existe: ${d.slug}.`,
        });
      }
    });
    c.posts.forEach((p, i) => {
      p.links.forEach((l, j) => {
        if (l.tipo === 'album' && !albuns.has(l.slug)) {
          ctx.addIssue({
            code: 'custom',
            path: ['posts', i, 'links', j, 'slug'],
            message: `O link aponta para um álbum que não existe: ${l.slug}.`,
          });
        }
      });
    });

    // Toda foto citada tem que existir: na biblioteca ou entre as enviadas.
    for (const [caminho, foto] of fotosCitadas(c)) {
      // Foto vazia já tem a mensagem própria ("Escolha uma foto.").
      if (foto !== '' && !(foto in MEDIA) && !(foto in c.fotosEnviadas)) {
        ctx.addIssue({ code: 'custom', path: caminho, message: `Foto inexistente: ${foto}.` });
      }
    }
  });

export type ConteudoDoSite = z.infer<typeof conteudoSchema>;
export type AlbumDoSite = z.infer<typeof albumSchema>;
export type PostDoSite = z.infer<typeof postSchema>;
export type BlocoDoPost = z.infer<typeof blocoSchema>;
export type DepoimentoDoSite = z.infer<typeof depoimentoSchema>;
export type ServicoDoSite = z.infer<typeof servicoSchema>;
export type DestaqueDoSite = z.infer<typeof destaqueSchema>;
export type Compromisso = z.infer<typeof compromissoSchema>;
export type CategoriaDeAlbum = (typeof CATEGORIAS_DE_ALBUM)[number];
export type TipoDeCompromisso = (typeof TIPOS_DE_COMPROMISSO)[number];
export type FotoEnviada = z.infer<typeof fotoEnviadaSchema>;

type Caminho = (string | number)[];

/** Toda foto citada no documento, com o caminho de onde ela é citada. */
export function fotosCitadas(c: Omit<ConteudoDoSite, 'fotosEnviadas'>): [Caminho, string][] {
  const saida: [Caminho, string][] = [
    [['home', 'heroFoto'], c.home.heroFoto],
    [['sobre', 'retrato'], c.sobre.retrato],
  ];
  c.destaques.forEach((d, i) => saida.push([['destaques', i, 'foto'], d.foto]));
  c.albuns.forEach((a, i) => {
    saida.push([['albuns', i, 'capa'], a.capa]);
    a.fotos.forEach((f, j) => saida.push([['albuns', i, 'fotos', j], f]));
  });
  c.posts.forEach((p, i) => {
    saida.push([['posts', i, 'capa'], p.capa]);
    p.blocos.forEach((b, j) => {
      if (b.tipo === 'galeria')
        b.fotos.forEach((f, k) => saida.push([['posts', i, 'blocos', j, 'fotos', k], f]));
      if (b.tipo === 'video') saida.push([['posts', i, 'blocos', j, 'capa'], b.capa]);
    });
  });
  c.servicos.forEach((s, i) => saida.push([['servicos', i, 'foto'], s.foto]));
  return saida;
}

export interface ErroDeCampo {
  readonly caminho: string;
  readonly mensagem: string;
}

/** Valida e devolve o documento, ou a lista de erros por campo. */
export function validarConteudo(
  bruto: unknown,
): { ok: true; conteudo: ConteudoDoSite } | { ok: false; erros: ErroDeCampo[] } {
  const r = conteudoSchema.safeParse(bruto);
  if (r.success) return { ok: true, conteudo: r.data };
  return {
    ok: false,
    erros: r.error.issues.map((i) => ({ caminho: i.path.join('.'), mensagem: i.message })),
  };
}
