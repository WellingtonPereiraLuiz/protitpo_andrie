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
  it('a grade tem uma célula por dia mais o preenchimento do começo do mês', () => {
    for (const mes of MESES) {
      expect(diasDoMes(mes)).toHaveLength(mes.totalDeDias + mes.primeiroDiaDaSemana);
    }
  });

  it('marca como ocupados exatamente os dias declarados', () => {
    for (const mes of MESES) {
      const ocupados = diasDoMes(mes)
        .filter((d) => d.tipo === 'dia' && d.ocupado)
        .map((d) => (d.tipo === 'dia' ? d.numero : 0));
      expect(ocupados).toEqual([...mes.ocupados]);
    }
  });

  it('datas livres é o total menos os ocupados', () => {
    for (const mes of MESES) {
      expect(datasLivres(mes)).toBe(mes.totalDeDias - mes.ocupados.length);
    }
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
