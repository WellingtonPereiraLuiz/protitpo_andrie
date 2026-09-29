'use client';

import { LIMITES, type DepoimentoDoSite } from '@/dados/schema';
import { SEMENTE } from '@/dados/semente';
import { idNovo } from '@/lib/slug';
import estilos from '../admin.module.css';
import { BarraDeSalvar, CampoArea, CampoTexto, RestaurarOriginal } from '../campos';
import { ItensEditaveis } from '../colecao';
import { useRascunho } from '../painel';

export function SecaoDepoimentos() {
  const r = useRascunho(
    'depoimentos',
    (c) => c.depoimentos,
    (c, depoimentos) => ({ ...c, depoimentos }),
  );

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
        <h2 className={estilos.secaoTitulo}>Depoimentos</h2>
        <p className={estilos.secaoIntro}>
          Aparecem na home, em &ldquo;Casais que confiaram&rdquo;, nesta ordem. Os que vieram do
          protótipo são marcados no site como exemplo fictício; os que você cadastrar, não.
        </p>
      </div>

      <ItensEditaveis<DepoimentoDoSite>
        itens={r.valor}
        aoMudar={r.alterar}
        nomeDoItem={(d, i) =>
          d.autor ? `Depoimento de ${d.autor}` : `Depoimento ${String(i + 1)}`
        }
        novo={() => ({ id: idNovo('d'), autor: '', texto: '', exemplo: false })}
        rotuloAdicionar="Adicionar depoimento"
      >
        {(d, i, mudar) => (
          <>
            <CampoTexto
              rotulo="Quem disse"
              obrigatorio
              limite={LIMITES.campoCurto}
              ajuda='Ex.: "Marina & Téo".'
              valor={d.autor}
              aoMudar={(autor) => {
                mudar({ ...d, autor });
              }}
              erro={r.erroDe(`depoimentos.${String(i)}.autor`)}
            />
            <CampoArea
              rotulo="Depoimento"
              obrigatorio
              limite={LIMITES.resumo * 2}
              valor={d.texto}
              aoMudar={(texto) => {
                mudar({ ...d, texto });
              }}
              erro={r.erroDe(`depoimentos.${String(i)}.texto`)}
            />
            {d.exemplo && <p className={estilos.ajuda}>Exemplo fictício do protótipo.</p>}
          </>
        )}
      </ItensEditaveis>

      <div className={estilos.acoes}>
        <RestaurarOriginal
          oque="os depoimentos"
          aoRestaurar={() => {
            void r.salvar(SEMENTE.depoimentos);
          }}
        />
      </div>

      <BarraDeSalvar status={r.status} sujo={r.sujo} aoDescartar={r.descartar} />
    </form>
  );
}
