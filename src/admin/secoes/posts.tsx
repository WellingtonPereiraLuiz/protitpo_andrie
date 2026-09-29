'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { adicionarPost, contarPosts, postEmBranco, type DadosDePostNovo } from '@/dados/operacoes';
import { LIMITES, type BlocoDoPost, type PostDoSite } from '@/dados/schema';
import { dataCurta, hojeISO } from '@/lib/calendario';
import { cx } from '@/lib/cx';
import estilos from '../admin.module.css';
import { BarraDeSalvar, CampoArea, CampoSelecao, CampoTexto } from '../campos';
import { ItensEditaveis } from '../colecao';
import { usePainel, useRascunho } from '../painel';
import { GaleriaDeFotos, Miniatura, SeletorDeFoto } from '../seletor-de-foto';

const ESTADOS = ['Rascunho', 'Publicado'] as const;
type Estado = (typeof ESTADOS)[number];
const paraEstado = (e: PostDoSite['estado']): Estado =>
  e === 'publicado' ? 'Publicado' : 'Rascunho';
const deEstado = (e: Estado): PostDoSite['estado'] =>
  e === 'Publicado' ? 'publicado' : 'rascunho';

const TIPOS_DE_BLOCO = ['Parágrafo', 'Galeria', 'Vídeo'] as const;

export function ListaDePosts() {
  const painel = usePainel();
  const { posts } = painel.conteudo;
  const { publicados, rascunhos } = contarPosts(painel.conteudo);
  const [mensagem, setMensagem] = useState<{ erro: boolean; texto: string } | null>(null);
  const ordenados = [...posts].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <>
      <h2 className={estilos.secaoTitulo}>Posts</h2>
      <p className={estilos.secaoIntro}>
        {publicados} {publicados === 1 ? 'post publicado' : 'posts publicados'} · {rascunhos}{' '}
        {rascunhos === 1 ? 'rascunho' : 'rascunhos'}. Rascunho não aparece no site.
      </p>

      <p>
        <Link href="/admin/posts/novo" className={estilos.botao}>
          Escrever novo post
        </Link>
      </p>

      <p role="status" className={mensagem?.erro ? estilos.statusErro : estilos.status}>
        {mensagem?.texto}
      </p>

      <ul className={estilos.lista}>
        {ordenados.map((p) => (
          <li key={p.slug} className={estilos.item}>
            <Miniatura id={p.capa} />
            <div className={estilos.itemTexto}>
              <span className={estilos.itemNome}>
                {p.titulo}
                {p.estado === 'rascunho' && <span className={estilos.rascunho}>Rascunho</span>}
              </span>
              <span className={estilos.itemMeta}>
                {dataCurta(p.data)} · {p.categoria}
              </span>
            </div>
            <div className={estilos.itemAcoes}>
              <Link
                href={`/admin/posts/${p.slug}`}
                className={estilos.botaoSecundario}
                aria-label={`Editar ${p.titulo}`}
              >
                Editar
              </Link>
              <button
                type="button"
                className={estilos.botaoPerigo}
                aria-label={`Excluir ${p.titulo}`}
                onClick={() => {
                  if (!window.confirm(`Excluir o post "${p.titulo}"? Ele sai do blog.`)) return;
                  void painel
                    .salvar({ ...painel.conteudo, posts: posts.filter((x) => x.slug !== p.slug) })
                    .then(() => {
                      setMensagem({ erro: false, texto: `"${p.titulo}" foi excluído.` });
                    })
                    .catch((e: unknown) => {
                      setMensagem({
                        erro: true,
                        texto: e instanceof Error ? e.message : 'Erro ao excluir.',
                      });
                    });
                }}
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function blocoNovo(tipo: (typeof TIPOS_DE_BLOCO)[number]): BlocoDoPost {
  if (tipo === 'Galeria') return { tipo: 'galeria', fotos: [] };
  if (tipo === 'Vídeo') return { tipo: 'video', capa: '', legenda: '' };
  return { tipo: 'texto', texto: '' };
}

function CamposDoPost({
  valor,
  alterar,
  erroDe,
  caminho,
}: {
  valor: DadosDePostNovo;
  alterar: (f: (p: DadosDePostNovo) => DadosDePostNovo) => void;
  erroDe: (caminho: string) => string | undefined;
  caminho: string;
}) {
  const painel = usePainel();
  const [tipoNovo, setTipoNovo] = useState<(typeof TIPOS_DE_BLOCO)[number]>('Parágrafo');
  const campo =
    <K extends keyof DadosDePostNovo>(k: K) =>
    (v: DadosDePostNovo[K]) => {
      alterar((p) => ({ ...p, [k]: v }));
    };
  const albuns = painel.conteudo.albuns;

  return (
    <>
      <CampoTexto
        rotulo="Título"
        obrigatorio
        limite={LIMITES.tituloDoPost}
        valor={valor.titulo}
        aoMudar={campo('titulo')}
        erro={erroDe(`${caminho}.titulo`)}
      />
      <CampoSelecao<Estado>
        rotulo="Estado"
        valor={paraEstado(valor.estado)}
        opcoes={ESTADOS}
        aoMudar={(e) => {
          campo('estado')(deEstado(e));
        }}
      />
      <CampoTexto
        rotulo="Data"
        tipo="date"
        obrigatorio
        valor={valor.data}
        aoMudar={campo('data')}
        erro={erroDe(`${caminho}.data`)}
      />
      <CampoTexto
        rotulo="Categoria"
        obrigatorio
        limite={LIMITES.campoCurto}
        ajuda='Ex.: "Casamentos", "Dicas", "Ensaios".'
        valor={valor.categoria}
        aoMudar={campo('categoria')}
        erro={erroDe(`${caminho}.categoria`)}
      />
      <CampoArea
        rotulo="Resumo"
        obrigatorio
        linhas={2}
        limite={LIMITES.resumo}
        ajuda="Aparece na lista do blog."
        valor={valor.resumo}
        aoMudar={campo('resumo')}
        erro={erroDe(`${caminho}.resumo`)}
      />
      <SeletorDeFoto
        rotulo="Capa"
        valor={valor.capa}
        aoEscolher={campo('capa')}
        erro={erroDe(`${caminho}.capa`)}
      />

      <fieldset className={estilos.grupo}>
        <legend>Corpo do post</legend>
        {valor.blocos.length === 0 && (
          <p className={estilos.ajuda}>
            Sem corpo, o site mostra o resumo e avisa que o post ainda não foi escrito.
          </p>
        )}
        <ItensEditaveis<BlocoDoPost>
          itens={valor.blocos}
          aoMudar={campo('blocos')}
          nomeDoItem={(b, i) =>
            `${b.tipo === 'texto' ? 'Parágrafo' : b.tipo === 'galeria' ? 'Galeria' : 'Vídeo'} (bloco ${String(i + 1)})`
          }
          novo={() => blocoNovo(tipoNovo)}
          rotuloAdicionar={`Adicionar ${tipoNovo.toLowerCase()}`}
        >
          {(b, i, mudar) => {
            const c = `${caminho}.blocos.${String(i)}`;
            if (b.tipo === 'texto') {
              return (
                <CampoArea
                  rotulo={`Texto do bloco ${String(i + 1)}`}
                  limite={LIMITES.textoLongo}
                  valor={b.texto}
                  aoMudar={(texto) => {
                    mudar({ ...b, texto });
                  }}
                  erro={erroDe(`${c}.texto`)}
                />
              );
            }
            if (b.tipo === 'galeria') {
              return (
                <GaleriaDeFotos
                  legenda={`Fotos do bloco ${String(i + 1)}`}
                  fotos={b.fotos}
                  aoMudar={(fotos) => {
                    mudar({ ...b, fotos });
                  }}
                  erroDe={erroDe}
                  caminho={`${c}.fotos`}
                />
              );
            }
            return (
              <>
                <SeletorDeFoto
                  rotulo={`Miniatura do vídeo do bloco ${String(i + 1)}`}
                  valor={b.capa}
                  aoEscolher={(capa) => {
                    mudar({ ...b, capa });
                  }}
                  erro={erroDe(`${c}.capa`)}
                />
                <CampoTexto
                  rotulo={`Legenda do vídeo do bloco ${String(i + 1)}`}
                  limite={LIMITES.campoCurto}
                  valor={b.legenda}
                  aoMudar={(legenda) => {
                    mudar({ ...b, legenda });
                  }}
                  erro={erroDe(`${c}.legenda`)}
                />
              </>
            );
          }}
        </ItensEditaveis>
        <CampoSelecao
          rotulo="Tipo do próximo bloco"
          valor={tipoNovo}
          opcoes={TIPOS_DE_BLOCO}
          aoMudar={setTipoNovo}
        />
      </fieldset>

      <fieldset className={estilos.grupo}>
        <legend>Links para álbuns</legend>
        <ItensEditaveis<DadosDePostNovo['links'][number]>
          itens={valor.links}
          aoMudar={campo('links')}
          nomeDoItem={(l, i) => `Link ${String(i + 1)}${l.rotulo ? ` (${l.rotulo})` : ''}`}
          novo={() => ({
            tipo: 'album',
            rotulo: 'Galeria completa',
            slug: albuns[0]?.slug ?? '',
          })}
          rotuloAdicionar="Adicionar link para álbum"
        >
          {(l, i, mudar) => {
            const c = `${caminho}.links.${String(i)}`;
            return (
              <>
                <CampoTexto
                  rotulo={`Texto do link ${String(i + 1)}`}
                  limite={LIMITES.campoCurto}
                  valor={l.rotulo}
                  aoMudar={(rotulo) => {
                    mudar({ ...l, rotulo });
                  }}
                  erro={erroDe(`${c}.rotulo`)}
                />
                {l.tipo === 'album' ? (
                  <CampoSelecao
                    rotulo={`Álbum do link ${String(i + 1)}`}
                    valor={albuns.find((a) => a.slug === l.slug)?.nome ?? ''}
                    opcoes={albuns.map((a) => a.nome)}
                    aoMudar={(nome) => {
                      const a = albuns.find((x) => x.nome === nome);
                      if (a) mudar({ ...l, slug: a.slug });
                    }}
                    erro={erroDe(`${c}.slug`)}
                  />
                ) : (
                  <p className={estilos.ajuda}>
                    Link sem destino (aparece no site sem virar link).
                  </p>
                )}
              </>
            );
          }}
        </ItensEditaveis>
      </fieldset>
    </>
  );
}

export function NovoPost() {
  const router = useRouter();
  const painel = usePainel();
  const [hoje] = useState(() => hojeISO());
  const r = useRascunho(
    'post:novo',
    () => postEmBranco(hoje),
    (c, dados) => adicionarPost(c, dados).conteudo,
  );

  return (
    <form
      className={estilos.formulario}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const { slug } = adicionarPost(painel.conteudo, r.valor);
        void r.salvar().then((ok) => {
          if (ok) router.replace(`/admin/posts/${slug}`);
        });
      }}
    >
      <div>
        <Link href="/admin/posts" className={estilos.botaoDiscreto}>
          ← Posts
        </Link>
        <h2 className={estilos.secaoTitulo} style={{ marginTop: '16px' }}>
          Novo post
        </h2>
        <p className={estilos.secaoIntro}>
          Começa como rascunho. O endereço é criado a partir do título e não muda depois.
        </p>
      </div>
      <CamposDoPost
        valor={r.valor}
        alterar={r.alterar}
        erroDe={r.erroDe}
        caminho={`posts.${String(painel.conteudo.posts.length)}`}
      />
      <BarraDeSalvar status={r.status} sujo={r.sujo} aoDescartar={r.descartar} />
    </form>
  );
}

export function EditarPost({ slug }: { readonly slug: string }) {
  const painel = usePainel();
  const indice = painel.conteudo.posts.findIndex((p) => p.slug === slug);
  const post = painel.conteudo.posts[indice];
  const r = useRascunho(
    `post:${slug}`,
    (c): DadosDePostNovo => {
      const p = c.posts.find((x) => x.slug === slug);
      if (!p) return postEmBranco(hojeISO());
      const { estado, titulo, data, categoria, resumo, capa, blocos, links } = p;
      return { estado, titulo, data, categoria, resumo, capa, blocos, links };
    },
    (c, dados) => ({
      ...c,
      posts: c.posts.map((p) => (p.slug === slug ? { slug, ...dados } : p)),
    }),
  );

  if (!post) {
    return (
      <>
        <h2 className={estilos.secaoTitulo}>Post não encontrado</h2>
        <p>
          <Link href="/admin/posts" className={estilos.botaoSecundario}>
            Voltar aos posts
          </Link>
        </p>
      </>
    );
  }

  return (
    <form
      className={estilos.formulario}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void r.salvar();
      }}
    >
      <div>
        <Link href="/admin/posts" className={estilos.botaoDiscreto}>
          ← Posts
        </Link>
        <h2 className={cx(estilos.secaoTitulo)} style={{ marginTop: '16px' }}>
          {post.titulo}
          {post.estado === 'rascunho' && <span className={estilos.rascunho}>Rascunho</span>}
        </h2>
        <p className={estilos.secaoIntro}>
          Endereço: <code>/blog/{slug}</code>
        </p>
      </div>
      <CamposDoPost
        valor={r.valor}
        alterar={r.alterar}
        erroDe={r.erroDe}
        caminho={`posts.${String(indice)}`}
      />
      <BarraDeSalvar
        status={r.status}
        sujo={r.sujo}
        aoDescartar={r.descartar}
        extra={
          post.estado === 'publicado' ? (
            <a
              href={`/blog/${slug}`}
              target="_blank"
              rel="noopener"
              className={estilos.botaoSecundario}
            >
              Ver post <span className="apenas-leitor">(abre em nova aba)</span>
            </a>
          ) : undefined
        }
      />
    </form>
  );
}
