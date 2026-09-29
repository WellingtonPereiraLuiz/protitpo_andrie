// Regenera src/content/media.ts a partir dos arquivos em public/media/.
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { open } from 'node:fs/promises';

/** Lê largura e altura de um WebP sem dependência externa. */
async function webpSize(path) {
  const fh = await open(path, 'r');
  try {
    const { buffer } = await fh.read(Buffer.alloc(32), 0, 32, 0);
    if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
      throw new Error(`${path}: não é um WebP`);
    }
    const fourcc = buffer.toString('ascii', 12, 16);
    if (fourcc === 'VP8X') {
      return {
        width: (buffer.readUIntLE(24, 3) & 0xffffff) + 1,
        height: (buffer.readUIntLE(27, 3) & 0xffffff) + 1,
      };
    }
    if (fourcc === 'VP8 ') {
      return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    }
    if (fourcc === 'VP8L') {
      const bits = buffer.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    throw new Error(`${path}: chunk WebP desconhecido ${fourcc}`);
  } finally {
    await fh.close();
  }
}

const dir = 'public/media';
const ids = (await readdir(dir))
  .filter((f) => f.endsWith('.webp'))
  .map((f) => f.slice(0, -5))
  .sort();
if (ids.length === 0) throw new Error('public/media está vazio');

const entries = [];
for (const id of ids) {
  const { width, height } = await webpSize(join(dir, `${id}.webp`));
  entries.push(`  '${id}': { src: '/media/${id}.webp', width: ${width}, height: ${height} },`);
}

const out = [
  '// GERADO a partir de public/media/. Não editar à mão.',
  '// Rode `npm run media:manifest` depois de trocar qualquer arquivo.',
  '',
  'export type MediaId =',
  ...ids.map((id, i) => `  | '${id}'${i === ids.length - 1 ? ';' : ''}`),
  '',
  'export interface MediaEntry {',
  '  readonly src: `/media/${MediaId}.webp`;',
  '  readonly width: number;',
  '  readonly height: number;',
  '}',
  '',
  'export const MEDIA: Readonly<Record<MediaId, MediaEntry>> = {',
  ...entries,
  '};',
  '',
].join('\n');

await writeFile('src/content/media.ts', out);
console.log(`src/content/media.ts: ${ids.length} entradas`);
