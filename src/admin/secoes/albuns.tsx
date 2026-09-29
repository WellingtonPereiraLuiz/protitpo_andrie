'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ALBUM_EM_BRANCO,
  adicionarAlbum,
  excluirAlbum,
  mover,
  referenciasDoAlbum,
  type DadosDeAlbumNovo,
} from '@/dados/operacoes';
import { CATEGORIAS_DE_ALBUM, LIMITES, type CategoriaDeAlbum } from '@/dados/schema';
import { SEMENTE } from '@/dados/semente';
import estilos from '../admin.module.css';
import {
  BarraDeSalvar,
  CampoSelecao,
  CampoTexto,
  ListaDeTextos,
  RestaurarOriginal,
  Seta,
} from '../campos';
import { usePainel, useRascunho } from '../painel';
import { GaleriaDeFotos, Miniatura, SeletorDeFoto } from '../seletor-de-foto';

/** Mensagem de sucesso/erro das ações da lista (excluir, reordenar), que gravam na hora. */
function useAcaoImediata() {
  const painel = usePainel();
  const [mensagem, setMensagem] = useState<{ erro: boolean; texto: string } | null>(null);
  const executar = (novo: Parameters<typeof painel.salvar>[0], ok: string) => {
    void painel
      .salvar(novo)
      .then(() => {
        setMensagem({ erro: false, texto: ok });
      })
      .catch((e: unknown) => {
        setMensagem({ erro: true, texto: e instanceof Error ? e.message : 'Erro ao salvar.' });
      });
  };
  return { mensagem, executar };
}

export function ListaDeAlbuns() {
  const painel = usePainel();
  const { albuns } = painel.conteudo;
  const { mensagem, executar } = useAcaoImediata();

  return (
    <>
      <h2 className={estilos.secaoTitulo}>Álbuns</h2>
      <p className={estilos.secaoIntro}>
        Casamentos, ensaios e filmes do portfólio. Cada álbum tem página própria no site; a ordem
        daqui é a ordem do portfólio.
      </p>

      <p>
        <Link href="/admin/albuns/novo" className={estilos.botao}>
          Adicionar álbum
        </Link>
      </p>

      <p role="status" className={mensagem?.erro ? estilos.statusErro : estilos.status}>
        {mensagem?.texto}
      </p>

      <ul className={estilos.lista}>
        {albuns.map((a, i) => (
          <li key={a.slug} className={estilos.item}>
            <Miniatura id={a.capa} />
            <div className={estilos.itemTexto}>
              <span className={estilos.itemNome}>{a.nome}</span>
              <span className={estilos.itemMeta}>
                {a.categoria} · {a.fotos.length + 1} fotos
              </span>
            </div>
            <div className={estilos.itemAcoes}>
              <Link
                href={`/admin/albuns/${a.slug}`}
                className={estilos.botaoSecundario}
                aria-label={`Editar ${a.nome}`}
              >
                Editar
              </Link>
              <button
                type="button"
                className={estilos.botaoDiscreto}
                disabled={i === 0}
                aria-label={`Subir ${a.nome}`}
                onClick={() => {
                  executar(
                    { ...painel.conteudo, albuns: mover(albuns, i, i - 1) },
                    `${a.nome} subiu.`,
                  );
                }}
              >
                <Seta para="cima" />
              </button>
              <button
                type="button"
                className={estilos.botaoDiscreto}
                disabled={i === albuns.length - 1}
                aria-label={`Descer ${a.nome}`}
                onClick={() => {
                  executar(
                    { ...painel.conteudo, albuns: mover(albuns, i, i + 1) },
                    `${a.nome} desceu.`,
                  );
                }}
              >
                <Seta para="baixo" />
              </button>
              <button
                type="button"
                className={estilos.botaoPerigo}
                aria-label={`Excluir ${a.nome}`}
                onClick={() => {
                  const refs = referenciasDoAlbum(painel.conteudo, a.slug);
                  const avisos = [
                    refs.destaques > 0 ? 'sai dos destaques da home' : '',
                    refs.posts.length > 0
                      ? `sai dos links do post "${refs.posts.join('", "')}"`
                      : '',
                  ].filter(Boolean);
                  const texto =
                    `Excluir o álbum "${a.nome}"? A página dele deixa de existir` +
                    (avisos.length > 0 ? ` e ele ${avisos.join(' e ')}.` : '.');
                  if (window.confirm(texto)) {
                    executar(excluirAlbum(painel.conteudo, a.slug), `"${a.nome}" foi excluído.`);
                  }
                }}
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      <RestaurarOriginal
        oque="todos os álbuns (os criados aqui serão apagados)"
        aoRestaurar={() => {
          // Volta os álbuns e também o que aponta para eles, para nada ficar órfão.
          executar(
            {
              ...painel.conteudo,
              albuns: SEMENTE.albuns,
              destaques: SEMENTE.destaques,
              posts: painel.conteudo.posts.map((p) => ({
                ...p,
                links: p.links.filter(
                  (l) => l.tipo !== 'album' || SEMENTE.albuns.some((a) => a.slug === l.slug),
                ),
              })),
            },
            'Álbuns restaurados.',
          );
        }}
      />
    </>
  );
}

function CamposDoAlbum({
  valor,
  alterar,
  erroDe,
  caminho,
}: {
  valor: DadosDeAlbumNovo;
  alterar: (f: (a: DadosDeAlbumNovo) => DadosDeAlbumNovo) => void;
  erroDe: (caminho: string) => string | undefined;
  caminho: string;
}) {
  const campo =
    <K extends keyof DadosDeAlbumNovo>(k: K) =>
    (v: DadosDeAlbumNovo[K]) => {
      alterar((a) => ({ ...a, [k]: v }));
    };
  return (
    <>
      <CampoTexto
        rotulo="Nome"
        obrigatorio
        limite={LIMITES.nomeDoAlbum}
        ajuda='Ex.: "Marina & Téo" ou "Esperando a Alice".'
        valor={valor.nome}
        aoMudar={campo('nome')}
        erro={erroDe(`${caminho}.nome`)}
      />
      <CampoSelecao<CategoriaDeAlbum>
        rotulo="Categoria"
        valor={valor.categoria}
        opcoes={CATEGORIAS_DE_ALBUM}
        aoMudar={campo('categoria')}
      />
      <CampoTexto
        rotulo="Linha de detalhe"
        limite={LIMITES.metaDoAlbum}
        ajuda='Aparece acima do nome. Ex.: "Casamento · Alto Paraíso".'
        valor={valor.meta}
        aoMudar={campo('meta')}
        erro={erroDe(`${caminho}.meta`)}
      />
      <CampoTexto
        rotulo="Resumo do cartão"
        obrigatorio
        limite={LIMITES.resumo}
        ajuda="Uma frase, no cartão do portfólio."
        valor={valor.resumo}
        aoMudar={campo('resumo')}
        erro={erroDe(`${caminho}.resumo`)}
      />
      <ListaDeTextos
        legenda="Texto do álbum (entre a capa e a galeria)"
        rotuloDoItem="Parágrafo"
        area
        itens={valor.texto}
        aoMudar={campo('texto')}
        erroDe={erroDe}
        caminho={`${caminho}.texto`}
      />
      <SeletorDeFoto
        rotulo="Capa"
        valor={valor.capa}
        aoEscolher={campo('capa')}
        erro={erroDe(`${caminho}.capa`)}
      />
      <GaleriaDeFotos
        legenda="Galeria"
        fotos={valor.fotos}
        aoMudar={campo('fotos')}
        erroDe={erroDe}
        caminho={`${caminho}.fotos`}
      />
    </>
  );
}

export function NovoAlbum() {
  const router = useRouter();
  const painel = usePainel();
  const r = useRascunho(
    'album:novo',
    () => ALBUM_EM_BRANCO,
    (c, dados) => adicionarAlbum(c, dados).conteudo,
  );

  return (
    <form
      className={estilos.formulario}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const { slug } = adicionarAlbum(painel.conteudo, r.valor);
        void r.salvar().then((ok) => {
          if (ok) router.replace(`/admin/albuns/${slug}`);
        });
      }}
    >
      <div>
        <Link href="/admin/albuns" className={estilos.botaoDiscreto}>
          ← Álbuns
        </Link>
        <h2 className={estilos.secaoTitulo} style={{ marginTop: '16px' }}>
          Novo álbum
        </h2>
        <p className={estilos.secaoIntro}>
          O endereço da página é criado a partir do nome e não muda depois.
        </p>
      </div>
      <CamposDoAlbum
        valor={r.valor}
        alterar={r.alterar}
        erroDe={r.erroDe}
        caminho={`albuns.${String(painel.conteudo.albuns.length)}`}
      />
      <BarraDeSalvar status={r.status} sujo={r.sujo} aoDescartar={r.descartar} />
    </form>
  );
}

export function EditarAlbum({ slug }: { readonly slug: string }) {
  const painel = usePainel();
  const indice = painel.conteudo.albuns.findIndex((a) => a.slug === slug);
  const r = useRascunho(
    `album:${slug}`,
    (c): DadosDeAlbumNovo => {
      const a = c.albuns.find((x) => x.slug === slug);
      if (!a) return ALBUM_EM_BRANCO;
      const { categoria, nome, meta, resumo, texto, capa, fotos } = a;
      return { categoria, nome, meta, resumo, texto, capa, fotos };
    },
    (c, dados) => ({
      ...c,
      albuns: c.albuns.map((a) => (a.slug === slug ? { slug, ...dados } : a)),
    }),
  );

  if (indice < 0) {
    return (
      <>
        <h2 className={estilos.secaoTitulo}>Álbum não encontrado</h2>
        <p>
          <Link href="/admin/albuns" className={estilos.botaoSecundario}>
            Voltar aos álbuns
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
        <Link href="/admin/albuns" className={estilos.botaoDiscreto}>
          ← Álbuns
        </Link>
        <h2 className={estilos.secaoTitulo} style={{ marginTop: '16px' }}>
          {painel.conteudo.albuns[indice]?.nome}
        </h2>
        <p className={estilos.secaoIntro}>
          Endereço: <code>/portfolio/{slug}</code>
        </p>
      </div>
      <CamposDoAlbum
        valor={r.valor}
        alterar={r.alterar}
        erroDe={r.erroDe}
        caminho={`albuns.${String(indice)}`}
      />
      <BarraDeSalvar
        status={r.status}
        sujo={r.sujo}
        aoDescartar={r.descartar}
        extra={
          <a
            href={`/portfolio/${slug}`}
            target="_blank"
            rel="noopener"
            className={estilos.botaoSecundario}
          >
            Ver álbum <span className="apenas-leitor">(abre em nova aba)</span>
          </a>
        }
      />
    </form>
  );
}
