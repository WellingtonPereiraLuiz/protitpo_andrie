import { describe, expect, it } from 'vitest';
import { dimensoesLimitadas, problemaDoArquivo } from '@/admin/envio-de-foto';

describe('envio de foto', () => {
  it('reduz para 1920px no lado maior, sem distorcer', () => {
    expect(dimensoesLimitadas(4000, 3000)).toEqual({ largura: 1920, altura: 1440 });
    expect(dimensoesLimitadas(3000, 4000)).toEqual({ largura: 1440, altura: 1920 });
    expect(dimensoesLimitadas(5000, 5000)).toEqual({ largura: 1920, altura: 1920 });
  });

  it('nunca aumenta uma foto pequena', () => {
    expect(dimensoesLimitadas(1920, 1080)).toEqual({ largura: 1920, altura: 1080 });
    expect(dimensoesLimitadas(800, 600)).toEqual({ largura: 800, altura: 600 });
  });

  it('aceita JPEG, PNG e WebP até 15 MB', () => {
    const mb = 1024 * 1024;
    expect(problemaDoArquivo({ type: 'image/jpeg', size: 15 * mb })).toBeNull();
    expect(problemaDoArquivo({ type: 'image/png', size: 1 })).toBeNull();
    expect(problemaDoArquivo({ type: 'image/webp', size: 1 })).toBeNull();
    expect(problemaDoArquivo({ type: 'image/jpeg', size: 15 * mb + 1 })).toBe(
      'A foto passa de 15 MB.',
    );
    expect(problemaDoArquivo({ type: 'image/gif', size: 1 })).toBe(
      'Use uma foto em JPEG, PNG ou WebP.',
    );
    expect(problemaDoArquivo({ type: 'text/plain', size: 1 })).toBe(
      'Use uma foto em JPEG, PNG ou WebP.',
    );
  });
});
