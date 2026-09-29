import { describe, expect, it } from 'vitest';
import { ALBUNS, fotosDoAlbum } from '@/content/albuns';
import { datasLivres, diasDoMes, MESES } from '@/content/agenda';
import { DESTAQUES } from '@/content/home';
import { MEDIA, type MediaId } from '@/content/media';
import { POSTS } from '@/content/posts';
import { SERVICOS } from '@/content/servicos';
import { SOBRE } from '@/content/sobre';
import { CONTATO } from '@/content/site';
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
  // nunca derivados de src/content/agenda.ts, senão o teste compara o dado com ele mesmo.

  function mes(nome: string) {
    const encontrado = MESES.find((m) => m.nome === nome);
    if (!encontrado) throw new Error(`mês ausente: ${nome}`);
    return encontrado;
  }

  function dia(nomeDoMes: string, numero: number) {
    const encontrado = diasDoMes(mes(nomeDoMes)).find(
      (d) => d.tipo === 'dia' && d.numero === numero,
    );
    if (encontrado?.tipo !== 'dia') throw new Error(`dia ausente: ${String(numero)}`);
    return encontrado;
  }

  function ocupados(nomeDoMes: string) {
    return diasDoMes(mes(nomeDoMes)).flatMap((d) =>
      d.tipo === 'dia' && d.ocupado ? [d.numero] : [],
    );
  }

  it('mostra outubro, novembro e dezembro de 2026, nessa ordem', () => {
    expect(MESES.map((m) => `${m.nome}/${String(m.ano)}`)).toEqual([
      'Outubro/2026',
      'Novembro/2026',
      'Dezembro/2026',
    ]);
  });

  it('a grade começa no dia da semana certo do calendário real', () => {
    // 01/10/2026 é quinta; 01/11/2026 é domingo; 01/12/2026 é terça.
    expect(diasDoMes(mes('Outubro'))).toHaveLength(4 + 31);
    expect(diasDoMes(mes('Novembro'))).toHaveLength(0 + 30);
    expect(diasDoMes(mes('Dezembro'))).toHaveLength(2 + 31);
    expect(diasDoMes(mes('Outubro'))[4]).toMatchObject({ tipo: 'dia', numero: 1 });
    expect(diasDoMes(mes('Novembro'))[0]).toMatchObject({ tipo: 'dia', numero: 1 });
    expect(diasDoMes(mes('Dezembro'))[2]).toMatchObject({ tipo: 'dia', numero: 1 });
  });

  it('em novembro de 2026 o dia 7 está riscado e o dia 8 não', () => {
    expect(dia('Novembro', 7)).toMatchObject({ ocupado: true, fimDeSemana: true }); // sábado
    expect(dia('Novembro', 8)).toMatchObject({ ocupado: false, fimDeSemana: true }); // domingo
    expect(dia('Novembro', 9)).toMatchObject({ ocupado: false, fimDeSemana: false }); // segunda
  });

  it('marca como ocupados exatamente os dias esperados de cada mês', () => {
    expect(ocupados('Outubro')).toEqual([3, 10, 17, 24]);
    expect(ocupados('Novembro')).toEqual([7, 14, 21]);
    expect(ocupados('Dezembro')).toEqual([5, 12, 19, 31]);
  });

  it('conta 27 datas livres em cada mês', () => {
    expect(datasLivres(mes('Outubro'))).toBe(27);
    expect(datasLivres(mes('Novembro'))).toBe(27);
    expect(datasLivres(mes('Dezembro'))).toBe(27);
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
