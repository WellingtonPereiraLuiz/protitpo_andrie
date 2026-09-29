import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { criarAutenticacaoDemo } from '@/dados/local/autenticacao-demo';
import { CHAVE_DO_CONTEUDO, criarConteudoLocal } from '@/dados/local/conteudo-local';
import { ErroDeValidacao } from '@/dados/repositorios';
import { validarConteudo, type ConteudoDoSite } from '@/dados/schema';
import { copiaDaSemente, SEMENTE } from '@/dados/semente';
import { dataCurta, dataLonga, dataPorExtenso, somarMeses } from '@/lib/calendario';
import { gerarSlug, slugUnico } from '@/lib/slug';

function primeiro<T>(itens: readonly T[]): T {
  const [item] = itens;
  if (item === undefined) throw new Error('lista vazia');
  return item;
}

function erroEm(conteudo: ConteudoDoSite, caminho: string): string | undefined {
  const r = validarConteudo(conteudo);
  if (r.ok) return undefined;
  return r.erros.find((e) => e.caminho === caminho)?.mensagem;
}

describe('schema do conteúdo', () => {
  it('a semente é um documento válido', () => {
    const r = validarConteudo(SEMENTE);
    expect(r.ok ? [] : r.erros).toEqual([]);
  });

  it('a semente traz os 6 álbuns, 3 posts publicados e 11 compromissos de exemplo', () => {
    expect(SEMENTE.albuns.map((a) => a.slug)).toEqual([
      'marina-teo',
      'bia-caio',
      'julia-vitor',
      'luana-rafa',
      'alice',
      'filme-mt',
    ]);
    expect(SEMENTE.posts.map((p) => p.estado)).toEqual(['publicado', 'publicado', 'publicado']);
    expect(SEMENTE.agenda.compromissos).toHaveLength(11);
  });

  it('recusa título da home vazio, com a mensagem do campo', () => {
    const c = copiaDaSemente();
    c.home.heroTitulo = '   ';
    expect(erroEm(c, 'home.heroTitulo')).toBe('O título da home não pode ficar vazio.');
  });

  it('recusa título da home com mais de 60 caracteres', () => {
    const c = copiaDaSemente();
    c.home.heroTitulo = 'x'.repeat(61);
    expect(erroEm(c, 'home.heroTitulo')).toBe('O título da home passa de 60 caracteres.');
    c.home.heroTitulo = 'x'.repeat(60);
    expect(validarConteudo(c).ok).toBe(true);
  });

  it('recusa foto que não está na biblioteca nem entre as enviadas', () => {
    const c = copiaDaSemente();
    c.home.heroFoto = 'upload-nao-existe';
    expect(erroEm(c, 'home.heroFoto')).toBe('Foto inexistente: upload-nao-existe.');
    c.fotosEnviadas['upload-nao-existe'] = {
      largura: 1920,
      altura: 1280,
      alt: 'Casal na cachoeira',
    };
    expect(validarConteudo(c).ok).toBe(true);
  });

  it('recusa dois álbuns com o mesmo endereço', () => {
    const c = copiaDaSemente();
    c.albuns.push({ ...primeiro(c.albuns), nome: 'Outro' });
    expect(erroEm(c, 'albuns')).toBe('Endereço de álbum repetido: marina-teo.');
  });

  it('recusa destaque que aponta para álbum excluído', () => {
    const c = copiaDaSemente();
    c.albuns = c.albuns.filter((a) => a.slug !== 'bia-caio');
    expect(erroEm(c, 'destaques.2.slug')).toBe(
      'O destaque aponta para um álbum que não existe: bia-caio.',
    );
  });

  it('recusa dois compromissos no mesmo dia e datas que não existem', () => {
    const c = copiaDaSemente();
    c.agenda.compromissos.push({ ...primeiro(c.agenda.compromissos), id: 'outro' });
    expect(erroEm(c, 'agenda')).toBe('Já existe um compromisso no dia repetido: 2026-10-03.');

    const d = copiaDaSemente();
    primeiro(d.agenda.compromissos).data = '2026-02-30';
    expect(erroEm(d, 'agenda.compromissos.0.data')).toBe('Data inválida.');
  });

  it('recusa documento de outra versão', () => {
    expect(validarConteudo({ ...SEMENTE, versao: 2 }).ok).toBe(false);
  });
});

describe('repositório local (localStorage)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sem nada salvo, carrega a semente', async () => {
    const r = await criarConteudoLocal().carregar();
    expect(r).toMatchObject({ origem: 'semente', problema: null });
    expect(r.conteudo).toEqual(SEMENTE);
  });

  it('o que foi salvo é o que volta', async () => {
    const repo = criarConteudoLocal();
    const c = copiaDaSemente();
    c.home.heroTitulo = 'Andrei Heck Fotografia';
    await repo.salvar(c);
    const r = await repo.carregar();
    expect(r.origem).toBe('salvo');
    expect(r.conteudo.home.heroTitulo).toBe('Andrei Heck Fotografia');
  });

  it('documento inválido não é gravado', async () => {
    const repo = criarConteudoLocal();
    const c = copiaDaSemente();
    c.home.heroTitulo = '';
    await expect(repo.salvar(c)).rejects.toBeInstanceOf(ErroDeValidacao);
    expect(localStorage.getItem(CHAVE_DO_CONTEUDO)).toBeNull();
  });

  it('JSON corrompido cai na semente e avisa, sem lançar', async () => {
    localStorage.setItem(CHAVE_DO_CONTEUDO, '{"versao":1,');
    const r = await criarConteudoLocal().carregar();
    expect(r.origem).toBe('semente');
    expect(r.conteudo).toEqual(SEMENTE);
    expect(r.problema).toBe('O conteúdo salvo neste navegador está corrompido e foi ignorado.');
  });

  it('documento que não passa no schema cai na semente e diz o campo', async () => {
    localStorage.setItem(
      CHAVE_DO_CONTEUDO,
      JSON.stringify({ ...SEMENTE, home: { ...SEMENTE.home, heroTitulo: '' } }),
    );
    const r = await criarConteudoLocal().carregar();
    expect(r.origem).toBe('semente');
    expect(r.problema).toContain('home.heroTitulo: O título da home não pode ficar vazio.');
  });

  it('restaurar apaga o que foi salvo', async () => {
    const repo = criarConteudoLocal();
    const c = copiaDaSemente();
    c.home.heroTitulo = 'Outro título';
    await repo.salvar(c);
    await repo.restaurar();
    expect(localStorage.getItem(CHAVE_DO_CONTEUDO)).toBeNull();
    expect((await repo.carregar()).conteudo).toEqual(SEMENTE);
  });

  it('avisa quem observa quando salva ou restaura', async () => {
    const repo = criarConteudoLocal();
    const aoMudar = vi.fn();
    const parar = repo.observar(aoMudar);
    await repo.salvar(copiaDaSemente());
    await repo.restaurar();
    expect(aoMudar).toHaveBeenCalledTimes(2);
    parar();
    await repo.restaurar();
    expect(aoMudar).toHaveBeenCalledTimes(2);
  });

  it('sem armazenamento disponível, carrega a semente e recusa salvar com motivo', async () => {
    const repo = criarConteudoLocal(() => null);
    expect((await repo.carregar()).origem).toBe('semente');
    await expect(repo.salvar(copiaDaSemente())).rejects.toThrow(
      'Este navegador não deixa o site guardar dados.',
    );
  });
});

describe('autenticação de demonstração', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('entra com admin/admin e mantém a sessão', async () => {
    const auth = criarAutenticacaoDemo();
    expect(auth.sessaoAtiva()).toBe(false);
    expect(await auth.entrar('admin', 'admin')).toBe(true);
    expect(auth.sessaoAtiva()).toBe(true);
    expect(criarAutenticacaoDemo().sessaoAtiva()).toBe(true);
  });

  it('recusa senha errada, usuário errado e senha com outra caixa', async () => {
    const auth = criarAutenticacaoDemo();
    expect(await auth.entrar('admin', 'errada')).toBe(false);
    expect(await auth.entrar('andrei', 'admin')).toBe(false);
    expect(await auth.entrar('admin', 'ADMIN')).toBe(false);
    expect(auth.sessaoAtiva()).toBe(false);
  });

  it('sair encerra a sessão', async () => {
    const auth = criarAutenticacaoDemo();
    await auth.entrar('admin', 'admin');
    await auth.sair();
    expect(auth.sessaoAtiva()).toBe(false);
  });
});

describe('slugs', () => {
  it('gera endereço sem acento, símbolo nem espaço', () => {
    expect(gerarSlug('Ana & Pedro')).toBe('ana-pedro');
    expect(gerarSlug('  Júlia & Vitor — Ouro Preto  ')).toBe('julia-vitor-ouro-preto');
    expect(gerarSlug('!!!')).toBe('');
  });

  it('não repete um endereço em uso', () => {
    expect(slugUnico('Ana & Pedro', ['ana-pedro'])).toBe('ana-pedro-2');
    expect(slugUnico('Ana & Pedro', ['ana-pedro', 'ana-pedro-2'])).toBe('ana-pedro-3');
    expect(slugUnico('???', [], 'album')).toBe('album');
  });
});

describe('datas', () => {
  it('formata datas como o protótipo', () => {
    expect(dataCurta('2026-03-12')).toBe('12 mar 2026');
    expect(dataLonga('2026-02-27')).toBe('27 de fevereiro de 2026');
    expect(dataPorExtenso('2026-11-07')).toBe('sábado, 7 de novembro de 2026');
  });

  it('soma meses atravessando o ano', () => {
    expect(somarMeses({ ano: 2026, mes: 11 }, 2)).toEqual({ ano: 2027, mes: 1 });
    expect(somarMeses({ ano: 2027, mes: 1 }, -1)).toEqual({ ano: 2026, mes: 12 });
  });
});

describe('arquitetura', () => {
  // Critério 16 da spec: nenhuma tela conhece onde o dado fica guardado.
  function arquivos(pasta: string): string[] {
    return readdirSync(pasta).flatMap((nome) => {
      const caminho = join(pasta, nome);
      return statSync(caminho).isDirectory() ? arquivos(caminho) : [caminho];
    });
  }

  it('só criarServicos() importa as implementações do navegador', () => {
    const raiz = join(process.cwd(), 'src');
    const infratores = arquivos(raiz)
      .filter((f) => /\.(ts|tsx)$/.test(f))
      .map((f) => relative(raiz, f).split(sep).join('/'))
      .filter((f) => !f.startsWith('dados/local/') && !f.startsWith('__tests__/'))
      .filter((f) => f !== 'dados/servicos.ts')
      .filter((f) =>
        /from ['"](@\/dados\/local|\.\/local|\.\.\/local)/.test(
          readFileSync(join(raiz, f), 'utf8'),
        ),
      );
    expect(infratores).toEqual([]);
  });

  it('nenhuma tela acessa localStorage ou IndexedDB direto', () => {
    const raiz = join(process.cwd(), 'src');
    const infratores = arquivos(raiz)
      .filter((f) => /\.(ts|tsx)$/.test(f))
      .map((f) => relative(raiz, f).split(sep).join('/'))
      .filter((f) => !f.startsWith('dados/') && !f.startsWith('__tests__/'))
      .filter((f) => /\b(localStorage|indexedDB)\b/.test(readFileSync(join(raiz, f), 'utf8')));
    expect(infratores).toEqual([]);
  });
});
