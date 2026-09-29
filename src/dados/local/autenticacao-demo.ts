import type { Autenticacao } from '../repositorios';

/**
 * Login de demonstração. NÃO protege nada: a credencial é pública e aparece na tela.
 * Serve para o MVP ter o fluxo de entrar e sair; a troca por autenticação de verdade
 * é uma nova implementação de `Autenticacao`.
 */
export const CREDENCIAL_DE_DEMONSTRACAO = { usuario: 'admin', senha: 'admin' } as const;

export const CHAVE_DA_SESSAO = 'ah-mvp:sessao';

function armazenamentoPadrao(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function criarAutenticacaoDemo(
  armazenamento: () => Storage | null = armazenamentoPadrao,
): Autenticacao {
  return {
    entrar(usuario, senha) {
      const certo =
        usuario.trim() === CREDENCIAL_DE_DEMONSTRACAO.usuario &&
        senha === CREDENCIAL_DE_DEMONSTRACAO.senha;
      if (certo) {
        try {
          armazenamento()?.setItem(CHAVE_DA_SESSAO, '1');
        } catch {
          // Sem armazenamento, a sessão dura só enquanto a página estiver aberta.
        }
      }
      return Promise.resolve(certo);
    },

    sair() {
      try {
        armazenamento()?.removeItem(CHAVE_DA_SESSAO);
      } catch {
        // Nada a apagar.
      }
      return Promise.resolve();
    },

    sessaoAtiva() {
      try {
        return armazenamento()?.getItem(CHAVE_DA_SESSAO) === '1';
      } catch {
        return false;
      }
    },
  };
}
