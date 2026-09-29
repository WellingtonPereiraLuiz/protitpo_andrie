'use client';

import { useId, useState } from 'react';
import { CORES_DO_TEMA, PALETAS_PRONTAS, TEMA_ORIGINAL, type ChaveDeCor } from '@/content/tema';
import {
  MINIMO_AA,
  textoDaPaleta,
  variaveisDoTema,
  verificarContraste,
  type Tema,
} from '@/dados/tema';
import { HEX } from '@/lib/cor';
import { cx } from '@/lib/cx';
import estilos from '../admin.module.css';
import { BarraDeSalvar, CampoTexto, RestaurarOriginal } from '../campos';
import { useRascunho } from '../painel';
import cores from './cores.module.css';

function mesmasCores(a: Tema['cores'], b: Tema['cores']): boolean {
  return CORES_DO_TEMA.every((c) => a[c.chave].toLowerCase() === b[c.chave].toLowerCase());
}

function EscolhaDeCor({
  chave,
  rotulo,
  valor,
  aoMudar,
  erro,
}: {
  chave: ChaveDeCor;
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  erro?: string | undefined;
}) {
  const id = useId();
  return (
    <div className={cores.cor}>
      <input
        id={`${id}-seletor`}
        type="color"
        className={cores.seletor}
        // O seletor nativo só entende #rrggbb: enquanto o texto estiver incompleto, fica no último válido.
        value={HEX.test(valor) ? valor.toLowerCase() : '#000000'}
        aria-label={`${rotulo}: escolher no seletor`}
        onChange={(e) => {
          aoMudar(e.target.value);
        }}
        data-cor={chave}
      />
      <CampoTexto rotulo={rotulo} valor={valor} aoMudar={aoMudar} erro={erro} />
    </div>
  );
}

export function SecaoCores() {
  const r = useRascunho(
    'cores',
    (c) => c.tema,
    (c, tema) => ({ ...c, tema }),
  );
  const tema = r.valor;
  const [copiado, setCopiado] = useState<'sim' | 'falhou' | null>(null);
  const validas = CORES_DO_TEMA.every((c) => HEX.test(tema.cores[c.chave]));
  const verificacoes = validas ? verificarContraste(tema.cores) : [];
  const reprovadas = verificacoes.filter((v) => !v.ok).length;

  const mudarCor = (chave: ChaveDeCor) => (valor: string) => {
    r.alterar((t) => ({ ...t, cores: { ...t.cores, [chave]: valor.trim() } }));
    setCopiado(null);
  };

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
        <h2 className={estilos.secaoTitulo}>Cores</h2>
        <p className={estilos.secaoIntro}>
          A paleta do site. Comece por uma pronta ou escolha cada cor; a prévia mostra o resultado
          na hora, e o site muda depois de Salvar.
        </p>
      </div>

      <fieldset className={estilos.grupo}>
        <legend>Paletas prontas</legend>
        <div className={cores.prontas}>
          {PALETAS_PRONTAS.map((p) => (
            <button
              key={p.nome}
              type="button"
              className={cores.pronta}
              aria-pressed={mesmasCores(tema.cores, p.cores)}
              onClick={() => {
                r.alterar({ nome: p.nome, cores: { ...p.cores } });
                setCopiado(null);
              }}
            >
              <span className={cores.amostras} aria-hidden="true">
                {CORES_DO_TEMA.map((c) => (
                  <span key={c.chave} style={{ background: p.cores[c.chave] }} />
                ))}
              </span>
              {p.nome}
            </button>
          ))}
        </div>
      </fieldset>

      <CampoTexto
        rotulo="Nome da paleta"
        obrigatorio
        limite={40}
        valor={tema.nome}
        aoMudar={(nome) => {
          r.alterar((t) => ({ ...t, nome }));
        }}
        erro={r.erroDe('tema.nome')}
      />

      <fieldset className={estilos.grupo}>
        <legend>As sete cores</legend>
        <div className={cores.grade}>
          {CORES_DO_TEMA.map((c) => (
            <EscolhaDeCor
              key={c.chave}
              chave={c.chave}
              rotulo={c.rotulo}
              valor={tema.cores[c.chave]}
              aoMudar={mudarCor(c.chave)}
              erro={r.erroDe(`tema.cores.${c.chave}`)}
            />
          ))}
        </div>
      </fieldset>

      {validas && (
        <section aria-labelledby="previa-titulo">
          <h3 id="previa-titulo" className={cores.subtitulo}>
            Prévia
          </h3>
          <div
            className={cores.previa}
            style={variaveisDoTema(tema.cores)}
            data-testid="previa-da-paleta"
          >
            <span className={cores.previaKicker}>Portfólio</span>
            <span className={cores.previaTitulo}>Alguns dias que ficaram</span>
            <p className={cores.previaTexto}>
              O abraço da mãe, a mão que treme na hora do sim. <a href="#previa-titulo">Um link</a>
            </p>
            <div className={cores.previaCartao}>
              <span className={cores.previaKicker}>Casamento · Alto Paraíso</span>
              <span>Marina &amp; Téo</span>
            </div>
            <span className={cores.previaBotao}>Pedir um orçamento</span>
          </div>
        </section>
      )}

      {validas && (
        <section aria-labelledby="contraste-titulo">
          <h3 id="contraste-titulo" className={cores.subtitulo}>
            Legibilidade
          </h3>
          <p className={estilos.ajuda}>
            Mínimo recomendado para texto: {MINIMO_AA.toFixed(1).replace('.', ',')}:1 (WCAG AA).
            {reprovadas > 0 &&
              ` ${String(reprovadas)} ${reprovadas === 1 ? 'combinação fica' : 'combinações ficam'} abaixo: dá para salvar, mas parte do texto fica difícil de ler.`}
          </p>
          <ul className={cores.verificacoes}>
            {verificacoes.map((v) => (
              <li key={v.rotulo} className={cx(v.ok ? '' : cores.reprovada)}>
                <span aria-hidden="true">{v.ok ? '✓' : '!'}</span> {v.rotulo}:{' '}
                <strong>{v.razao.toFixed(1).replace('.', ',')}:1</strong>
                {!v.ok && ' — abaixo do mínimo'}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className={estilos.acoes}>
        <button
          type="button"
          className={estilos.botaoSecundario}
          onClick={() => {
            void navigator.clipboard
              .writeText(textoDaPaleta(tema))
              .then(() => {
                setCopiado('sim');
              })
              .catch(() => {
                setCopiado('falhou');
              });
          }}
        >
          Copiar paleta
        </button>
        <RestaurarOriginal
          oque="as cores do site"
          aoRestaurar={() => {
            void r.salvar({ nome: TEMA_ORIGINAL.nome, cores: { ...TEMA_ORIGINAL.cores } });
          }}
        />
      </div>
      <p role="status" className={estilos.ajuda}>
        {copiado === 'sim' && `Paleta "${tema.nome}" copiada.`}
      </p>
      {copiado === 'falhou' && (
        <div className={estilos.campo}>
          <p className={estilos.ajuda}>
            O navegador não deixou copiar sozinho. Selecione o texto abaixo e copie:
          </p>
          <textarea
            className={estilos.area}
            readOnly
            rows={8}
            aria-label="Texto da paleta"
            value={textoDaPaleta(tema)}
            onFocus={(e) => {
              e.target.select();
            }}
          />
        </div>
      )}

      <BarraDeSalvar status={r.status} sujo={r.sujo} aoDescartar={r.descartar} />
    </form>
  );
}
