/** Fotos enviadas pelo painel: validação e conversão para WebP, no navegador. */

export const LADO_MAXIMO = 1920;
export const TAMANHO_MAXIMO = 15 * 1024 * 1024;
export const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** Reduz para caber em `maximo` no lado maior, sem distorcer; nunca aumenta. */
export function dimensoesLimitadas(
  largura: number,
  altura: number,
  maximo = LADO_MAXIMO,
): { largura: number; altura: number } {
  const maior = Math.max(largura, altura);
  if (maior <= maximo) return { largura, altura };
  const fator = maximo / maior;
  return { largura: Math.round(largura * fator), altura: Math.round(altura * fator) };
}

/** O motivo de recusa de um arquivo, ou `null` se ele pode ser enviado. */
export function problemaDoArquivo(arquivo: { type: string; size: number }): string | null {
  if (!(TIPOS_ACEITOS as readonly string[]).includes(arquivo.type)) {
    return 'Use uma foto em JPEG, PNG ou WebP.';
  }
  if (arquivo.size > TAMANHO_MAXIMO) return 'A foto passa de 15 MB.';
  return null;
}

export interface FotoConvertida {
  readonly arquivo: Blob;
  readonly largura: number;
  readonly altura: number;
}

/** Decodifica, reduz para no máximo 1920px e grava como WebP. */
export async function converterParaWebp(arquivo: Blob): Promise<FotoConvertida> {
  const imagem = await createImageBitmap(arquivo);
  const { largura, altura } = dimensoesLimitadas(imagem.width, imagem.height);
  const tela = document.createElement('canvas');
  tela.width = largura;
  tela.height = altura;
  const contexto = tela.getContext('2d');
  if (!contexto) throw new Error('Este navegador não consegue preparar a foto.');
  contexto.drawImage(imagem, 0, 0, largura, altura);
  imagem.close();

  const webp = await new Promise<Blob | null>((resolver) => {
    tela.toBlob(resolver, 'image/webp', 0.85);
  });
  // Navegadores sem codificador WebP devolvem PNG em silêncio: melhor recusar do que mentir.
  if (webp?.type !== 'image/webp') {
    throw new Error('Este navegador não converte fotos para WebP. Use o Chrome ou o Edge.');
  }
  return { arquivo: webp, largura, altura };
}
