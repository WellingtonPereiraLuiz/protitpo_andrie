import { describe, expect, it } from 'vitest';
import { ALBUNS, fotosDoAlbum } from '@/content/albuns';
import { DESTAQUES } from '@/content/home';
import { MEDIA, type MediaId } from '@/content/media';
import { POSTS } from '@/content/posts';
import { SERVICOS } from '@/content/servicos';
import { SOBRE } from '@/content/sobre';
import { CONTATO } from '@/content/site';
import { SEMENTE } from '@/dados/semente';
import { celulasDoMes, diasNoMes, type MesDoAno } from '@/lib/calendario';
import { cx } from '@/lib/cx';
import { linkDoWhatsApp, montarMensagem } from '@/lib/whatsapp';

/** Toda imagem citada por qualquer tela. */
function todasAsImagens(): MediaId[] {
  return [
    ...ALBUNS.flatMap((a) => fotosDoAlbum(a)),
    ...POSTS.map((p) => p.capa),
    ...POSTS.flatMap((p) =>
      p.blocos.flatMap((b) =>
        b.tipo === 'galeria' ? [...b.fotos] : b.tipo === 'video' ? [b.capa] : [],
      ),
    ),
    ...SERVICOS.map((s) => s.foto),
    ...DESTAQUES.map((d) => d.foto),
    SOBRE.retrato,
    ...SOBRE.faixa,
  ];
}

describe('imagens', () => {
  it('toda imagem citada existe no manifesto', () => {
    for (const id of todasAsImagens()) {
      expect(MEDIA[id], `imagem ausente: ${id}`).toBeDefined();
    }
  });

  it('nenhuma imagem é base64 e todas são WebP local', () => {
    for (const entrada of Object.values(MEDIA)) {
      expect(entrada.src).toMatch(/^\/media\/[\w-]+\.webp$/);
      expect(entrada.src).not.toContain('base64');
    }
  });

  it('todo arquivo tem dimensões declaradas e nenhum passa de 1920px', () => {
    for (const [id, entrada] of Object.entries(MEDIA)) {
      expect(entrada.width, id).toBeGreaterThan(0);
      expect(entrada.height, id).toBeGreaterThan(0);
      expect(entrada.width, id).toBeLessThanOrEqual(1920);
    }
  });
});

describe('álbuns', () => {
  it('os slugs são únicos', () => {
    expect(new Set(ALBUNS.map((a) => a.slug)).size).toBe(ALBUNS.length);
  });

  it('a capa entra na contagem de fotos', () => {
    for (const album of ALBUNS) {
      expect(fotosDoAlbum(album)).toHaveLength(album.fotos.length + 1);
      expect(fotosDoAlbum(album)[0]).toBe(album.capa);
    }
  });

  it('os destaques da home apontam para álbuns que existem', () => {
    for (const destaque of DESTAQUES) {
      expect(
        ALBUNS.some((a) => a.slug === destaque.slug),
        destaque.slug,
      ).toBe(true);
    }
  });

  it('os links de post do tipo álbum apontam para álbuns que existem', () => {
    for (const post of POSTS) {
      for (const link of post.links) {
        if (link.tipo === 'album') {
          expect(
            ALBUNS.some((a) => a.slug === link.slug),
            link.slug,
          ).toBe(true);
        }
      }
    }
  });
});

describe('agenda', () => {
  // Valores esperados escritos à mão, a partir do calendário real de 2026 —
  // nunca derivados dos dados de exemplo, senão o teste compara o dado com ele mesmo.

  const OUTUBRO: MesDoAno = { ano: 2026, mes: 10 };
  const NOVEMBRO: MesDoAno = { ano: 2026, mes: 11 };
  const DEZEMBRO: MesDoAno = { ano: 2026, mes: 12 };
  const ocupadas = new Set(SEMENTE.agenda.compromissos.map((c) => c.data));

  function dia(m: MesDoAno, numero: number) {
    const encontrado = celulasDoMes(m).find((c) => c.tipo === 'dia' && c.numero === numero);
    if (encontrado?.tipo !== 'dia') throw new Error(`dia ausente: ${String(numero)}`);
    return encontrado;
  }

  function ocupados(m: MesDoAno) {
    return celulasDoMes(m).flatMap((c) =>
      c.tipo === 'dia' && ocupadas.has(c.data) ? [c.numero] : [],
    );
  }

  it('a grade começa no dia da semana certo do calendário real', () => {
    // 01/10/2026 é quinta; 01/11/2026 é domingo; 01/12/2026 é terça.
    expect(celulasDoMes(OUTUBRO)).toHaveLength(4 + 31);
    expect(celulasDoMes(NOVEMBRO)).toHaveLength(0 + 30);
    expect(celulasDoMes(DEZEMBRO)).toHaveLength(2 + 31);
    expect(celulasDoMes(OUTUBRO)[4]).toMatchObject({ tipo: 'dia', numero: 1, data: '2026-10-01' });
    expect(celulasDoMes(NOVEMBRO)[0]).toMatchObject({ tipo: 'dia', numero: 1, data: '2026-11-01' });
    expect(celulasDoMes(DEZEMBRO)[2]).toMatchObject({ tipo: 'dia', numero: 1, data: '2026-12-01' });
  });

  it('conhece os meses de 28, 29, 30 e 31 dias', () => {
    expect(diasNoMes({ ano: 2026, mes: 2 })).toBe(28);
    expect(diasNoMes({ ano: 2028, mes: 2 })).toBe(29);
    expect(diasNoMes(NOVEMBRO)).toBe(30);
    expect(diasNoMes(DEZEMBRO)).toBe(31);
  });

  it('em novembro de 2026 o dia 7 está ocupado e o dia 8 não', () => {
    expect(dia(NOVEMBRO, 7)).toMatchObject({ data: '2026-11-07', fimDeSemana: true }); // sábado
    expect(ocupadas.has('2026-11-07')).toBe(true);
    expect(dia(NOVEMBRO, 8)).toMatchObject({ data: '2026-11-08', fimDeSemana: true }); // domingo
    expect(ocupadas.has('2026-11-08')).toBe(false);
    expect(dia(NOVEMBRO, 9)).toMatchObject({ fimDeSemana: false }); // segunda
  });

  it('marca como ocupados exatamente os dias esperados de cada mês', () => {
    expect(ocupados(OUTUBRO)).toEqual([3, 10, 17, 24]);
    expect(ocupados(NOVEMBRO)).toEqual([7, 14, 21]);
    expect(ocupados(DEZEMBRO)).toEqual([5, 12, 19, 31]);
  });

  it('conta 27 datas livres em cada mês', () => {
    expect(diasNoMes(OUTUBRO) - ocupados(OUTUBRO).length).toBe(27);
    expect(diasNoMes(NOVEMBRO) - ocupados(NOVEMBRO).length).toBe(27);
    expect(diasNoMes(DEZEMBRO) - ocupados(DEZEMBRO).length).toBe(27);
  });
});

describe('mensagem do WhatsApp', () => {
  const cheio = {
    nome: 'Marina e Téo',
    telefone: '(69) 99999-0000',
    data: '18/07/2026',
    tipo: 'Casamento',
    cidade: 'Alto Paraíso, RO',
    mensagem: 'Cerimônia às 17h.',
  };

  it('monta o texto no formato do protótipo', () => {
    expect(montarMensagem(cheio)).toBe(
      'Oi, Andrei! Somos Marina e Téo.\n' +
        'Data: 18/07/2026 · Casamento em Alto Paraíso, RO.\n' +
        'Cerimônia às 17h.\n' +
        'Meu contato: (69) 99999-0000',
    );
  });

  it('campo vazio vira reticências', () => {
    const vazio = { nome: '', telefone: '', data: '', tipo: '', cidade: '', mensagem: '' };
    expect(montarMensagem(vazio)).toContain('Somos ….');
    expect(montarMensagem(vazio)).toContain('Meu contato: …');
  });

  it('o link aponta para o número real e codifica a mensagem', () => {
    const link = linkDoWhatsApp(montarMensagem(cheio));
    expect(link.startsWith(`https://wa.me/${CONTATO.whatsapp.numero}?text=`)).toBe(true);
    const texto = decodeURIComponent(link.split('?text=')[1] ?? '');
    expect(texto).toBe(montarMensagem(cheio));
  });

  it('sem mensagem, o link é só a conversa', () => {
    expect(linkDoWhatsApp()).toBe(`https://wa.me/${CONTATO.whatsapp.numero}`);
  });

  it('o número do WhatsApp é só dígitos, no formato internacional', () => {
    expect(CONTATO.whatsapp.numero).toMatch(/^55\d{10,11}$/);
  });
});

describe('cx', () => {
  it('descarta classes ausentes em vez de escrever "undefined"', () => {
    expect(cx('a', undefined, 'b', false, null, '')).toBe('a b');
  });

  it('sem nenhuma classe devolve string vazia', () => {
    expect(cx(undefined, false)).toBe('');
  });
});
