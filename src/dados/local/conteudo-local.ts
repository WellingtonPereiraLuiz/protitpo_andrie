import { ErroDeValidacao, type RepositorioDeConteudo } from '../repositorios';
import { validarConteudo, type ConteudoDoSite } from '../schema';
import { copiaDaSemente } from '../semente';
import { ehOriginal, variaveisDoTema } from '../tema';
import { CHAVE_DO_TEMA } from '../tema-antes-da-pintura';

export const CHAVE_DO_CONTEUDO = 'ah-mvp:conteudo:v1';

/** O evento `storage` só chega nas outras abas; este avisa a própria aba. */
const EVENTO_LOCAL = 'ah-mvp:conteudo-mudou';

function armazenamentoPadrao(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    // Navegação privada ou dados do site bloqueados.
    return null;
  }
}

function avisar() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_LOCAL));
}

export function criarConteudoLocal(
  armazenamento: () => Storage | null = armazenamentoPadrao,
): RepositorioDeConteudo {
  return {
    carregar() {
      const bruto = (() => {
        try {
          return armazenamento()?.getItem(CHAVE_DO_CONTEUDO) ?? null;
        } catch {
          return null;
        }
      })();
      if (bruto === null) {
        return Promise.resolve({ conteudo: copiaDaSemente(), origem: 'semente', problema: null });
      }

      let dado: unknown;
      try {
        dado = JSON.parse(bruto);
      } catch {
        return Promise.resolve({
          conteudo: copiaDaSemente(),
          origem: 'semente',
          problema: 'O conteúdo salvo neste navegador está corrompido e foi ignorado.',
        });
      }

      const r = validarConteudo(dado);
      if (!r.ok) {
        return Promise.resolve({
          conteudo: copiaDaSemente(),
          origem: 'semente',
          problema: `O conteúdo salvo neste navegador é inválido e foi ignorado (${r.erros[0]?.caminho ?? '?'}: ${r.erros[0]?.mensagem ?? '?'}).`,
        });
      }
      return Promise.resolve({ conteudo: r.conteudo, origem: 'salvo', problema: null });
    },

    salvar(conteudo: ConteudoDoSite) {
      const r = validarConteudo(conteudo);
      if (!r.ok) return Promise.reject(new ErroDeValidacao(r.erros));
      const alvo = armazenamento();
      if (!alvo) {
        return Promise.reject(new Error('Este navegador não deixa o site guardar dados.'));
      }
      try {
        alvo.setItem(CHAVE_DO_CONTEUDO, JSON.stringify(r.conteudo));
        // As variáveis prontas da paleta, para o script que roda antes da primeira pintura.
        if (ehOriginal(r.conteudo.tema)) alvo.removeItem(CHAVE_DO_TEMA);
        else alvo.setItem(CHAVE_DO_TEMA, JSON.stringify(variaveisDoTema(r.conteudo.tema.cores)));
      } catch {
        return Promise.reject(new Error('Não coube: o espaço deste navegador para o site acabou.'));
      }
      avisar();
      return Promise.resolve(r.conteudo);
    },

    restaurar() {
      try {
        armazenamento()?.removeItem(CHAVE_DO_CONTEUDO);
        armazenamento()?.removeItem(CHAVE_DO_TEMA);
      } catch {
        // Nada salvo para apagar.
      }
      avisar();
      return Promise.resolve(copiaDaSemente());
    },

    observar(aoMudar) {
      if (typeof window === 'undefined') return () => undefined;
      const aoArmazenar = (e: StorageEvent) => {
        if (e.key === null || e.key === CHAVE_DO_CONTEUDO) aoMudar();
      };
      window.addEventListener('storage', aoArmazenar);
      window.addEventListener(EVENTO_LOCAL, aoMudar);
      return () => {
        window.removeEventListener('storage', aoArmazenar);
        window.removeEventListener(EVENTO_LOCAL, aoMudar);
      };
    },
  };
}
