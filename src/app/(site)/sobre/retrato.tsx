'use client';

import { FotoDoConteudo } from '@/components/foto-do-conteudo';
import { useConteudo } from '@/dados/conteudo-do-site';
import estilos from './sobre.module.css';

export function RetratoDoSobre() {
  const { retrato } = useConteudo().conteudo.sobre;
  return (
    <div className={estilos.retrato}>
      <FotoDoConteudo
        id={retrato}
        alt="Retrato do fotógrafo"
        preencher
        priority
        sizes="(min-width: 880px) 34vw, 100vw"
      />
    </div>
  );
}
