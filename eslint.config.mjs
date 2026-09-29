import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';

const raiz = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      '.extracao/**',
      'test-results/**',
      'playwright-report/**',
      'next-env.d.ts',
    ],
  },
  ...nextCoreWebVitals,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: raiz },
    },
    rules: {
      // Demonstração sem back-end: nada de console solto em produção.
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    // Arquivos de configuração e scripts não entram no programa TypeScript.
    files: ['*.mjs', 'scripts/**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    // Scripts de linha de comando: a saída no console é a interface deles.
    files: ['scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
);
