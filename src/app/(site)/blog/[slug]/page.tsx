import type { Metadata } from 'next';
import { SEMENTE } from '@/dados/semente';
import { Post } from './post';

interface Props {
  readonly params: Promise<{ readonly slug: string }>;
}

const PUBLICADOS = SEMENTE.posts.filter((p) => p.estado === 'publicado');

// Como nos álbuns: os posts da semente são gerados no build; os criados no painel são
// resolvidos no navegador de quem os criou.
export function generateStaticParams(): { slug: string }[] {
  return PUBLICADOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = PUBLICADOS.find((p) => p.slug === slug);
  if (!post) return { title: 'Post', robots: { index: false, follow: false } };
  return { title: post.titulo, description: post.resumo };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  return <Post slug={slug} />;
}
