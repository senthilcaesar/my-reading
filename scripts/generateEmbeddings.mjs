import { writeFile } from 'node:fs/promises';
import { books } from '../src/data/parsedBooks.js';
import { bookTags } from '../src/data/bookTags.js';

// Try loading .env or .env.local if present
try {
  process.loadEnvFile();
} catch (_) {}
try {
  process.loadEnvFile('.env.local');
} catch (_) {}

// Read API key from environment variable
const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.error('\n❌ Error: OPENAI_API_KEY is not set.');
  console.error('Please run the script with your OpenAI API key:');
  console.error('  OPENAI_API_KEY=sk-... node scripts/generateEmbeddings.mjs\n');
  process.exit(1);
}

const BATCH_SIZE = 64;
const DIMENSIONS = 512;
const MODEL = 'text-embedding-3-small';

function formatBookForEmbedding(book) {
  const tags = bookTags[book.title] || [];
  const parts = [
    `Title: ${book.title}`,
    `Author: ${book.author}`,
    `Category: ${book.category}`,
  ];
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

async function main() {
  console.log(`\n📚 Preparing embeddings for ${books.length} books...`);
  console.log(`Model: ${MODEL} (dimensions: ${DIMENSIONS})`);

  const results = [];
  const totalBatches = Math.ceil(books.length / BATCH_SIZE);

  for (let b = 0; b < totalBatches; b++) {
    const start = b * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, books.length);
    const batchBooks = books.slice(start, end);
    const batchTexts = batchBooks.map(formatBookForEmbedding);

    process.stdout.write(`Batch ${b + 1}/${totalBatches} (books ${start + 1}–${end})... `);

    try {
      const embeddings = await fetchEmbeddingsBatch(batchTexts);
      for (let i = 0; i < batchBooks.length; i++) {
        results.push({
          id: batchBooks[i].id,
          title: batchBooks[i].title,
          embedding: embeddings[i],
        });
      }
      console.log('✓');
    } catch (err) {
      console.error(`\n❌ Failed at batch ${b + 1}:`, err.message);
      process.exit(1);
    }
  }

  const outputPath = new URL('../public/embeddings.json', import.meta.url);
  await writeFile(outputPath, JSON.stringify(results));
  console.log(`\n🎉 Successfully wrote ${results.length} embeddings to public/embeddings.json!`);

  // Also write public/embedding.json as an alias
  const aliasPath = new URL('../public/embedding.json', import.meta.url);
  await writeFile(aliasPath, JSON.stringify(results));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
