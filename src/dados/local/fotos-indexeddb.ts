import type { RepositorioDeFotos } from '../repositorios';
import { PREFIXO_DE_ENVIO } from '../schema';

const BANCO = 'ah-mvp';
const LOJA = 'fotos';

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolver, rejeitar) => {
    const pedido = indexedDB.open(BANCO, 1);
    pedido.onupgradeneeded = () => {
      pedido.result.createObjectStore(LOJA);
    };
    pedido.onsuccess = () => {
      resolver(pedido.result);
    };
    pedido.onerror = () => {
      rejeitar(pedido.error ?? new Error('Não foi possível abrir o armazenamento de fotos.'));
    };
  });
}

function operar<T>(
  modo: IDBTransactionMode,
  acao: (loja: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return abrir().then(
    (banco) =>
      new Promise<T>((resolver, rejeitar) => {
        const transacao = banco.transaction(LOJA, modo);
        const pedido = acao(transacao.objectStore(LOJA));
        transacao.oncomplete = () => {
          banco.close();
          resolver(pedido.result);
        };
        transacao.onerror = () => {
          banco.close();
          rejeitar(transacao.error ?? new Error('Falha no armazenamento de fotos.'));
        };
      }),
  );
}

/** Fotos enviadas pelo painel, guardadas no IndexedDB deste navegador. */
export function criarFotosIndexedDb(): RepositorioDeFotos {
  const enderecos = new Map<string, string>();

  return {
    async guardar(arquivo) {
      const id = `${PREFIXO_DE_ENVIO}${crypto.randomUUID()}`;
      await operar('readwrite', (loja) => loja.put(arquivo, id));
      return id;
    },

    async endereco(id) {
      const pronto = enderecos.get(id);
      if (pronto) return pronto;
      const arquivo = await operar<unknown>('readonly', (loja) => loja.get(id));
      if (!(arquivo instanceof Blob)) return null;
      const url = URL.createObjectURL(arquivo);
      enderecos.set(id, url);
      return url;
    },

    async apagar(id) {
      await operar('readwrite', (loja) => loja.delete(id));
      const url = enderecos.get(id);
      if (url) URL.revokeObjectURL(url);
      enderecos.delete(id);
    },

    async apagarTudo() {
      await operar('readwrite', (loja) => loja.clear());
      for (const url of enderecos.values()) URL.revokeObjectURL(url);
      enderecos.clear();
    },
  };
}
