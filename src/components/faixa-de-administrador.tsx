'use client';

import { useEffect, useState } from 'react';
import estilos from './faixa-de-administrador.module.css';

/**
 * Só aparece para quem veio do painel pelo "Ver o site", nesta aba, com a sessão ativa.
 * Qualquer outro acesso ao site (outra aba, outro navegador, endereço digitado) não a vê.
 */
export function FaixaDeAdministrador() {
  const [voltarPara, setVoltarPara] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    // Carregado sob demanda: visitantes não baixam os serviços para nada.
    void import('@/dados/servicos').then(({ criarServicos }) => {
      const { autenticacao, visualizacao } = criarServicos();
      if (ativo && autenticacao.sessaoAtiva()) setVoltarPara(visualizacao.voltarPara());
    });
    return () => {
      ativo = false;
    };
  }, []);

  if (!voltarPara) return null;

  const sair = (depois: () => void) => {
    void import('@/dados/servicos').then(({ criarServicos }) => {
      criarServicos().visualizacao.sair();
      depois();
    });
  };

  return (
    <>
      {/* Reserva o espaço da faixa no fim da página, para ela não cobrir o rodapé. */}
      <div className={estilos.espaco} aria-hidden="true" />
      <aside className={estilos.faixa} aria-label="Visualização do administrador">
        <a
          href={voltarPara}
          className={estilos.voltar}
          onClick={(e) => {
            e.preventDefault();
            sair(() => {
              window.location.assign(voltarPara);
            });
          }}
        >
          <span aria-hidden="true">←</span> Voltar ao painel
        </a>
        <span className={estilos.texto}>
          Você está vendo o site <strong>como administrador</strong>
        </span>
        <button
          type="button"
          className={estilos.visitante}
          onClick={() => {
            sair(() => {
              setVoltarPara(null);
            });
          }}
        >
          Ver como visitante
        </button>
      </aside>
    </>
  );
}
