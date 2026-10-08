// Retrieval quality check for "Ask the Library".
// Compares the previous semantic-only ranking with the current hybrid search on a
// labelled query set. Query embeddings are cached in scripts/.eval-cache.json.
//
// Usage: node scripts/evalAsk.mjs [--verbose]

import { readFile, writeFile } from 'node:fs/promises';
import { books } from '../src/data/parsedBooks.js';
import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
  buildKeywordIndex,
  decodeEmbeddingIndex,
  hybridSearch,
} from '../src/utils/askSearch.js';

try {
  process.loadEnvFile();
} catch (_) {}

const VERBOSE = process.argv.includes('--verbose');
const CACHE_PATH = new URL('./.eval-cache.json', import.meta.url);

const WW2 = [
  'Bloodlands', 'Code Girls', 'Facing the Mountain', 'Flyboys: A True Story of Courage',
  'The Girls Who Stepped Out of Line: Unsung WWII Heroines Who Risked Everything for Freedom',
  'A Woman of No Importance: The Untold Story of the American Spy Who Helped Win World War II',
  'Rogue Heroes', 'Lost in Shangri-La', 'Against All Odds', 'The Liberator', 'Ghost Soldiers',
  'Unbroken', 'Stalingrad', 'The Rise and Fall of the Third Reich',
  'Agent Garbo', 'Survival In Auschwitz', 'The Rape Of Nanking', 'War As I Knew It', 'Eichmann in Jerusalem',
  'The Daughter of Auschwitz', 'A Train Near Magdeburg', 'My Private War', 'Eisenhower in War and Peace',
  "Man's Search for Meaning", 'The Happiest Man on Earth', 'Postwar',
  'American Prometheus: The Triumph and Tragedy of J. Robert Oppenheimer',
  'Stilwell and the American Experience in China', 'Citizens of London',
  // surfaced once thin summaries were filled in (scripts/enrichBooks.mjs)
  'Eagle Against the Sun', 'Countdown 1945', 'Last Call at the Hotel Imperial', 'Hotel Exile', 'Franklin D. Roosevelt: A Political Life',
];
const WW1_ERA = ['Peace to End All Peace', 'The German Revolution'];

// relevant: titles that are correct answers (partial labels are fine — both
// algorithms are scored against the same set). offTopic: titles that must not appear.
// expectWeak: nothing in the library really answers this.
const CASES = [
  { q: 'Which books discuss about World War II?', relevant: WW2, offTopic: WW1_ERA },
  { q: 'WWII', relevant: WW2, offTopic: WW1_ERA },
  { q: 'Holocaust survivors', relevant: ['Survival In Auschwitz', "Man's Search for Meaning", 'The Daughter of Auschwitz', 'The Happiest Man on Earth', 'A Train Near Magdeburg', 'Eichmann in Jerusalem', 'The Choice: Embrace the Possible'] },
  { q: 'Steve Jobs', relevant: ['Steve Jobs', "Creative Selection: Inside Apple's Design Process During the Golden Age of Steve Jobs"] },
  { q: 'books by Walter Isaacson', relevant: ['Steve Jobs', 'The Code Breaker', 'The Innovators', 'The Wise Men: Six Friends and the World They Made', 'Benjamin Franklin: An American Life'] },
  { q: 'Michael Lewis', relevant: ['Going Infinite: The Rise and Fall of a New Tycoon', 'Moneyball', 'Flash Boys', "Liar's Poker", 'The Premonition', 'The Big Short'] },
  { q: 'Sapiens', relevant: ['Sapiens'] },
  { q: 'index funds', relevant: ['All About Index Funds', 'The Bogle Effect', "The Bogleheads' Guide to Investing", 'The Clash of the Cultures', 'The Little Book of Common Sense Investing'] },
  { q: 'books on investing for beginners', relevant: ['Learn to Earn', 'The Elements of Investing', 'The Little Book of Common Sense Investing', 'How I Invest My Money', "The Bogleheads' Guide to Investing", 'The Four Pillars of Investing', 'All About Index Funds'] },
  { q: 'novels', relevant: ['When Sleeping Women Wake', 'Balzac and the Little Chinese Seamstress', 'Charlie and the Great Glass Elevator', 'Half of a Yellow Sun', 'Hunger Trilogy', 'Love in a Fallen City', 'Snow Flower and the Secret Fan', 'The Claws of the Dragon', 'The Feast of the Goat', 'The Street Lawyer', 'The Unbearable Lightness of Being', 'To Live: A Novel', 'Waiting', 'Rickshaw Boy: A Novel', 'Piecing Me Together', 'Between The Stitching', 'The Fountainhead'], offTopic: ['The Phoenix Project'] },
  { q: 'artificial intelligence and its impact on society', relevant: ['The Scaling Era: An Oral History of AI', 'Why Machines Learn', 'Co-Intelligence', 'Artificial Intelligence', 'Genius Makers', 'Artificial Intelligence: A Guide for Thinking Humans', 'The Age of AI: And Our Human Future', 'Competing in the Age of AI', "What Should My Children Do?: A Human's Guide to the Age of AI", 'How To Think About AI', 'Hello World: Being Human in the Age of Algorithms', 'The Worlds I See', 'Prediction Machines', 'Creative Machines: AI, Art & Us'] },
  { q: 'I want to learn how the human brain works. What books should I read?', relevant: ['The Tell-Tale Brain', 'The Living Brain', 'The Tale of the Dueling Neurosurgeons', 'The Disordered Mind', 'Rhythms of the Brain', 'The Neuroscience of Intelligence', 'A Brief History of Intelligence', "Who's in Charge?", 'Social', 'The Deep History of Ourselves', 'Proust and the Squid', 'Behave: The Biology of Humans at Our Best and Worst', 'Synaptic Self: How Our Brains Become Who We Are'] },
  { q: 'Cold War espionage', relevant: ['The Spy and the Traitor: The Greatest Espionage Story of the Cold War'] },
  // Broad topic with ~100 relevant books; labels are the original version's top 20
  // (all on-topic), which the first hybrid version under-returned.
  { q: 'Can you recommend books about women’s lives and experiences?', relevant: ['My Life on the Road', 'The Good Women of China: Hidden Voices', 'How to Think Like a Woman', 'Having It All', 'Dear Ijeawele', 'Invisible Women: Data Bias in a World Designed for Men', 'Women After All', 'Cassandra Speaks', 'Portraits of Chinese Women in Revolution', 'Saving the Selves of Adolescent Girls', "That's What She Said", 'Women and Men in Conversation', 'When Women Lead', 'I Feel Bad About My Neck', 'I Myself Am a Woman', 'Financial Feminist', 'The Second Sex', 'More Than Enough', 'Scarlet Sisters', 'Rage Becomes Her: The Power of Women\'s Anger'] },
  { q: 'Kahneman', relevant: [], expectWeak: true },
  { q: 'books about knitting and crochet patterns', relevant: [], expectWeak: true },
];

// The ranking AskDrawer used before hybrid search: cosine only, dynamic cutoff.
function legacySearch(embeddingIndex, queryVector) {
  const scored = books.map((book, r) => {
    let s = 0;
    for (let i = 0; i < embeddingIndex.dims; i++) s += embeddingIndex.vectors[r * embeddingIndex.dims + i] * queryVector[i];
    return { book, similarity: s };
  });
  scored.sort((a, b) => b.similarity - a.similarity);
  const cutoff = Math.max(0.36, scored[0].similarity * 0.72);
  const matching = scored.filter((it) => it.similarity >= cutoff);
  const results =
    matching.length >= 5 ? matching : scored.filter((it) => it.similarity >= 0.3).slice(0, Math.max(5, matching.length));
  return { results, weak: false };
}

async function embedQueries(queries) {
  let cache = {};
  try {
    cache = JSON.parse(await readFile(CACHE_PATH, 'utf8'));
  } catch (_) {}
  const missing = queries.filter((q) => !cache[q]);
  if (missing.length) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is required to embed uncached eval queries');
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: EMBEDDING_MODEL, dimensions: EMBEDDING_DIMENSIONS, input: missing }),
    });
    if (!res.ok) throw new Error(`OpenAI error (${res.status}): ${await res.text()}`);
    (await res.json()).data.forEach((d, i) => (cache[missing[i]] = d.embedding));
    await writeFile(CACHE_PATH, JSON.stringify(cache));
  }
  return cache;
}

function score(c, { results, weak }) {
  const titles = results.map((r) => r.book.title);
  const rel = new Set(c.relevant);
  const top5 = titles.slice(0, 5);
  return {
    returned: titles.length,
    p5: c.relevant.length ? top5.filter((t) => rel.has(t)).length / Math.min(5, rel.size) : null,
    recall: c.relevant.length ? titles.slice(0, 15).filter((t) => rel.has(t)).length / Math.min(15, rel.size) : null,
    offTopic: titles.filter((t) => (c.offTopic || []).includes(t)).length,
    weakOk: c.expectWeak ? weak : !weak,
    titles,
  };
}

const meta = JSON.parse(await readFile(new URL('../public/embeddings.meta.json', import.meta.url), 'utf8'));
const bin = await readFile(new URL('../public/embeddings.bin', import.meta.url));
const embeddingIndex = decodeEmbeddingIndex(meta, bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength));
const rowByTitle = new Map(embeddingIndex.titles.map((t, r) => [t, r]));
if (embeddingIndex.titles.some((t, r) => books[r]?.title !== t)) {
  throw new Error('Embedding index is out of date — run npm run generate:embeddings');
}
const keywordIndex = buildKeywordIndex(books);
const vectors = await embedQueries(CASES.map((c) => c.q));

const pct = (v) => (v === null ? '   –' : `${Math.round(v * 100)}%`.padStart(4));
const totals = { legacy: { p5: [], recall: [], off: 0, weak: 0 }, hybrid: { p5: [], recall: [], off: 0, weak: 0 } };

console.log(`${'query'.padEnd(46)} | old P@5 R@15  n off | new P@5 R@15  n off weak`);
for (const c of CASES) {
  const qv = vectors[c.q];
  const t0 = performance.now();
  const hybrid = hybridSearch({ books, keywordIndex, embeddingIndex, rowByTitle, query: c.q, queryVector: qv });
  const ms = performance.now() - t0;
  const runs = { legacy: score(c, legacySearch(embeddingIndex, qv)), hybrid: score(c, hybrid) };
  for (const [k, s] of Object.entries(runs)) {
    if (s.p5 !== null) totals[k].p5.push(s.p5), totals[k].recall.push(s.recall);
    totals[k].off += s.offTopic;
    totals[k].weak += s.weakOk ? 1 : 0;
  }
  const { legacy: o, hybrid: n } = runs;
  console.log(
    `${c.q.slice(0, 46).padEnd(46)} | ${pct(o.p5)} ${pct(o.recall)} ${String(o.returned).padStart(3)} ${String(o.offTopic).padStart(3)} |` +
      ` ${pct(n.p5)} ${pct(n.recall)} ${String(n.returned).padStart(3)} ${String(n.offTopic).padStart(3)} ${n.weakOk ? ' ok' : 'BAD'}` +
      (VERBOSE ? `  (${ms.toFixed(1)} ms)` : ''),
  );
  if (VERBOSE) n.titles.slice(0, 8).forEach((t) => console.log(`      ${c.relevant.includes(t) ? '✓' : ' '} ${t}`));
}
const avg = (a) => a.reduce((s, x) => s + x, 0) / a.length;
console.log('\nAverages (labelled queries):');
for (const [k, t] of Object.entries(totals)) {
  console.log(
    `  ${k.padEnd(6)} P@5 ${pct(avg(t.p5))}  R@15 ${pct(avg(t.recall))}  off-topic ${t.off}  weak-flag correct ${t.weak}/${CASES.length}`,
  );
}
