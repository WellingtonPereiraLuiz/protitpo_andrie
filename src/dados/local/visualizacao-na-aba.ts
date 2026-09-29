import type { ModoDeVisualizacao } from '../repositorios';

const CHAVE = 'ah-mvp:visualizando-como-admin';

function aba(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * "Ver o site" a partir do painel. Fica na sessionStorage: vale só para esta aba, então quem
 * abre o site em outra aba, outro navegador ou digitando o endereço vê o site normal.
 */
export function criarVisualizacaoNaAba(): ModoDeVisualizacao {
  return {
    entrar(voltarPara) {
      // Só se volta para dentro do painel: nada de redirecionar para outro lugar.
      const destino = voltarPara.startsWith('/admin') ? voltarPara : '/admin';
      try {
        aba()?.setItem(CHAVE, destino);
      } catch {
        // Sem armazenamento, o site abre sem a faixa de administrador.
      }
    },
    sair() {
      try {
        aba()?.removeItem(CHAVE);
      } catch {
        // Nada a apagar.
      }
    },
    voltarPara() {
      try {
        const destino = aba()?.getItem(CHAVE) ?? null;
        return destino?.startsWith('/admin') ? destino : null;
      } catch {
        return null;
      }
    },
  };
}
