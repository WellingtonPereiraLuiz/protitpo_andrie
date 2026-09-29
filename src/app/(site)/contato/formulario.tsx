'use client';

import { useId, useState } from 'react';
import { CAMPOS, CONTATO_PAGINA, type CampoId } from '@/content/contato';
import { linkDoWhatsApp, montarMensagem, type DadosDoOrcamento } from '@/lib/whatsapp';
import estilos from './contato.module.css';
import { cx } from '@/lib/cx';

const VAZIO: DadosDoOrcamento = {
  nome: '',
  telefone: '',
  data: '',
  tipo: '',
  cidade: '',
  mensagem: '',
};

type Erros = Partial<Record<CampoId, string>>;

function validar(dados: DadosDoOrcamento): Erros {
  const erros: Erros = {};
  for (const campo of CAMPOS) {
    if (dados[campo.id].trim() === '') erros[campo.id] = campo.erro;
  }
  return erros;
}

export function FormularioDeOrcamento() {
  const [dados, setDados] = useState<DadosDoOrcamento>(VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const idResumo = useId();

  function aoEnviar(evento: React.SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    const encontrados = validar(dados);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;
    // Nada é gravado: o formulário só monta o texto e entrega ao WhatsApp.
    window.open(linkDoWhatsApp(montarMensagem(dados)), '_blank', 'noopener');
  }

  const temErros = Object.keys(erros).length > 0;

  return (
    <form className={estilos.formulario} onSubmit={aoEnviar} noValidate>
      {CAMPOS.map((campo) => {
        const erro = erros[campo.id];
        return (
          <label key={campo.id} className={estilos.campo}>
            <span className={estilos.rotulo}>{campo.rotulo}</span>
            <input
              type="text"
              name={campo.id}
              value={dados[campo.id]}
              placeholder={campo.placeholder}
              autoComplete={campo.autoComplete}
              aria-invalid={erro !== undefined}
              aria-describedby={erro !== undefined ? `${idResumo}-${campo.id}` : undefined}
              className={cx(estilos.entrada, erro !== undefined ? estilos.entradaErro : '')}
              onChange={(e) => {
                setDados((d) => ({ ...d, [campo.id]: e.target.value }));
              }}
            />
            {erro !== undefined && (
              <span id={`${idResumo}-${campo.id}`} className={estilos.mensagemErro}>
                {erro}
              </span>
            )}
          </label>
        );
      })}

      <label className={estilos.campo}>
        <span className={estilos.rotulo}>Mensagem</span>
        <textarea
          name="mensagem"
          rows={4}
          value={dados.mensagem}
          placeholder="Contem um pouco de como imaginam o dia"
          className={estilos.area}
          onChange={(e) => {
            setDados((d) => ({ ...d, mensagem: e.target.value }));
          }}
        />
      </label>

      {temErros && (
        <p className={estilos.resumoErro} role="alert">
          {CONTATO_PAGINA.resumoDeErro}
        </p>
      )}

      <button type="submit" className={estilos.botao}>
        Abrir o WhatsApp com a mensagem pronta
      </button>
      <p className={estilos.nota}>{CONTATO_PAGINA.notaDoBotao}</p>
    </form>
  );
}
