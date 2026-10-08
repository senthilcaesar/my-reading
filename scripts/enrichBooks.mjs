import { writeFile } from 'node:fs/promises';
import { books, categories } from '../src/data/parsedBooks.js';
import { bookTags } from '../src/data/bookTags.js';
import { generatedBookMeta } from '../src/data/generatedBookMeta.js';
import { categoryOverrides } from '../src/data/categoryOverrides.js';
import { generatedCategoryOverrides } from '../src/data/generatedCategoryOverrides.js';

// Fills in missing book metadata with an LLM and writes src/data/generatedBookMeta.js:
//   - summary   for books whose CSV summary is only a subtitle/blurb (< THIN_SUMMARY chars)
//   - tags      2 displayed topic tags (curated bookTags.js still wins)
//   - keywords  search-only topic terms
//   - category  only when the current category is clearly wrong
// Also writes reports/enrichment-review.md for human review.
//
// Usage: node scripts/enrichBooks.mjs [--force] [--limit N]
// Only books not yet in generatedBookMeta.js are processed unless --force.
// Afterwards run: npm run generate:embeddings

try {
  process.loadEnvFile();
} catch (_) {}
try {
  process.loadEnvFile('.env.local');
} catch (_) {}

const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const MODEL = 'gpt-4.1';
const BATCH_SIZE = 8;
const CONCURRENCY = 4;
const THIN_SUMMARY = 100;
const FORCE = process.argv.includes('--force');
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;

const META_PATH = new URL('../src/data/generatedBookMeta.js', import.meta.url);
const REPORT_PATH = new URL('../reports/enrichment-review.md', import.meta.url);

const CATEGORY_LIST = [...categories].sort();
const PREFERRED_TAGS = [...new Set(Object.values(bookTags).flat())].filter((t) => t !== 'Non-fiction').sort();

const SYSTEM_PROMPT = `You are a meticulous librarian cataloguing a personal book collection. For each book return:
- tags: exactly 2 short Title Case topic tags describing what the book is about (e.g. "World War II", "Behavioral Economics"). Prefer these existing tags when they fit: ${PREFERRED_TAGS.join(', ')}. Never use generic tags such as "Non-fiction" or "Book", and never the author's name.
- keywords: 4-8 lowercase search terms a reader might type to find this book: specific subjects, people, places, events, eras or fields (e.g. "pacific theater", "pow camp", "olympics"). No author names.
- summary: only when needs_summary is true, otherwise null. 2-3 sentences (45-80 words), neutral library-catalogue style, starting "<Title> by <Author> is ...", saying what the book is about and how it approaches it. State only what you are confident is true of this specific book. If you do not recognise the book, write a cautious description based only on the title and subtitle, invent no specifics, and set summary_confidence to "low".
- summary_confidence: "high" or "low" when a summary is written, otherwise null.
- category: the single best category from the allowed list.
- category_verdict: "correct" if the current category fits; "too_broad" if it is a broad label (e.g. Non-fiction) and a more specific one fits; "wrong" only if the current category is clearly incorrect for this book (e.g. a relationship book filed under Finance).`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['books'],
  properties: {
    books: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'tags', 'keywords', 'summary', 'summary_confidence', 'category', 'category_verdict'],
        properties: {
          id: { type: 'integer' },
          tags: { type: 'array', items: { type: 'string' } },
          keywords: { type: 'array', items: { type: 'string' } },
          summary: { type: ['string', 'null'] },
          summary_confidence: { type: ['string', 'null'], enum: ['high', 'low', null] },
          category: { type: 'string', enum: CATEGORY_LIST },
          category_verdict: { type: 'string', enum: ['correct', 'too_broad', 'wrong'] },
        },
      },
    },
  },
};

// Moving a book within one of these groups is a judgement call, not a correction,
// so it is only suggested in the report. Broad "Non-fiction" is never "wrong" either.
const RELATED_CATEGORIES = [
  ['Memoir', 'Biography'],
  ['Psychology', 'Self-Help', 'Personal Development', 'Neuroscience', 'Health'],
  ['Business', 'Leadership', 'Economics', 'Finance'],
  ['History', 'Military History', 'Political History', 'Politics'],
  ['Sociology', 'Social Science', 'Culture'],
  ['Science', 'Technology', 'Artificial Intelligence', 'Neuroscience'],
  ['Fiction', 'Historical Fiction'],
];
const related = (a, b) => RELATED_CATEGORIES.some((g) => g.includes(a) && g.includes(b));

const needsSummary = (book) => {
  const prev = generatedBookMeta[book.title];
  return Boolean(prev?.summary) || book.summary.length < THIN_SUMMARY;
};

async function enrichBatch(batch) {
  const payload = batch.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    current_category: generatedBookMeta[book.title]?.categoryWas || book.category,
    [needsSummary(book) ? 'subtitle_or_blurb' : 'summary']: needsSummary(book)
      ? book.summary
      : book.summary.slice(0, 400),
    needs_summary: needsSummary(book),
  }));

  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.2,
          response_format: { type: 'json_schema', json_schema: { name: 'book_metadata', strict: true, schema: SCHEMA } },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(payload) },
          ],
        }),
      });
      if (!res.ok) throw new Error(`OpenAI error (${res.status}): ${await res.text()}`);
      const data = await res.json();
      return JSON.parse(data.choices[0].message.content).books;
    } catch (err) {
      if (attempt >= 3) throw err;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

function toMeta(book, out) {
  const prev = generatedBookMeta[book.title];
  const categoryWas = prev?.categoryWas || book.category;
  const meta = {
    tags: out.tags.slice(0, 2),
    keywords: [...new Set(out.keywords.map((k) => k.toLowerCase().trim()).filter(Boolean))].slice(0, 8),
  };
  if (needsSummary(book) && out.summary) {
    meta.summary = out.summary.trim();
    if (out.summary_confidence === 'low') meta.summaryConfidence = 'low';
  }
  if (out.category !== categoryWas && out.category_verdict !== 'correct') {
    if (out.category_verdict === 'wrong' && categoryWas !== 'Non-fiction' && !related(categoryWas, out.category)) {
      meta.category = out.category;
      meta.categoryWas = categoryWas;
    } else {
      meta.suggestedCategory = out.category;
    }
  }
  return meta;
}

function writeReport(meta) {
  const rows = Object.entries(meta);
  // Curated category maps take precedence, so those rows were not actually changed.
  const recategorised = rows.filter(([t, m]) => m.category && !categoryOverrides[t] && !generatedCategoryOverrides[t]);
  const lowConfidence = rows.filter(([, m]) => m.summaryConfidence === 'low');
  const suggested = rows.filter(([, m]) => m.suggestedCategory);
  const currentCategory = Object.fromEntries(books.map((b) => [b.title, b.category]));
  const esc = (s) => String(s).replace(/\|/g, '\\|');
  const lines = [
    '# Enrichment Review',
    '',
    `Generated by \`scripts/enrichBooks.mjs\` (${MODEL}). Curated values in \`categoryOverrides.js\`, \`summaryOverrides\` and \`bookTags.js\` take precedence over generated ones — add an entry there to correct anything below.`,
    '',
    `Books enriched: ${rows.length} · generated summaries: ${rows.filter(([, m]) => m.summary).length} · recategorised: ${recategorised.length} · low-confidence summaries: ${lowConfidence.length}`,
    '',
    '## Category corrections applied',
    '',
    '| Title | Was | Now |',
    '| --- | --- | --- |',
    ...recategorised.map(([t, m]) => `| ${esc(t)} | ${m.categoryWas} | ${m.category} |`),
    '',
    '## Suggested (not applied) — broad or adjacent categories',
    '',
    '| Title | Current | Suggested |',
    '| --- | --- | --- |',
    ...suggested.map(([t, m]) => `| ${esc(t)} | ${currentCategory[t] ?? ''} | ${m.suggestedCategory} |`),
    '',
    '## Low-confidence summaries (check these)',
    '',
    '| Title | Summary |',
    '| --- | --- |',
    ...lowConfidence.map(([t, m]) => `| ${esc(t)} | ${esc(m.summary)} |`),
    '',
  ];
  return writeFile(REPORT_PATH, lines.join('\n'));
}

async function main() {
  if (!apiKey) {
    console.error('\n❌ OPENAI_API_KEY is not set.\n');
    process.exit(1);
  }

  const todo = books.filter((b) => FORCE || !generatedBookMeta[b.title]).slice(0, LIMIT);
  console.log(`\n📚 Enriching ${todo.length} of ${books.length} books with ${MODEL}...`);

  const meta = { ...generatedBookMeta };
  const batches = [];
  for (let i = 0; i < todo.length; i += BATCH_SIZE) batches.push(todo.slice(i, i + BATCH_SIZE));

  let done = 0;
  let next = 0;
  async function worker() {
    while (next < batches.length) {
      const batch = batches[next++];
      const results = await enrichBatch(batch);
      const byId = new Map(results.map((r) => [r.id, r]));
      for (const book of batch) {
        const out = byId.get(book.id);
        if (out) meta[book.title] = toMeta(book, out);
        else console.warn(`\n⚠️  No result for "${book.title}"`);
      }
      done += batch.length;
      process.stdout.write(`\r  ${done}/${todo.length}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const sorted = Object.fromEntries(Object.entries(meta).sort(([a], [b]) => a.localeCompare(b)));
  const body = Object.entries(sorted)
    .map(([title, m]) => `  ${JSON.stringify(title)}: ${JSON.stringify(m)},`)
    .join('\n');
  await writeFile(
    META_PATH,
    `// Generated by scripts/enrichBooks.mjs — do not edit by hand (use categoryOverrides.js\n` +
      `// / summaryOverrides / bookTags.js for curated corrections, which take precedence).\n` +
      `export const generatedBookMeta = {\n${body}\n};\n`,
  );
  await writeReport(sorted);
  console.log(`\n🎉 Wrote src/data/generatedBookMeta.js and reports/enrichment-review.md`);
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
