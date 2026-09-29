/** Onde o repositório local guarda as variáveis CSS prontas da paleta escolhida. */
export const CHAVE_DO_TEMA = 'ah-mvp:tema:v1';

/**
 * Script em linha, executado antes da primeira pintura do site: aplica a paleta salva para
 * ela não "piscar" do original para a escolhida. Só aceita nomes de variável e cores nos
 * formatos que o próprio site grava; qualquer outra coisa é ignorada. `String.raw` mantém as
 * barras invertidas da regex: numa template string comum elas somem e a regex quebra.
 */
export const SCRIPT_DO_TEMA = String.raw`try{var t=JSON.parse(localStorage.getItem(${JSON.stringify(CHAVE_DO_TEMA)})||"null");if(t&&typeof t==="object"){for(var k in t){var v=t[k];if(/^--[a-z-]+$/.test(k)&&typeof v==="string"&&/^(#[0-9a-f]{6}|rgba\(\d+, \d+, \d+, [\d.]+\))$/i.test(v)){document.documentElement.style.setProperty(k,v)}}}}catch(e){}`;
