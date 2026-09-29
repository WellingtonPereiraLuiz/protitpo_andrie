import type { Metadata } from 'next';
import Link from 'next/link';
import { Foto } from '@/components/foto';
import ui from '@/components/ui.module.css';
import { JEITOS, SOBRE } from '@/content/sobre';
import estilos from './sobre.module.css';

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Quem é Andrei Heck e como ele trabalha.',
};

export default function SobrePage() {
  return (
    <div className={ui.container}>
      <div className={estilos.topo}>
        <div className={estilos.retrato}>
          <Foto
            id={SOBRE.retrato}
            alt="Retrato do fotógrafo"
            preencher
            priority
            sizes="(min-width: 880px) 34vw, 100vw"
          />
        </div>
        <div>
          <span className={ui.kicker}>{SOBRE.kicker}</span>
          <h1 className={ui.titulo}>{SOBRE.titulo}</h1>
          <div className={estilos.texto} style={{ marginTop: '22px' }}>
            {SOBRE.paragrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </div>

      <div className={estilos.jeitos}>
        {JEITOS.map((j) => (
          <div key={j.titulo} className={estilos.jeito}>
            <span className={estilos.jeitoTitulo}>{j.titulo}</span>
            <p>{j.texto}</p>
          </div>
        ))}
      </div>

      <div className={estilos.faixa}>
        {SOBRE.faixa.map((foto, i) => (
          <div key={foto} className={estilos.faixaFoto}>
            <Foto
              id={foto}
              alt={`Foto ${String(i + 1)} da galeria da página Sobre`}
              preencher
              sizes="33vw"
            />
          </div>
        ))}
      </div>

      <div className={estilos.fecho}>
        <Link href="/contato" className={ui.botao}>
          Vamos conversar
        </Link>
      </div>
    </div>
  );
}
