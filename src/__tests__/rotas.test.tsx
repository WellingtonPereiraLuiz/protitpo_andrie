import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AgendaPage from '@/app/(site)/agenda/page';
import BlogPage from '@/app/(site)/blog/page';
import PostPage, {
  generateStaticParams as generateStaticParamsDePost,
} from '@/app/(site)/blog/[slug]/page';
import ContatoPage from '@/app/(site)/contato/page';
import HomePage from '@/app/(site)/page';
import PortfolioPage from '@/app/(site)/portfolio/page';
import AlbumPage, {
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

  it('um álbum inexistente dispara notFound', async () => {
    await expect(AlbumPage({ params: Promise.resolve({ slug: 'nao-existe' }) })).rejects.toThrow();
  });

  it('um post inexistente dispara notFound', async () => {
    await expect(PostPage({ params: Promise.resolve({ slug: 'nao-existe' }) })).rejects.toThrow();
  });
});
