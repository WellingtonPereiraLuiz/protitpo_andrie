'use client';

import { useId, useRef, useState } from 'react';
import { FotoDoConteudo } from '@/components/foto-do-conteudo';
import { MEDIA } from '@/content/media';
import { useConteudo } from '@/dados/conteudo-do-site';
import { cx } from '@/lib/cx';
import estilos from './admin.module.css';
import { CampoTexto } from './campos';
import { converterParaWebp, problemaDoArquivo, TIPOS_ACEITOS } from './envio-de-foto';
import { usePainel } from './painel';
import seletor from './seletor-de-foto.module.css';

/** Miniatura quadrada de uma foto do conteúdo (biblioteca ou enviada). */
export function Miniatura({ id, alt = '' }: { readonly id: string; readonly alt?: string }) {
  return (
    <div className={estilos.miniatura}>
      {id && <FotoDoConteudo id={id} alt={alt} preencher sizes="64px" />}
    </div>
  );
}

/** Todas as fotos que podem ser usadas: as enviadas pelo painel primeiro, depois a biblioteca. */
function useBiblioteca(): string[] {
  const { fotosEnviadas } = useConteudo().conteudo;
  return [...Object.keys(fotosEnviadas).reverse(), ...Object.keys(MEDIA)];
}

/**
 * Envia uma foto nova: o botão abre o seletor de arquivos do sistema (arrastar é um extra).
 * A foto é convertida para WebP ≤ 1920px, guardada e entra na biblioteca; quem chamou
 * recebe o id para usar no lugar escolhido (que ainda precisa de Salvar).
 */
function EnviarFoto({ aoEnviar }: { aoEnviar: (id: string) => void }) {
  const painel = usePainel();
  const entrada = useRef<HTMLInputElement>(null);
  const [escolhido, setEscolhido] = useState<{ arquivo: File; previa: string } | null>(null);
  const [alt, setAlt] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const limpar = () => {
    if (escolhido) URL.revokeObjectURL(escolhido.previa);
    setEscolhido(null);
    setAlt('');
    if (entrada.current) entrada.current.value = '';
  };

  const receber = (arquivo: File | undefined) => {
    if (!arquivo) return;
    const problema = problemaDoArquivo(arquivo);
    if (problema) {
      setErro(problema);
      return;
    }
    setErro(null);
    if (escolhido) URL.revokeObjectURL(escolhido.previa);
    setEscolhido({ arquivo, previa: URL.createObjectURL(arquivo) });
  };

  const confirmar = async () => {
    if (!escolhido) return;
    if (!alt.trim()) {
      setErro('Descreva a foto em poucas palavras: é o texto alternativo, obrigatório.');
      return;
    }
    setEnviando(true);
    try {
      const foto = await converterParaWebp(escolhido.arquivo);
      const id = await painel.servicos.fotos.guardar(foto.arquivo);
      await painel.salvar({
        ...painel.conteudo,
        fotosEnviadas: {
          ...painel.conteudo.fotosEnviadas,
          [id]: { largura: foto.largura, altura: foto.altura, alt: alt.trim() },
        },
      });
      limpar();
      setErro(null);
      aoEnviar(id);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível enviar a foto.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className={seletor.envio}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        receber(e.dataTransfer.files[0]);
      }}
    >
      <input
        ref={entrada}
        type="file"
        accept={TIPOS_ACEITOS.join(',')}
        hidden
        onChange={(e) => {
          receber(e.target.files?.[0]);
        }}
      />
      {!escolhido && (
        <p className={seletor.envioLinha}>
          <button
            type="button"
            className={estilos.botaoSecundario}
            onClick={() => {
              entrada.current?.click();
            }}
          >
            Enviar foto nova
          </button>
          <span className={estilos.ajuda}>JPEG, PNG ou WebP até 15 MB · ou arraste para cá</span>
        </p>
      )}
      {escolhido && (
        <div className={seletor.previa}>
          {/* Pré-visualização local (blob:), antes de qualquer conversão. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={escolhido.previa} alt="Pré-visualização da foto escolhida" />
          <CampoTexto
            rotulo="Texto alternativo"
            obrigatorio
            ajuda='O que a foto mostra, para quem não enxerga. Ex.: "Noivos na cachoeira".'
            valor={alt}
            aoMudar={setAlt}
          />
          <div className={estilos.acoes}>
            <button
              type="button"
              className={estilos.botao}
              disabled={enviando}
              onClick={() => {
                void confirmar();
              }}
            >
              {enviando ? 'Preparando a foto…' : 'Usar esta foto'}
            </button>
            <button type="button" className={estilos.botaoDiscreto} onClick={limpar}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {erro && (
        <p className={estilos.mensagemErro} role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

function Biblioteca({
  id,
  escolhidas,
  aoEscolher,
  rotulo,
}: {
  id: string;
  escolhidas: readonly string[];
  aoEscolher: (foto: string) => void;
  rotulo: string;
}) {
  const fotos = useBiblioteca();
  return (
    <div id={id}>
      <EnviarFoto aoEnviar={aoEscolher} />
      <div className={seletor.biblioteca} role="group" aria-label={rotulo}>
        {fotos.map((foto, i) => (
          <button
            key={foto}
            type="button"
            className={cx(seletor.opcao, escolhidas.includes(foto) ? seletor.opcaoEscolhida : '')}
            aria-pressed={escolhidas.includes(foto)}
            aria-label={`Foto ${String(i + 1)} de ${String(fotos.length)}`}
            onClick={() => {
              aoEscolher(foto);
            }}
          >
            <FotoDoConteudo id={foto} alt="" preencher sizes="96px" />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Escolhe uma foto (capa de álbum, foto de serviço…). */
export function SeletorDeFoto({
  rotulo,
  valor,
  aoEscolher,
  erro,
}: {
  readonly rotulo: string;
  readonly valor: string;
  readonly aoEscolher: (foto: string) => void;
  readonly erro?: string | undefined;
}) {
  const [aberto, setAberto] = useState(false);
  const idBiblioteca = useId();
  return (
    <div className={estilos.campo}>
      <span className={estilos.rotulo}>{rotulo}</span>
      <div className={seletor.atual}>
        <Miniatura id={valor} alt={valor ? `${rotulo} escolhida` : ''} />
        <button
          type="button"
          className={estilos.botaoSecundario}
          aria-expanded={aberto}
          aria-controls={idBiblioteca}
          onClick={() => {
            setAberto(!aberto);
          }}
        >
          {aberto
            ? 'Fechar a biblioteca'
            : valor
              ? `Trocar ${rotulo.toLowerCase()}`
              : `Escolher ${rotulo.toLowerCase()}`}
        </button>
      </div>
      {erro && <span className={estilos.mensagemErro}>{erro}</span>}
      {aberto && (
        <Biblioteca
          id={idBiblioteca}
          rotulo={`Biblioteca de fotos para ${rotulo.toLowerCase()}`}
          escolhidas={valor ? [valor] : []}
          aoEscolher={(foto) => {
            aoEscolher(foto);
            setAberto(false);
          }}
        />
      )}
    </div>
  );
}

/** Uma lista ordenada de fotos (galeria de álbum). */
export function GaleriaDeFotos({
  legenda,
  fotos,
  aoMudar,
  erroDe,
  caminho,
}: {
  readonly legenda: string;
  readonly fotos: readonly string[];
  readonly aoMudar: (fotos: string[]) => void;
  readonly erroDe: (caminho: string) => string | undefined;
  readonly caminho: string;
}) {
  const [aberto, setAberto] = useState(false);
  const idBiblioteca = useId();
  const mover = (de: number, para: number) => {
    const nova = [...fotos];
    const [f] = nova.splice(de, 1);
    if (f !== undefined) nova.splice(para, 0, f);
    aoMudar(nova);
  };
  return (
    <fieldset className={estilos.grupo}>
      <legend>{legenda}</legend>
      {erroDe(caminho) && <span className={estilos.mensagemErro}>{erroDe(caminho)}</span>}
      {fotos.length === 0 && <p className={estilos.ajuda}>Nenhuma foto na galeria ainda.</p>}
      <ol className={seletor.galeria}>
        {fotos.map((foto, i) => {
          const nome = `foto ${String(i + 1)} da galeria`;
          return (
            <li key={`${foto}-${String(i)}`} className={seletor.galeriaItem}>
              <Miniatura id={foto} alt={`Foto ${String(i + 1)} da galeria`} />
              <div className={estilos.acoes}>
                <button
                  type="button"
                  className={estilos.botaoDiscreto}
                  disabled={i === 0}
                  aria-label={`Subir ${nome}`}
                  onClick={() => {
                    mover(i, i - 1);
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={estilos.botaoDiscreto}
                  disabled={i === fotos.length - 1}
                  aria-label={`Descer ${nome}`}
                  onClick={() => {
                    mover(i, i + 1);
                  }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={estilos.botaoPerigo}
                  aria-label={`Remover ${nome}`}
                  onClick={() => {
                    aoMudar(fotos.filter((_, j) => j !== i));
                  }}
                >
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      <div>
        <button
          type="button"
          className={estilos.botaoSecundario}
          aria-expanded={aberto}
          aria-controls={idBiblioteca}
          onClick={() => {
            setAberto(!aberto);
          }}
        >
          {aberto ? 'Pronto' : 'Adicionar fotos'}
        </button>
      </div>
      {aberto && (
        <Biblioteca
          id={idBiblioteca}
          rotulo="Biblioteca de fotos: cada foto escolhida entra no fim da galeria"
          escolhidas={fotos}
          aoEscolher={(foto) => {
            aoMudar([...fotos, foto]);
          }}
        />
      )}
    </fieldset>
  );
}
