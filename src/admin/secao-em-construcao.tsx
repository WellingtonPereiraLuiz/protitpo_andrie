import estilos from './admin.module.css';

/** Marca provisória das seções que ainda serão implementadas (fatias 4 a 8 da spec). */
export function SecaoEmConstrucao({ titulo }: { readonly titulo: string }) {
  return (
    <>
      <h2 className={estilos.secaoTitulo}>{titulo}</h2>
      <p className={estilos.secaoIntro}>Esta seção ainda está sendo construída.</p>
    </>
  );
}
