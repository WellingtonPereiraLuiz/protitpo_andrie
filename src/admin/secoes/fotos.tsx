'use client';

import type { ConteudoDoSite } from '@/dados/schema';
import { SEMENTE } from '@/dados/semente';
import estilos from '../admin.module.css';
import { BarraDeSalvar, RestaurarOriginal } from '../campos';
import { useRascunho } from '../painel';
import { SeletorDeFoto } from '../seletor-de-foto';

/** O serviço cuja foto aparece como "Ensaios" (decisão D6 da spec). */
const SERVICO_ENSAIOS = 'ensaios';

interface Lugares {
  capaDaHome: string;
  destaques: string[];
  ensaios: string | null;
  sobre: string;
}

function ler(c: ConteudoDoSite): Lugares {
  return {
    capaDaHome: c.home.heroFoto,
    destaques: c.destaques.map((d) => d.foto),
    ensaios: c.servicos.find((s) => s.slug === SERVICO_ENSAIOS)?.foto ?? null,
    sobre: c.sobre.retrato,
  };
}

function escrever(c: ConteudoDoSite, l: Lugares): ConteudoDoSite {
  return {
    ...c,
    home: { ...c.home, heroFoto: l.capaDaHome },
    destaques: c.destaques.map((d, i) => ({ ...d, foto: l.destaques[i] ?? d.foto })),
    servicos: c.servicos.map((s) =>
      s.slug === SERVICO_ENSAIOS && l.ensaios !== null ? { ...s, foto: l.ensaios } : s,
    ),
    sobre: { retrato: l.sobre },
  };
}

export function SecaoFotos() {
  const r = useRascunho('fotos', ler, escrever);
  const { valor } = r;

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
        <h2 className={estilos.secaoTitulo}>Fotos</h2>
        <p className={estilos.secaoIntro}>
          As fotos de lugares fixos do site. Escolha uma da biblioteca ou envie uma nova: ela é
          convertida para WebP, com no máximo 1920px, e passa a valer depois de Salvar.
        </p>
      </div>

      <SeletorDeFoto
        rotulo="Capa da home"
        valor={valor.capaDaHome}
        aoEscolher={(capaDaHome) => {
          r.alterar((l) => ({ ...l, capaDaHome }));
        }}
        erro={r.erroDe('home.heroFoto')}
      />
      {valor.destaques.map((foto, i) => (
        <SeletorDeFoto
          key={i}
          rotulo={`Destaque ${String(i + 1)}`}
          valor={foto}
          aoEscolher={(nova) => {
            r.alterar((l) => ({
              ...l,
              destaques: l.destaques.map((d, j) => (j === i ? nova : d)),
            }));
          }}
          erro={r.erroDe(`destaques.${String(i)}.foto`)}
        />
      ))}
      {valor.ensaios !== null && (
        <SeletorDeFoto
          rotulo="Ensaios"
          valor={valor.ensaios}
          aoEscolher={(ensaios) => {
            r.alterar((l) => ({ ...l, ensaios }));
          }}
        />
      )}
      <SeletorDeFoto
        rotulo="Foto do Sobre"
        valor={valor.sobre}
        aoEscolher={(sobre) => {
          r.alterar((l) => ({ ...l, sobre }));
        }}
        erro={r.erroDe('sobre.retrato')}
      />

      <div className={estilos.acoes}>
        <RestaurarOriginal
          oque="as fotos destes lugares"
          aoRestaurar={() => {
            void r.salvar(ler(SEMENTE));
          }}
        />
      </div>

      <BarraDeSalvar status={r.status} sujo={r.sujo} aoDescartar={r.descartar} />
    </form>
  );
}
