import Link from 'next/link';
import { Foto } from '@/components/foto';
import ui from '@/components/ui.module.css';
import { APRESENTACAO, CHAMADA_FINAL } from '@/content/home';
import { CONTATO } from '@/content/site';
import { linkDoWhatsApp } from '@/lib/whatsapp';
import { DepoimentosDaHome, DestaquesDaHome, HeroDaHome } from './home-dinamica';
import estilos from './home.module.css';
import { cx } from '@/lib/cx';

export default function HomePage() {
  return (
    <>
      <HeroDaHome />

      <section className={ui.secao}>
        <div className={cx(ui.container, estilos.apresentacao)}>
          <div>
            <span className={ui.kicker}>{APRESENTACAO.kicker}</span>
            <h2 className={ui.tituloSecao}>{APRESENTACAO.titulo}</h2>
          </div>
          <div className={ui.leitura}>
            {APRESENTACAO.paragrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p style={{ marginTop: '28px' }}>
              <Link href="/sobre" className={cx(ui.botao, ui.botaoSecundario)}>
                Conhecer minha história
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className={ui.secao}>
        <div className={ui.container}>
          <div className={estilos.destaquesTopo}>
            <div>
              <span className={ui.kicker}>Portfólio</span>
              <h2 className={ui.tituloSecao}>Alguns dias que ficaram</h2>
            </div>
            <Link href="/portfolio" className={cx(ui.botao, ui.botaoSecundario)}>
              Ver o portfólio
            </Link>
          </div>

          <DestaquesDaHome />
        </div>
      </section>

      <section className={cx(ui.secao, estilos.depoimentos)}>
        <div className={ui.container}>
          <span className={ui.kicker}>Casais que confiaram</span>
          <DepoimentosDaHome />
        </div>
      </section>

      <section className={estilos.chamada}>
        <Foto
          id={CHAMADA_FINAL.foto}
          alt="Imagem de fundo da chamada para contato"
          preencher
          sizes="100vw"
        />
        <div className={estilos.chamadaVeu} />
        <div className={estilos.chamadaTexto}>
          <span className={estilos.heroKicker}>{CHAMADA_FINAL.kicker}</span>
          <h2 className={ui.tituloSecao}>{CHAMADA_FINAL.titulo}</h2>
          <p>{CHAMADA_FINAL.texto}</p>
          <div className={estilos.chamadaAcoes}>
            <Link href="/contato" className={cx(ui.botao, ui.botaoClaro)}>
              Pedir um orçamento
            </Link>
            <a
              className={estilos.chamadaWhats}
              href={linkDoWhatsApp()}
              rel="noopener"
              target="_blank"
            >
              ou chamar no WhatsApp · {CONTATO.whatsapp.exibicao}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
