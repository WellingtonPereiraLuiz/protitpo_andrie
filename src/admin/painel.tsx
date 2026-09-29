'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ConteudoFixo } from '@/dados/conteudo-do-site';
import { ErroDeValidacao, type Servicos } from '@/dados/repositorios';
import type { ConteudoDoSite, ErroDeCampo } from '@/dados/schema';
import { SEMENTE } from '@/dados/semente';
import { criarServicos } from '@/dados/servicos';

interface Painel {
  readonly conteudo: ConteudoDoSite;
  readonly carregado: boolean;
  /** Algo salvo estava inválido e foi ignorado ao carregar. */
  readonly problema: string | null;
  readonly servicos: Servicos;
  /** Muda a cada "Restaurar tudo": a casca usa como `key` para remontar os formulários. */
  readonly geracao: number;
  /** Valida e grava o documento inteiro. Lança `ErroDeValidacao` ou `Error` com o motivo. */
  readonly salvar: (novo: ConteudoDoSite) => Promise<void>;
  /** Volta tudo à semente, inclusive fotos enviadas e agenda. */
  readonly restaurarTudo: () => Promise<void>;
  /** Formulários com alterações não salvas avisam aqui (para confirmar antes de sair). */
  readonly marcarPendente: (id: string, pendente: boolean) => void;
  readonly haPendencias: () => boolean;
}

const Contexto = createContext<Painel | null>(null);

export function PainelProvider({ children }: { children: React.ReactNode }) {
  const servicos = useMemo(() => criarServicos(), []);
  const [estado, setEstado] = useState<{
    conteudo: ConteudoDoSite;
    carregado: boolean;
    problema: string | null;
  }>({ conteudo: SEMENTE, carregado: false, problema: null });
  const pendentes = useRef(new Set<string>());
  const [geracao, setGeracao] = useState(0);

  useEffect(() => {
    let ativo = true;
    const ler = () => {
      void servicos.conteudo.carregar().then((r) => {
        if (ativo) setEstado({ conteudo: r.conteudo, carregado: true, problema: r.problema });
      });
    };
    ler();
    const parar = servicos.conteudo.observar(ler);
    return () => {
      ativo = false;
      parar();
    };
  }, [servicos]);

  // Fechar a aba ou recarregar com alterações não salvas: o navegador pede confirmação.
  useEffect(() => {
    const aoSair = (e: BeforeUnloadEvent) => {
      if (pendentes.current.size > 0) e.preventDefault();
    };
    window.addEventListener('beforeunload', aoSair);
    return () => {
      window.removeEventListener('beforeunload', aoSair);
    };
  }, []);

  const salvar = useCallback(
    async (novo: ConteudoDoSite) => {
      const gravado = await servicos.conteudo.salvar(novo);
      setEstado({ conteudo: gravado, carregado: true, problema: null });
    },
    [servicos],
  );

  const restaurarTudo = useCallback(async () => {
    await servicos.fotos.apagarTudo();
    const semente = await servicos.conteudo.restaurar();
    pendentes.current.clear();
    setEstado({ conteudo: semente, carregado: true, problema: null });
    setGeracao((g) => g + 1);
  }, [servicos]);

  const valor = useMemo<Painel>(
    () => ({
      ...estado,
      servicos,
      geracao,
      salvar,
      restaurarTudo,
      marcarPendente: (id, pendente) => {
        if (pendente) pendentes.current.add(id);
        else pendentes.current.delete(id);
      },
      haPendencias: () => pendentes.current.size > 0,
    }),
    [estado, servicos, geracao, salvar, restaurarTudo],
  );

  return (
    <Contexto.Provider value={valor}>
      <ConteudoFixo conteudo={estado.conteudo}>{children}</ConteudoFixo>
    </Contexto.Provider>
  );
}

export function usePainel(): Painel {
  const painel = useContext(Contexto);
  if (!painel) throw new Error('usePainel fora do PainelProvider');
  return painel;
}

export type Status =
  | { readonly tipo: 'salvo' }
  | { readonly tipo: 'sujo' }
  | { readonly tipo: 'salvando' }
  | { readonly tipo: 'erro'; readonly motivo: string };

function iguais(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function paraErros(e: unknown): ErroDeCampo[] {
  if (e instanceof ErroDeValidacao) return [...e.erros];
  return [{ caminho: '', mensagem: e instanceof Error ? e.message : 'Erro desconhecido.' }];
}

/**
 * Um formulário do painel. Edita uma cópia (o rascunho); nada é gravado até `salvar()`.
 *
 * @param id       identifica o formulário (para o aviso de alterações não salvas)
 * @param ler      tira do documento a parte que este formulário edita
 * @param escrever devolve o documento com a parte editada no lugar
 */
export function useRascunho<T>(
  id: string,
  ler: (c: ConteudoDoSite) => T,
  escrever: (c: ConteudoDoSite, valor: T) => ConteudoDoSite,
) {
  const painel = usePainel();
  const salvo = ler(painel.conteudo);
  const [editado, setEditado] = useState<{ valor: T } | null>(null);
  const [status, setStatus] = useState<Status>({ tipo: 'salvo' });
  const [erros, setErros] = useState<ErroDeCampo[]>([]);

  const valor = editado ? editado.valor : salvo;
  const sujo = editado !== null && !iguais(editado.valor, salvo);
  const { marcarPendente } = painel;

  useEffect(() => {
    marcarPendente(id, sujo);
    return () => {
      marcarPendente(id, false);
    };
  }, [id, sujo, marcarPendente]);

  const alterar = (novo: T | ((atual: T) => T)) => {
    setEditado((antes) => {
      const base = antes ? antes.valor : salvo;
      return { valor: typeof novo === 'function' ? (novo as (atual: T) => T)(base) : novo };
    });
    setStatus({ tipo: 'sujo' });
  };

  /** Grava; devolve `true` se deu certo. `valorFinal` permite salvar um valor recém-montado. */
  const salvar = async (valorFinal?: T): Promise<boolean> => {
    setStatus({ tipo: 'salvando' });
    try {
      await painel.salvar(escrever(painel.conteudo, valorFinal ?? valor));
      setEditado(null);
      setErros([]);
      setStatus({ tipo: 'salvo' });
      return true;
    } catch (e) {
      const lista = paraErros(e);
      setErros(lista);
      setStatus({
        tipo: 'erro',
        motivo:
          lista.length === 1
            ? (lista[0]?.mensagem ?? '')
            : `${String(lista.length)} campos com problema.`,
      });
      return false;
    }
  };

  const descartar = () => {
    setEditado(null);
    setErros([]);
    setStatus({ tipo: 'salvo' });
  };

  /** Mensagem de erro de um campo, pelo caminho no documento (ex. `home.heroTitulo`). */
  const erroDe = (caminho: string) => erros.find((e) => e.caminho === caminho)?.mensagem;

  return {
    valor,
    alterar,
    salvar,
    descartar,
    sujo,
    status: sujo && status.tipo === 'salvo' ? ({ tipo: 'sujo' } as const) : status,
    erros,
    erroDe,
  };
}
