import { csvData } from './csvString.js';
import { bookRecommendations } from './recommendations.js';
import { bookCovers } from './bookCovers.js';
import { bookTags } from './bookTags.js';
import {
  authorOverrides,
  categoryAliases,
  categoryOverrides,
  excludedTitles,
  summaryOverrides,
  titleOverrides,
} from './categoryOverrides.js';
import { generatedCategoryOverrides } from './generatedCategoryOverrides.js';
import { generatedBookMeta } from './generatedBookMeta.js';

// UTF-8 text that was mis-decoded as Windows-1252 ("RaÃºl", "Worldâ€™s") is decoded
// back; stray "Â" left over from non-breaking spaces is dropped.
const CP1252_BYTES = {
  '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88,
  '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93,
  '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b,
  'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f,
};
const CONT = '[\\u0080-\\u00bf€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]';
const MOJIBAKE_RUN = new RegExp(
  `[\\u00c2-\\u00df]${CONT}|[\\u00e0-\\u00ef]${CONT}{2}|[\\u00f0-\\u00f4]${CONT}{3}`,
  'g',
);
const utf8 = new TextDecoder('utf-8', { fatal: true });

function repairText(text) {
  if (!text || !/[ÂÃâ]/.test(text)) return text;
  return text
    .replace(MOJIBAKE_RUN, (run) => {
      try {
        return utf8.decode(Uint8Array.from(run, (ch) => CP1252_BYTES[ch] ?? ch.charCodeAt(0)));
      } catch {
        return run;
      }
    })
    .replace(/Â(?=\s|$)/g, '')
    .replace(/^Â/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// "Dr. Dan Ariely", "Michael Greger M.D. FACLM" -> plain names.
function cleanAuthor(author) {
  let prev;
  let a = author;
  do {
    prev = a;
    a = a
      .replace(/^Dr\.?\s+/i, '')
      .replace(/,?\s+(M\.?D\.?|Ph\.?\s?D\.?|PsyD|EdD|FACLM)(?=[\s,]|$)/gi, '')
      .trim();
  } while (a !== prev);
  return a;
}

// Robust line-by-line CSV parser
function parseCSV(csvText) {
  const result = [];
  const lines = csvText.split('\n');
  
  lines.forEach(line => {
    if (!line.trim()) return;
    const values = [];
    let currentVal = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());
    result.push(values);
  });
  
  return result;
}

const parsed = parseCSV(csvData);
const headerMap = {};
export const books = [];
export const categories = new Set();
export const recommenders = new Set();
const seenBookKeys = new Set();
const normalizeIdentity = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const normalizeCategory = (category) => categoryAliases[category] || category;

if (parsed.length > 0) {
  const headers = parsed[0].map(h => h.toLowerCase());
  headers.forEach((h, i) => headerMap[h] = i);

  const recommenderHeaderIdx = headerMap['recommender'] ?? headerMap['recommended by'] ?? headerMap['recommended_by'];

  for (let i = 1; i < parsed.length; i++) {
    const row = parsed[i];
    // Ignore rows that don't match header count
    if (row.length < 3) continue; 
    
    const rawTitle = row[headerMap['title']] || '';
    if (!rawTitle) continue;

    const sourceTitle = repairText(rawTitle.replace(/^"|"$/g, '').trim());
    if (excludedTitles.has(sourceTitle)) continue;
    const title = titleOverrides[sourceTitle] || sourceTitle;
    // Data files may still be keyed by the CSV title of a renamed book.
    const lookup = (map) => map[title] ?? map[sourceTitle];
    const meta = generatedBookMeta[title];
    const author =
      authorOverrides[title] || cleanAuthor(repairText((row[headerMap['author']] || '').replace(/^"|"$/g, '').trim()));
    const link = (row[headerMap['link']] || '').replace(/^"|"$/g, '').trim();
    const bookKey = `${normalizeIdentity(title)}\u0000${normalizeIdentity(author)}`;
    if (seenBookKeys.has(bookKey)) continue;
    seenBookKeys.add(bookKey);
    
    let category = row[headerMap['category']] || 'Unknown';
    category = normalizeCategory(category.trim());
    category = lookup(categoryOverrides) || lookup(generatedCategoryOverrides) || meta?.category || category;
    if (category) categories.add(category);

    const csvRecommender = recommenderHeaderIdx !== undefined ? (row[recommenderHeaderIdx] || '').replace(/^"|"$/g, '').trim() : '';
    let lookupRec = bookRecommendations[title];
    if (!lookupRec) {
      const titleLower = title.toLowerCase();
      const baseTitle = titleLower.split(/[:\-(–—]/)[0].trim();
      const matchKey = Object.keys(bookRecommendations).find((key) => {
        const keyLower = key.toLowerCase();
        if (keyLower === titleLower) return true;
        const baseKey = keyLower.split(/[:\-(–—]/)[0].trim();
        return baseKey === baseTitle && baseTitle.length > 3;
      });
      if (matchKey) {
        lookupRec = bookRecommendations[matchKey];
      }
    }
    const recommender = csvRecommender || lookupRec?.recommender || null;
    const recommendationNote = lookupRec?.note || (recommender ? `Recommended by ${recommender}` : null);

    if (recommender) recommenders.add(recommender);
    
    books.push({
      id: i,
      title: title,
      author: author,
      category: category,
      link: link,
      summary:
        lookup(summaryOverrides) ||
        meta?.summary ||
        repairText((row[headerMap['summary']] || '').replace(/^"|"$/g, '').trim()),
      recommender: recommender,
      recommendationNote: recommendationNote,
      coverUrl: lookup(bookCovers) || null,
      tags: lookup(bookTags) || meta?.tags || [],
      // Search-only topic terms (not displayed).
      keywords: meta?.keywords || [],
    });
  }
}
