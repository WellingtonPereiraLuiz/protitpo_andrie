import { describe, expect, it } from 'vitest';
import { PALETAS_PRONTAS, TEMA_ORIGINAL } from '@/content/tema';
import { validarConteudo } from '@/dados/schema';
import { SEMENTE } from '@/dados/semente';
import { ehOriginal, textoDaPaleta, variaveisDoTema, verificarContraste } from '@/dados/tema';
import { CHAVE_DO_TEMA, SCRIPT_DO_TEMA } from '@/dados/tema-antes-da-pintura';
import { comAlfa, contraste, misturar } from '@/lib/cor';

describe('cor', () => {
  it('calcula o contraste WCAG', () => {
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contraste('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    // Os números que o axe mediu no site antes do ajuste de 29/09.
    expect(contraste('#a06f24', '#f4f2ef')).toBeCloseTo(3.92, 2);
    expect(contraste('#85807a', '#f4f2ef')).toBeCloseTo(3.5, 2);
  });

  it('mistura e aplica transparência', () => {
    expect(misturar('#000000', '#ffffff', 0.5)).toBe('#808080');
    expect(misturar('#102030', '#102030', 0.3)).toBe('#102030');
    expect(comAlfa('#201f1d', 0.14)).toBe('rgba(32, 31, 29, 0.14)');
  });
});

describe('tema', () => {
  it('o tema original é o de globals.css', () => {
    expect(variaveisDoTema(TEMA_ORIGINAL.cores)).toMatchObject({
      '--paper': '#f4f2ef',
      '--ink': '#201f1d',
      '--muted': '#625d57',
      '--gold': '#7d5411',
      '--gold-stroke': '#b68235',
    });
    expect(ehOriginal(SEMENTE.tema)).toBe(true);
  });

  it.each(PALETAS_PRONTAS.map((p) => [p.nome, p] as const))(
    'a paleta pronta "%s" passa no contraste AA em todos os pares',
    (_nome, paleta) => {
      const reprovados = verificarContraste(paleta.cores).filter((v) => !v.ok);
      expect(reprovados.map((v) => `${v.rotulo}: ${v.razao.toFixed(2)}`)).toEqual([]);
    },
  );

  it('avisa quando uma escolha fica abaixo do AA', () => {
    const cores = { ...TEMA_ORIGINAL.cores, apagado: '#b0aaa3' };
    const apagado = verificarContraste(cores).find(
      (v) => v.rotulo === 'Apagado sobre o fundo (legendas)',
    );
    expect(apagado?.ok).toBe(false);
  });

  it('copia a paleta como texto, com o nome e as sete cores', () => {
    expect(textoDaPaleta(TEMA_ORIGINAL)).toBe(
      [
        'Paleta "Original"',
        'Fundo: #F4F2EF',
        'Superfície: #E9E6E1',
        'Texto: #201F1D',
        'Texto suave: #3D3936',
        'Apagado: #625D57',
        'Destaque: #7D5411',
        'Contorno: #B68235',
      ].join('\n'),
    );
  });

  it('documento salvo antes da paleta existir continua válido, com as cores originais', () => {
    const antigo: Record<string, unknown> = { ...SEMENTE };
    delete antigo.tema;
    const r = validarConteudo(antigo);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.conteudo.tema).toEqual(SEMENTE.tema);
  });

  it('recusa cor fora do formato #rrggbb', () => {
    const r = validarConteudo({
      ...SEMENTE,
      tema: { nome: 'X', cores: { ...SEMENTE.tema.cores, destaque: 'vermelho' } },
    });
    expect(r.ok ? [] : r.erros).toEqual([
      { caminho: 'tema.cores.destaque', mensagem: 'Use uma cor no formato #rrggbb.' },
    ]);
  });
});

const PALETA_NOITE = PALETAS_PRONTAS.find((p) => p.nome === 'Noite') ?? TEMA_ORIGINAL;

describe('script que aplica a paleta antes da primeira pintura', () => {
  function rodarScript() {
    // Executa exatamente o texto que vai inline no layout do site — é isso que se testa.
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- ver comentário acima
    const script = new Function(SCRIPT_DO_TEMA) as () => void;
    script();
  }

  it('aplica as variáveis salvas no <html>', () => {
    localStorage.setItem(CHAVE_DO_TEMA, JSON.stringify(variaveisDoTema(PALETA_NOITE.cores)));
    rodarScript();
    const estilo = document.documentElement.style;
    expect(estilo.getPropertyValue('--paper')).toBe('#1c1b1a');
    expect(estilo.getPropertyValue('--line')).toBe('rgba(242, 238, 232, 0.14)');
    estilo.cssText = '';
    localStorage.clear();
  });

  it('ignora nomes e valores fora do formato que o site grava', () => {
    localStorage.setItem(
      CHAVE_DO_TEMA,
      JSON.stringify({
        '--paper': 'url(javascript:alert(1))',
        color: '#000000',
        '--gold': '#7d5411',
      }),
    );
    rodarScript();
    const estilo = document.documentElement.style;
    expect(estilo.getPropertyValue('--paper')).toBe('');
    expect(estilo.getPropertyValue('color')).toBe('');
    expect(estilo.getPropertyValue('--gold')).toBe('#7d5411');
    estilo.cssText = '';
    localStorage.clear();
  });

  it('com o armazenamento corrompido, não faz nada e não lança', () => {
    localStorage.setItem(CHAVE_DO_TEMA, '{');
    expect(rodarScript).not.toThrow();
    localStorage.clear();
  });
});
