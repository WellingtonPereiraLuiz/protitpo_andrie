'use client';

import { LIMITES, type ServicoDoSite } from '@/dados/schema';
import { SEMENTE } from '@/dados/semente';
import { slugUnico } from '@/lib/slug';
import estilos from '../admin.module.css';
import { BarraDeSalvar, CampoArea, CampoTexto, ListaDeTextos, RestaurarOriginal } from '../campos';
import { ItensEditaveis } from '../colecao';
import { useRascunho } from '../painel';
import { SeletorDeFoto } from '../seletor-de-foto';

export function SecaoServicos() {
  const r = useRascunho(
    'servicos',
    (c) => c.servicos,
    (c, servicos) => ({ ...c, servicos }),
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
        <h2 className={estilos.secaoTitulo}>Serviços</h2>
        <p className={estilos.secaoIntro}>O que aparece na página Serviços, nesta ordem.</p>
      </div>

      <ItensEditaveis<ServicoDoSite>
        itens={r.valor}
        aoMudar={r.alterar}
        nomeDoItem={(s, i) => (s.titulo ? `Serviço ${s.titulo}` : `Serviço ${String(i + 1)}`)}
        novo={() => ({
          slug: slugUnico(
            'servico',
            r.valor.map((s) => s.slug),
          ),
          titulo: '',
          texto: '',
          itens: [''],
          foto: '',
        })}
        rotuloAdicionar="Adicionar serviço"
      >
        {(s, i, mudar) => {
          const caminho = `servicos.${String(i)}`;
          return (
            <>
              <CampoTexto
                rotulo="Título"
                obrigatorio
                limite={LIMITES.campoCurto}
                valor={s.titulo}
                aoMudar={(titulo) => {
                  mudar({ ...s, titulo });
                }}
                erro={r.erroDe(`${caminho}.titulo`)}
              />
              <CampoArea
                rotulo="Texto"
                obrigatorio
                limite={LIMITES.resumo * 2}
                valor={s.texto}
                aoMudar={(texto) => {
                  mudar({ ...s, texto });
                }}
                erro={r.erroDe(`${caminho}.texto`)}
              />
              <ListaDeTextos
                legenda="O que está incluído"
                rotuloDoItem="Item"
                limite={LIMITES.campoCurto}
                itens={s.itens}
                aoMudar={(itens) => {
                  mudar({ ...s, itens });
                }}
                erroDe={r.erroDe}
                caminho={`${caminho}.itens`}
              />
              <SeletorDeFoto
                rotulo="Foto"
                valor={s.foto}
                aoEscolher={(foto) => {
                  mudar({ ...s, foto });
                }}
                erro={r.erroDe(`${caminho}.foto`)}
              />
            </>
          );
        }}
      </ItensEditaveis>

      <div className={estilos.acoes}>
        <RestaurarOriginal
          oque="os serviços"
          aoRestaurar={() => {
            void r.salvar(SEMENTE.servicos);
          }}
        />
      </div>

      <BarraDeSalvar status={r.status} sujo={r.sujo} aoDescartar={r.descartar} />
    </form>
  );
}
