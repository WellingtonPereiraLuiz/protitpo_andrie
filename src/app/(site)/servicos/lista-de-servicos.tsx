'use client';

import { FotoDoConteudo } from '@/components/foto-do-conteudo';
import { useConteudo } from '@/dados/conteudo-do-site';
import estilos from './servicos.module.css';

export function ListaDeServicos() {
  const { servicos } = useConteudo().conteudo;
  return (
    <>
      {servicos.map((s) => (
        <article key={s.slug} className={estilos.servico}>
          <div className={estilos.moldura}>
            <FotoDoConteudo
              id={s.foto}
              alt={`Imagem que ilustra o serviço de ${s.titulo.toLowerCase()}`}
              preencher
              sizes="(min-width: 880px) 40vw, 100vw"
            />
          </div>
          <div className={estilos.corpo}>
            <h2>{s.titulo}</h2>
            <p>{s.texto}</p>
            <ul className={estilos.itens}>
              {s.itens.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </>
  );
}
