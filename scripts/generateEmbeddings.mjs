import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { books } from '../src/data/parsedBooks.js';
import { ASK_SUGGESTIONS } from '../src/data/askSuggestions.js';
import {
  EMBEDDING_DIMENSIONS as DIMENSIONS,
  EMBEDDING_MODEL as MODEL,
  INDEX_VERSION,
  quantizeVector,
} from '../src/utils/askSearch.js';

// Usage: node scripts/generateEmbeddings.mjs [--full]
// Only books whose embedding text changed (and new suggestions) are re-embedded
// unless --full is passed.

// Try loading .env or .env.local if present
try {
  process.loadEnvFile();
} catch (_) {}
try {
  process.loadEnvFile('.env.local');
} catch (_) {}

const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const FULL = process.argv.includes('--full');
const BATCH_SIZE = 64;
const META_PATH = new URL('../public/embeddings.meta.json', import.meta.url);
const BIN_PATH = new URL('../public/embeddings.bin', import.meta.url);

export function formatBookForEmbedding(book) {
  const tags = [...book.tags, ...book.keywords];
  const parts = [`Title: ${book.title}`, `Author: ${book.author}`, `Category: ${book.category}`];
  if (tags.length > 0) {
    parts.push(`Tags: ${tags.join(', ')}`);
  }
  if (book.recommender) {
    parts.push(`Recommended by: ${book.recommender}`);
  }
  if (book.summary) {
    parts.push(`Summary: ${book.summary}`);
  }
  return parts.join('\n');
}

const hashText = (text) => createHash('sha1').update(text).digest('hex').slice(0, 12);

async function fetchEmbeddingsBatch(texts) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      dimensions: DIMENSIONS,
      input: texts,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.data.map((item) => item.embedding);
}

// Returns Map(key -> { hash, row: Int8Array, scale }) from the current index, if compatible.
async function loadExistingRows() {
  const rows = new Map();
  if (FULL) return rows;
  try {
    const meta = JSON.parse(await readFile(META_PATH, 'utf8'));
    if (meta.version !== INDEX_VERSION || meta.model !== MODEL || meta.dimensions !== DIMENSIONS) return rows;
    const int8 = new Int8Array((await readFile(BIN_PATH)).buffer.slice(0));
    const entries = [
      ...meta.books.map((b) => ({ key: `book:${b.title}`, hash: b.hash, scale: b.scale })),
      ...(meta.suggestions || []).map((s) => ({ key: `suggestion:${s.text}`, hash: null, scale: s.scale })),
    ];
    entries.forEach((e, r) => {
      rows.set(e.key, { hash: e.hash, scale: e.scale, row: int8.slice(r * DIMENSIONS, (r + 1) * DIMENSIONS) });
    });
  } catch (_) {
    // No index yet: embed everything.
  }
  return rows;
}

async function main() {
  const existing = await loadExistingRows();

  const items = [
    ...books.map((book) => {
      const text = formatBookForEmbedding(book);
      return { key: `book:${book.title}`, title: book.title, text, hash: hashText(text) };
    }),
    ...ASK_SUGGESTIONS.map((text) => ({ key: `suggestion:${text}`, suggestion: text, text, hash: null })),
  ];

  const todo = items.filter((it) => {
    const prev = existing.get(it.key);
    if (prev && prev.hash === it.hash) {
      it.row = prev.row;
      it.scale = prev.scale;
      return false;
    }
    return true;
  });

  console.log(`\n📚 ${books.length} books + ${ASK_SUGGESTIONS.length} suggestions. Model: ${MODEL} (${DIMENSIONS}d)`);
  console.log(`Reusing ${items.length - todo.length}, embedding ${todo.length}${FULL ? ' (--full)' : ''}.`);

  if (todo.length > 0 && !apiKey) {
    console.error('\n❌ Error: OPENAI_API_KEY is not set.');
    console.error('  OPENAI_API_KEY=sk-... node scripts/generateEmbeddings.mjs\n');
    process.exit(1);
  }

  for (let start = 0; start < todo.length; start += BATCH_SIZE) {
    const batch = todo.slice(start, start + BATCH_SIZE);
    process.stdout.write(`Batch ${start / BATCH_SIZE + 1}/${Math.ceil(todo.length / BATCH_SIZE)}... `);
    try {
      const embeddings = await fetchEmbeddingsBatch(batch.map((it) => it.text));
      batch.forEach((it, i) => Object.assign(it, quantizeVector(embeddings[i])));
      console.log('✓');
    } catch (err) {
      console.error(`\n❌ Failed:`, err.message);
      process.exit(1);
    }
  }

  const bin = new Int8Array(items.length * DIMENSIONS);
  items.forEach((it, r) => bin.set(it.row, r * DIMENSIONS));
  const meta = {
    version: INDEX_VERSION,
    model: MODEL,
    dimensions: DIMENSIONS,
    books: items.filter((it) => it.title).map(({ title, hash, scale }) => ({ title, hash, scale })),
    suggestions: items.filter((it) => it.suggestion).map(({ suggestion, scale }) => ({ text: suggestion, scale })),
  };

  await writeFile(BIN_PATH, bin);
  await writeFile(META_PATH, JSON.stringify(meta));
  console.log(`\n🎉 Wrote public/embeddings.bin (${(bin.byteLength / 1024).toFixed(0)} KB) + embeddings.meta.json`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
