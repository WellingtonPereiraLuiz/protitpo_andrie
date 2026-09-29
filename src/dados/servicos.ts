import { criarAutenticacaoDemo } from './local/autenticacao-demo';
import { criarConteudoLocal } from './local/conteudo-local';
import { criarFotosIndexedDb } from './local/fotos-indexeddb';
import type { Servicos } from './repositorios';

let servicos: Servicos | null = null;

/**
 * O ÚNICO lugar que escolhe onde o conteúdo fica guardado.
 * MVP: tudo no navegador. Para ir para um banco, troque as três implementações aqui.
 */
export function criarServicos(): Servicos {
  servicos ??= {
    conteudo: criarConteudoLocal(),
    fotos: criarFotosIndexedDb(),
    autenticacao: criarAutenticacaoDemo(),
  };
  return servicos;
}
