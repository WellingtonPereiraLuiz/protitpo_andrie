import Link from 'next/link';
import { Foto } from '@/components/foto';
import ui from '@/components/ui.module.css';
import { APRESENTACAO, CHAMADA_FINAL, DEPOIMENTOS, DESTAQUES, HERO } from '@/content/home';
import { CONTATO } from '@/content/site';
import { linkDoWhatsApp } from '@/lib/whatsapp';
import estilos from './home.module.css';
import { cx } from '@/lib/cx';

export default function HomePage() {
  return (
    <>
      <section className={estilos.hero}>
        <Foto id={HERO.foto} alt="Imagem de abertura do site" preencher priority sizes="100vw" />
        <div className={estilos.heroVeu} />
        <div className={estilos.heroTexto}>
          <span className={estilos.heroKicker}>{HERO.kicker}</span>
          <h1 className={estilos.heroTitulo}>{HERO.titulo}</h1>
          <div className={estilos.heroRisco} />
          <p className={estilos.heroSub}>{HERO.subtitulo}</p>
        </div>
      </section>

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

          <div className={estilos.grade}>
            {DESTAQUES.map((d) => (
              <Link key={d.nome} href={`/portfolio/${d.slug}`} className={estilos.cartao}>
                <div className={estilos.moldura}>
                  <Foto
                    id={d.foto}
                    alt={`Capa do álbum ${d.nome}`}
                    preencher
                    sizes="(min-width: 880px) 33vw, 50vw"
                  />
                </div>
                <div className={estilos.legenda}>
                  <span className={estilos.legendaNome}>{d.nome}</span>
                  <span className={estilos.legendaTipo}>{d.tipo}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={cx(ui.secao, estilos.depoimentos)}>
        <div className={ui.container}>
          <span className={ui.kicker}>Casais que confiaram</span>
          <div className={estilos.depoimentosGrade}>
            {DEPOIMENTOS.map((d) => (
              <figure key={d.autor} className={estilos.depoimento}>
                <p>{d.texto}</p>
                <figcaption>{d.autor} · exemplo fictício</figcaption>
              </figure>
            ))}
          </div>
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
