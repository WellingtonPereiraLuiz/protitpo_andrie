import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// next/image em ambiente de teste: render direto, sem o otimizador.
vi.mock('next/image', () => ({
  default: ({ src, alt, fill: _fill, priority: _priority, ...resto }: Record<string, unknown>) => {
    const props = { src, alt, ...resto };
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...(props as Record<string, string>)} alt={String(alt)} />;
  },
}));
