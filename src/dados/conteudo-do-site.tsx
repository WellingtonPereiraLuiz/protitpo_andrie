'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ConteudoDoSite } from './schema';
import { SEMENTE } from './semente';

/**
 * Os repositórios (e o Zod, que valida o que foi salvo) só são baixados depois que a
 * página carregou: quem nunca abriu o painel não paga por eles no primeiro carregamento.
 */
function servicos() {
  return import('./servicos').then((m) => m.criarServicos());
}

interface EstadoDoConteudo {
  readonly conteudo: ConteudoDoSite;
  /** `false` até a primeira leitura do que foi salvo terminar. */
  readonly carregado: boolean;
}

// Sem provedor (testes de unidade, por exemplo), vale a semente, já carregada.
const Contexto = createContext<EstadoDoConteudo>({ conteudo: SEMENTE, carregado: true });

/**
 * O site é gerado com a semente. No navegador, depois de carregar, troca pelo conteúdo
 * salvo pelo painel — se houver — e acompanha mudanças feitas em outra aba.
 */
export function ConteudoProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<EstadoDoConteudo>({ conteudo: SEMENTE, carregado: false });

  useEffect(() => {
    let ativo = true;
    let parar: () => void = () => undefined;
    void servicos().then(({ conteudo: repositorio }) => {
      if (!ativo) return;
      const ler = () => {
        void repositorio.carregar().then((r) => {
          if (!ativo) return;
          // Nada salvo: continua com a mesma semente, sem renderizar tudo de novo à toa.
          setEstado({ conteudo: r.origem === 'salvo' ? r.conteudo : SEMENTE, carregado: true });
        });
      };
      ler();
      parar = repositorio.observar(ler);
    });
    return () => {
      ativo = false;
      parar();
    };
  }, []);

  return <Contexto.Provider value={estado}>{children}</Contexto.Provider>;
}

export function useConteudo(): EstadoDoConteudo {
  return useContext(Contexto);
}

/** Endereço de uma foto enviada pelo painel, ou `null` enquanto carrega / se não existe. */
export function useEnderecoDeFotoEnviada(id: string | null): string | null {
  const [endereco, setEndereco] = useState<{ id: string; url: string | null } | null>(null);

  useEffect(() => {
    if (id === null) return undefined;
    let ativo = true;
    void servicos()
      .then((s) => s.fotos.endereco(id))
      .then((url) => {
        if (ativo) setEndereco({ id, url });
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  return endereco !== null && endereco.id === id ? endereco.url : null;
}
