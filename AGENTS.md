<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Este projeto

Leia `ONDE-PAREI.md` antes de tudo: estado, pendências e o que não foi verificado.

- **Gates:** `npm run check` (Prettier, ESLint com tipos, `tsc`, Vitest, `next build`,
  Playwright com axe). Só commite com ele verde. Ele usa a porta 3100 e falha se ela
  estiver ocupada — de propósito, para nunca testar contra um servidor velho.
- **Versões travadas de propósito:** `typescript` 6.0.3 (o `typescript-eslint` não aceita
  7.x) e `eslint` 9.x (o `eslint-config-next@16` quebra no 10). Instale com `npm ci`.
- **Conteúdo:** tudo o que é editável passa pelo schema em `src/dados/schema.ts`. Onde o
  dado fica guardado é decidido só em `src/dados/servicos.ts`; telas não tocam em
  `localStorage`/`indexedDB` (há teste de arquitetura para isso).
- **Specs antes de feature:** `docs/specs/`. Nenhum teste é enfraquecido para passar.
- **Nunca** commitar na `main` nem fazer deploy sem pedido explícito.
