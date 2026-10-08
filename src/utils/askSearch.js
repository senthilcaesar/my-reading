// Retrieval for "Ask the Library": a compact int8 embedding index plus a BM25
// keyword index, merged with reciprocal rank fusion (RRF).
// Pure JS with no Vite/browser APIs so scripts/ can import it for evaluation.

export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 512;
export const INDEX_VERSION = 1;

// ---------------------------------------------------------------------------
// Embedding index (public/embeddings.meta.json + public/embeddings.bin)
//
// meta: { version, model, dimensions, books: [{ title, hash, scale }],
//         suggestions: [{ text, scale }] }
// bin:  Int8Array rows, books first then suggestions; value = int8 * scale.
// ---------------------------------------------------------------------------

export function quantizeVector(vector) {
  let maxAbs = 0;
  for (const v of vector) maxAbs = Math.max(maxAbs, Math.abs(v));
  const scale = maxAbs / 127 || 1;
  const row = new Int8Array(vector.length);
  for (let i = 0; i < vector.length; i++) row[i] = Math.round(vector[i] / scale);
  return { row, scale };
}

function dequantizeInto(int8, offset, dims, scale, out, outOffset) {
  let norm = 0;
  for (let i = 0; i < dims; i++) {
    const v = int8[offset + i] * scale;
    out[outOffset + i] = v;
    norm += v * v;
  }
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < dims; i++) out[outOffset + i] /= norm;
}

export function decodeEmbeddingIndex(meta, buffer) {
  const dims = meta.dimensions;
  const int8 = new Int8Array(buffer);
  const bookCount = meta.books.length;
  const vectors = new Float32Array(bookCount * dims);
  meta.books.forEach((b, r) => dequantizeInto(int8, r * dims, dims, b.scale, vectors, r * dims));

  const suggestionVectors = new Map();
  (meta.suggestions || []).forEach((s, j) => {
    const v = new Float32Array(dims);
    dequantizeInto(int8, (bookCount + j) * dims, dims, s.scale, v, 0);
    suggestionVectors.set(s.text, v);
  });

  return { dims, titles: meta.books.map((b) => b.title), vectors, suggestionVectors };
}

// ---------------------------------------------------------------------------
// Text normalisation + BM25
// ---------------------------------------------------------------------------

// Phrases that tokenise badly ("World War II" -> world/war/ii) collapse to one token.
const PHRASES = [
  [/\b(world war (ii|2|two)|second world war|ww ?ii|ww2)\b/g, ' ww2 '],
  [/\b(world war (i|1|one)|first world war|great war|ww ?i|ww1)\b/g, ' ww1 '],
  [/\b(artificial intelligence|a\.i\.)/g, ' ai '],
  [/\bcold war\b/g, ' coldwar '],
];

const STOPWORDS = new Set(
  (
    'a an and are as at be been but by can could did do does for from had has have how i if in into is it its ' +
    'me my of on or our so some such than that the their them then there these they this those to too was we ' +
    'were what when where which while who whom why will with would you your ' +
    // question / request fluff that carries no topic signal
    'about any available book books discuss discusses discussing explain explains explore explores ' +
    'find give good great help interested learn like list look looking please read reading recommend ' +
    'recommendation recommendations should show something suggest tell titles understand want wish'
  ).split(' '),
);

function stem(token) {
  if (token.length > 4 && token.endsWith('ies')) return `${token.slice(0, -3)}y`;
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss') && !token.endsWith('us')) {
    return token.slice(0, -1);
  }
  return token;
}

export function tokenize(text) {
  let t = (text || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '');
  for (const [re, rep] of PHRASES) t = t.replace(re, rep);
  return t
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

const FIELD_WEIGHTS = { title: 3, author: 3, tags: 2, keywords: 2, category: 1.5, summary: 1 };
const K1 = 1.2;
const B = 0.75;

export function buildKeywordIndex(books) {
  const docs = books.map((book) => {
    const fields = {
      title: book.title,
      author: book.author,
      tags: (book.tags || []).join(' '),
      keywords: (book.keywords || []).join(' '),
      category: book.category,
      summary: book.summary,
    };
    const tf = new Map();
    let len = 0;
    for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
      for (const tok of tokenize(fields[field])) {
        tf.set(tok, (tf.get(tok) || 0) + weight);
        len += weight;
      }
    }
    return { tf, len };
  });

  const df = new Map();
  for (const d of docs) for (const tok of d.tf.keys()) df.set(tok, (df.get(tok) || 0) + 1);
  const avgLen = docs.reduce((s, d) => s + d.len, 0) / (docs.length || 1);
  return { docs, df, avgLen, n: docs.length };
}

// Returns BM25 scores plus, per book, how many distinct query terms it contains.
export function keywordScores(index, queryTokens) {
  const scores = new Float32Array(index.n);
  const matched = new Uint8Array(index.n);
  const unique = [...new Set(queryTokens)];
  for (const tok of unique) {
    const df = index.df.get(tok);
    if (!df) continue;
    const idf = Math.log(1 + (index.n - df + 0.5) / (df + 0.5));
    index.docs.forEach((d, i) => {
      const tf = d.tf.get(tok);
      if (!tf) return;
      matched[i] += 1;
      scores[i] += (idf * tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * d.len) / index.avgLen));
    });
  }
  return { scores, matched, termCount: unique.length };
}

// ---------------------------------------------------------------------------
// Category hints ("novels" -> Fiction)
// ---------------------------------------------------------------------------

const CATEGORY_HINTS = {
  novel: ['Fiction', 'Historical Fiction'],
  fiction: ['Fiction', 'Historical Fiction'],
  biography: ['Biography', 'Memoir'],
  memoir: ['Memoir', 'Biography'],
  autobiography: ['Memoir', 'Biography'],
};

function hintedCategories(queryTokens) {
  const cats = new Set();
  for (const tok of queryTokens) for (const c of CATEGORY_HINTS[tok] || []) cats.add(c);
  return cats;
}

// ---------------------------------------------------------------------------
// Hybrid search
// ---------------------------------------------------------------------------

const RRF_K = 60;
const MAX_RESULTS = 15;
const MIN_RESULTS = 5;
const SEMANTIC_WINDOW = 0.1; // keep semantic matches within this of the best one
const SEMANTIC_FLOOR = 0.3;
// A query is a weak match when no book contains even two of its terms (one, for
// single-term queries) and the best semantic score is only moderate — e.g. an
// author or topic the library doesn't have.
const WEAK_SEMANTIC = 0.55;
const MIN_MATCHED_TERMS = 2;
const CATEGORY_HINT_BONUS = 1 / RRF_K;

function dot(vectors, row, dims, query) {
  let s = 0;
  const off = row * dims;
  for (let i = 0; i < dims; i++) s += vectors[off + i] * query[i];
  return s;
}

/**
 * @param {object} p
 * @param {Array} p.books          book objects, aligned with keywordIndex
 * @param {object} p.keywordIndex  from buildKeywordIndex(books)
 * @param {object} p.embeddingIndex from decodeEmbeddingIndex
 * @param {Map}    p.rowByTitle    title -> row in embeddingIndex.vectors
 * @param {string} p.query
 * @param {ArrayLike<number>} p.queryVector unit-length query embedding
 * @returns {{ results: Array<{book, similarity, keywordScore, score}>, weak: boolean }}
 */
export function hybridSearch({ books, keywordIndex, embeddingIndex, rowByTitle, query, queryVector }) {
  const { vectors, dims } = embeddingIndex;
  const queryTokens = tokenize(query);
  const { scores: lex, matched, termCount } = keywordScores(keywordIndex, queryTokens);
  const hinted = hintedCategories(queryTokens);

  const items = books.map((book, i) => {
    const row = rowByTitle.get(book.title);
    return {
      book,
      similarity: row === undefined ? 0 : dot(vectors, row, dims, queryVector),
      keywordScore: lex[i],
    };
  });

  // Rank each signal independently, then fuse.
  const bySemantic = [...items].sort((a, b) => b.similarity - a.similarity);
  bySemantic.forEach((it, r) => (it.semanticRank = r));
  const byKeyword = items.filter((it) => it.keywordScore > 0).sort((a, b) => b.keywordScore - a.keywordScore);
  byKeyword.forEach((it, r) => (it.keywordRank = r));

  const topSim = bySemantic[0]?.similarity ?? 0;
  const topLex = byKeyword[0]?.keywordScore ?? 0;

  for (const it of items) {
    it.score = 1 / (RRF_K + it.semanticRank);
    if (it.keywordRank !== undefined) it.score += 1 / (RRF_K + it.keywordRank);
    if (hinted.has(it.book.category)) it.score += CATEGORY_HINT_BONUS;
  }

  const semanticCut = Math.max(SEMANTIC_FLOOR, topSim - SEMANTIC_WINDOW);
  const relevant = (it) =>
    it.similarity >= semanticCut ||
    // strong keyword match that is still at least loosely on-topic semantically
    (topLex > 0 && it.keywordScore >= 0.5 * topLex && it.similarity >= SEMANTIC_FLOOR - 0.05);

  const fused = items.sort((a, b) => b.score - a.score);
  let results = fused.filter(relevant).slice(0, MAX_RESULTS);

  let bestMatched = 0;
  for (const m of matched) bestMatched = Math.max(bestMatched, m);
  const weak = topSim < WEAK_SEMANTIC && bestMatched < Math.min(MIN_MATCHED_TERMS, termCount || 1);

  if (weak) {
    results = results.slice(0, MIN_RESULTS);
  } else if (results.length < MIN_RESULTS) {
    // Narrow queries: top up with the next best fused results that are still on-topic.
    const extra = fused.filter((it) => !results.includes(it) && it.similarity >= SEMANTIC_FLOOR);
    results = results.concat(extra.slice(0, MIN_RESULTS - results.length));
  }
  if (results.length === 0) results = fused.slice(0, 3);

  return { results, weak };
}
