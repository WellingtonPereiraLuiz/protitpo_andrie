import { criarAutenticacaoDemo } from './local/autenticacao-demo';
import { criarConteudoLocal } from './local/conteudo-local';
import { criarFotosIndexedDb } from './local/fotos-indexeddb';
import { criarVisualizacaoNaAba } from './local/visualizacao-na-aba';
import type { Servicos } from './repositorios';

let servicos: Servicos | null = null;

/**
 * O ÚNICO lugar que escolhe onde o conteúdo fica guardado.
 * MVP: tudo no navegador. Para ir para um banco, troque as implementações aqui.
 */
export function criarServicos(): Servicos {
  servicos ??= {
    conteudo: criarConteudoLocal(),
    fotos: criarFotosIndexedDb(),
    autenticacao: criarAutenticacaoDemo(),
    visualizacao: criarVisualizacaoNaAba(),
  };
  return servicos;
}
