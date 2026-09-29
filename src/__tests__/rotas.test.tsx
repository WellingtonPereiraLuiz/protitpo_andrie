import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AgendaPage from '@/app/(site)/agenda/page';
import BlogPage from '@/app/(site)/blog/page';
import PostPage, {
  generateMetadata as generateMetadataDePost,
  generateStaticParams as generateStaticParamsDePost,
} from '@/app/(site)/blog/[slug]/page';
import ContatoPage from '@/app/(site)/contato/page';
import HomePage from '@/app/(site)/page';
import PortfolioPage from '@/app/(site)/portfolio/page';
import AlbumPage, {
  generateMetadata as generateMetadataDeAlbum,
  generateStaticParams as generateStaticParamsDeAlbum,
} from '@/app/(site)/portfolio/[slug]/page';
import ServicosPage from '@/app/(site)/servicos/page';
import SobrePage from '@/app/(site)/sobre/page';
import NotFound from '@/app/not-found';
import { ALBUNS } from '@/content/albuns';
import { POSTS } from '@/content/posts';

describe('rotas estáticas', () => {
  it('a home mostra o título e a chamada final', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Andrei Heck' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Me contem sobre o dia de vocês' }),
    ).toBeInTheDocument();
  });

  it('serviços lista os três serviços', () => {
    render(<ServicosPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Três jeitos de guardar o que vocês viverem',
    );
    for (const titulo of ['Casamento', 'Ensaios', 'Vídeo']) {
      expect(screen.getByRole('heading', { level: 2, name: titulo })).toBeInTheDocument();
    }
  });

  it('sobre mostra o texto de apresentação', () => {
    render(<SobrePage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Andrei Heck' })).toBeInTheDocument();
    expect(screen.getByText(/Continuo procurando os cantos/)).toBeInTheDocument();
  });

  it('blog lista todos os posts', () => {
    render(<BlogPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Histórias e conselhos' }),
    ).toBeInTheDocument();
    for (const post of POSTS) {
      expect(screen.getByText(post.titulo)).toBeInTheDocument();
    }
  });

  it('agenda avisa que é só consulta visual', () => {
    render(<AgendaPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Datas livres de 2026' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Este calendário é só uma consulta visual/)).toBeInTheDocument();
  });

  it('agenda risca o dia 7 de novembro e deixa o dia 8 livre', () => {
    render(<AgendaPage />);
    const novembro = within(screen.getByRole('region', { name: 'Novembro de 2026' }));
    const celula = (n: string) => novembro.getByText(n, { selector: 'span' });
    expect(celula('7')).toHaveClass('diaOcupado');
    expect(celula('7')).toHaveTextContent('7 — ocupada');
    expect(celula('8')).not.toHaveClass('diaOcupado');
    expect(celula('8')).toHaveClass('diaFds');
  });

  it('contato mostra o formulário e diz que nada é enviado pelo site', () => {
    render(<ContatoPage />);
    expect(screen.getByRole('button', { name: /Abrir o WhatsApp/ })).toBeInTheDocument();
    expect(screen.getByText(/Nada é enviado por este site/)).toBeInTheDocument();
  });
});

describe('rotas dinâmicas', () => {
  it('o portfólio lista os álbuns da categoria padrão', async () => {
    render(await PortfolioPage({ searchParams: Promise.resolve({}) }));
    for (const album of ALBUNS.filter((a) => a.categoria === 'Casamentos')) {
      expect(screen.getByText(album.nome)).toBeInTheDocument();
    }
    expect(screen.queryByText('Esperando a Alice')).not.toBeInTheDocument();
  });

  it('o portfólio filtra por categoria', async () => {
    render(await PortfolioPage({ searchParams: Promise.resolve({ categoria: 'Ensaios' }) }));
    expect(screen.getByText('Esperando a Alice')).toBeInTheDocument();
    expect(screen.queryByText('Marina & Téo')).not.toBeInTheDocument();
  });

  it.each(ALBUNS.map((a) => [a.slug, a.nome] as const))(
    'o álbum %s renderiza',
    async (slug, nome) => {
      render(await AlbumPage({ params: Promise.resolve({ slug }) }));
      expect(screen.getByRole('heading', { level: 1, name: nome })).toBeInTheDocument();
    },
  );

  it.each(POSTS.map((p) => [p.slug, p.titulo] as const))(
    'o post %s renderiza',
    async (slug, titulo) => {
      render(await PostPage({ params: Promise.resolve({ slug }) }));
      expect(screen.getByRole('heading', { level: 1, name: titulo })).toBeInTheDocument();
    },
  );

  it('generateStaticParams cobre todos os álbuns', () => {
    const gerados = generateStaticParamsDeAlbum().map((p) => p.slug);
    expect(new Set(gerados)).toEqual(new Set(ALBUNS.map((a) => a.slug)));
  });

  it('generateStaticParams cobre todos os posts', () => {
    const gerados = generateStaticParamsDePost().map((p) => p.slug);
    expect(new Set(gerados)).toEqual(new Set(POSTS.map((p) => p.slug)));
  });
});

describe('404', () => {
  it('a tela de 404 oferece caminho de volta', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Essa página se perdeu na festa',
    );
    expect(screen.getByRole('link', { name: 'Ir para a home' })).toHaveAttribute('href', '/');
  });

  // Álbuns e posts criados no painel só existem no navegador de quem os criou, então o
  // endereço desconhecido é aceito e resolvido lá (spec do admin, seção 9). Quando não
  // existe em lugar nenhum: tela de "não encontrado" com caminho de volta, e fora do índice.
  it('um álbum inexistente mostra "não encontrado", volta ao portfólio e não é indexado', async () => {
    const params = Promise.resolve({ slug: 'nao-existe' });
    render(await AlbumPage({ params }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Não encontrei esse álbum' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/portfolio');
    expect((await generateMetadataDeAlbum({ params })).robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it('um post inexistente mostra "não encontrado", volta ao blog e não é indexado', async () => {
    const params = Promise.resolve({ slug: 'nao-existe' });
    render(await PostPage({ params }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Não encontrei esse post' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/blog');
    expect((await generateMetadataDePost({ params })).robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it('álbum e post que existem continuam indexáveis', async () => {
    const album = await generateMetadataDeAlbum({
      params: Promise.resolve({ slug: 'marina-teo' }),
    });
    expect(album).toEqual({
      title: 'Marina & Téo',
      description: 'Casamento no sítio da família, com a luz das cinco da tarde.',
    });
    const post = await generateMetadataDePost({
      params: Promise.resolve({ slug: 'como-escolher-o-horario-da-cerimonia' }),
    });
    expect(post.robots).toBeUndefined();
  });
});
