import type { Metadata } from 'next';
import { Foto } from '@/components/foto';
import ui from '@/components/ui.module.css';
import { CONTATO_PAGINA } from '@/content/contato';
import { CONTATO } from '@/content/site';
import { linkDoWhatsApp } from '@/lib/whatsapp';
import estilos from './contato.module.css';
import { FormularioDeOrcamento } from './formulario';

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Peça um orçamento — o formulário abre o WhatsApp com a mensagem pronta.',
};

export default function ContatoPage() {
  return (
    <div className={ui.container}>
      <header className={ui.cabecalhoDePagina}>
        <span className={ui.kicker}>{CONTATO_PAGINA.kicker}</span>
        <h1 className={ui.titulo}>{CONTATO_PAGINA.titulo}</h1>
        <p className={ui.intro}>{CONTATO_PAGINA.texto}</p>
      </header>

      <div className={estilos.grade}>
        <FormularioDeOrcamento />

        <aside className={estilos.lateral}>
          <div className={estilos.foto}>
            <Foto
              id={CONTATO_PAGINA.foto}
              alt="Imagem decorativa da página de contato"
              preencher
              sizes="(min-width: 880px) 34vw, 100vw"
            />
          </div>
          <div className={estilos.bloco}>
            <span className={estilos.rotulo}>Ou, se preferirem</span>
            <a href={linkDoWhatsApp()} rel="noopener" target="_blank">
              WhatsApp · {CONTATO.whatsapp.exibicao}
            </a>
            <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>
            <a href={CONTATO.instagram.url} rel="me noopener" target="_blank">
              {CONTATO.instagram.usuario}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
