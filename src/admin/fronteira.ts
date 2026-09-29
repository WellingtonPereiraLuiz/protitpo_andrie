/**
 * Passagens pela fronteira de login do painel (entrar, ser barrado sem sessão, sair) usam
 * navegação completa, não o roteador do cliente. Motivo medido: no Firefox, um
 * router.replace disparado logo que a página monta às vezes não concluía, e o painel ficava
 * em branco (ou preso no login). Trocar de área com uma carga de página é o comportamento de
 * um redirect de servidor, que é o que isto imita.
 */
export function atravessarFronteira(destino: '/admin/entrar' | '/admin/textos'): void {
  window.location.replace(destino);
}
