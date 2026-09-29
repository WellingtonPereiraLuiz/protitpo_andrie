import type { Metadata } from 'next';
import Link from 'next/link';
import { Foto } from '@/components/foto';
import ui from '@/components/ui.module.css';
import { AVISOS_COMERCIAIS, SERVICOS } from '@/content/servicos';
import estilos from './servicos.module.css';

export const metadata: Metadata = {
  title: 'Serviços',
  description: 'Casamento, ensaios e vídeo — três jeitos de guardar o que vocês viverem.',
};

export default function ServicosPage() {
  return (
    <div className={ui.container}>
      <header className={ui.cabecalhoDePagina}>
        <span className={ui.kicker}>Serviços</span>
        <h1 className={ui.titulo}>Três jeitos de guardar o que vocês viverem</h1>
      </header>

      {SERVICOS.map((s) => (
        <article key={s.slug} className={estilos.servico}>
          <div className={estilos.moldura}>
            <Foto
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
              {s.itens.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </article>
      ))}

      <div className={estilos.avisos}>
        {AVISOS_COMERCIAIS.map((aviso) => (
          <div key={aviso.titulo} className={ui.aviso}>
            <span className={estilos.avisoTitulo}>{aviso.titulo}</span>
            <p>
              {aviso.partes.map((parte, i) =>
                typeof parte === 'string' ? (
                  <span key={i}>{parte}</span>
                ) : (
                  <strong key={i}>{parte.forte}</strong>
                ),
              )}
            </p>
          </div>
        ))}
      </div>

      <div className={estilos.fecho}>
        <Link href="/contato" className={ui.botao}>
          Pedir um orçamento
        </Link>
      </div>
    </div>
  );
}
