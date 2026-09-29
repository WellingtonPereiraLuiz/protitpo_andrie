'use client';

import { LIMITES } from '@/dados/schema';
import { SEMENTE } from '@/dados/semente';
import estilos from '../admin.module.css';
import { VerNoSite } from '../ver-no-site';
import { BarraDeSalvar, CampoArea, CampoTexto, RestaurarOriginal } from '../campos';
import { useRascunho } from '../painel';

interface Textos {
  heroTitulo: string;
  heroSubtitulo: string;
}

const ler = (c: { home: Textos }): Textos => ({
  heroTitulo: c.home.heroTitulo,
  heroSubtitulo: c.home.heroSubtitulo,
});

export function SecaoTextos() {
  const r = useRascunho('textos', ler, (c, t) => ({ ...c, home: { ...c.home, ...t } }));

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
        <h2 className={estilos.secaoTitulo}>Textos</h2>
        <p className={estilos.secaoIntro}>O que aparece em destaque na abertura da home.</p>
      </div>

      <CampoTexto
        rotulo="Título da home"
        obrigatorio
        limite={LIMITES.heroTitulo}
        valor={r.valor.heroTitulo}
        aoMudar={(heroTitulo) => {
          r.alterar((t) => ({ ...t, heroTitulo }));
        }}
        erro={r.erroDe('home.heroTitulo')}
      />
      <CampoArea
        rotulo="Frase de abertura"
        obrigatorio
        linhas={3}
        limite={LIMITES.heroSubtitulo}
        valor={r.valor.heroSubtitulo}
        aoMudar={(heroSubtitulo) => {
          r.alterar((t) => ({ ...t, heroSubtitulo }));
        }}
        erro={r.erroDe('home.heroSubtitulo')}
      />

      <div className={estilos.acoes}>
        <VerNoSite href="/" className={estilos.botaoSecundario}>
          Ver na home
        </VerNoSite>
        <RestaurarOriginal
          oque="o título e a frase de abertura da home"
          aoRestaurar={() => {
            void r.salvar(ler(SEMENTE));
          }}
        />
      </div>

      <BarraDeSalvar status={r.status} sujo={r.sujo} aoDescartar={r.descartar} />
    </form>
  );
}
