import { CONTATO } from '@/content/site';

export interface DadosDoOrcamento {
  readonly nome: string;
  readonly telefone: string;
  readonly data: string;
  readonly tipo: string;
  readonly cidade: string;
  readonly mensagem: string;
}

/** Campo vazio vira reticências, como no protótipo. */
function ou(valor: string): string {
  const limpo = valor.trim();
  return limpo === '' ? '…' : limpo;
}

export function montarMensagem(dados: DadosDoOrcamento): string {
  return [
    `Oi, Andrei! Somos ${ou(dados.nome)}.`,
    `Data: ${ou(dados.data)} · ${ou(dados.tipo)} em ${ou(dados.cidade)}.`,
    dados.mensagem.trim(),
    `Meu contato: ${ou(dados.telefone)}`,
  ].join('\n');
}

export function linkDoWhatsApp(mensagem?: string): string {
  const base = `https://wa.me/${CONTATO.whatsapp.numero}`;
  if (mensagem === undefined || mensagem === '') return base;
  return `${base}?text=${encodeURIComponent(mensagem)}`;
}
