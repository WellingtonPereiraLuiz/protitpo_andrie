import type { ConteudoDoSite, ErroDeCampo } from './schema';

/**
 * As três fronteiras do painel com o armazenamento.
 *
 * As telas só conhecem estas interfaces. No MVP elas guardam tudo no navegador;
 * para ir para um banco basta escrever outras implementações e trocá-las em
 * `criarServicos()` — nenhuma tela muda.
 */

export interface ResultadoDaCarga {
  readonly conteudo: ConteudoDoSite;
  /** `semente` quando nada foi salvo ainda (ou o salvo estava inválido). */
  readonly origem: 'semente' | 'salvo';
  /** Preenchido quando havia algo salvo que não passou no schema e foi ignorado. */
  readonly problema: string | null;
}

export class ErroDeValidacao extends Error {
  constructor(readonly erros: readonly ErroDeCampo[]) {
    super(erros.map((e) => `${e.caminho}: ${e.mensagem}`).join('\n'));
    this.name = 'ErroDeValidacao';
  }
}

export interface RepositorioDeConteudo {
  carregar(): Promise<ResultadoDaCarga>;
  /** Valida antes de gravar; lança `ErroDeValidacao` se o documento for inválido. */
  salvar(conteudo: ConteudoDoSite): Promise<ConteudoDoSite>;
  /** Apaga o que foi salvo e devolve a semente. */
  restaurar(): Promise<ConteudoDoSite>;
  /** Avisa quando o conteúdo muda em outro lugar (outra aba, outro aparelho). */
  observar(aoMudar: () => void): () => void;
}

export interface RepositorioDeFotos {
  /** Guarda o arquivo e devolve o id com que ele passa a ser citado no documento. */
  guardar(arquivo: Blob): Promise<string>;
  /** Endereço para mostrar a foto, ou `null` se ela não existe mais. */
  endereco(id: string): Promise<string | null>;
  apagar(id: string): Promise<void>;
  apagarTudo(): Promise<void>;
}

export interface Autenticacao {
  entrar(usuario: string, senha: string): Promise<boolean>;
  sair(): Promise<void>;
  sessaoAtiva(): boolean;
}

export interface Servicos {
  readonly conteudo: RepositorioDeConteudo;
  readonly fotos: RepositorioDeFotos;
  readonly autenticacao: Autenticacao;
}
