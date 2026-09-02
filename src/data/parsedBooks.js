import { csvData } from './csvString.js';
import { bookRecommendations } from './recommendations.js';
import { bookCovers } from './bookCovers.js';

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

    const title = rawTitle.replace(/^"|"$/g, '').trim();
    const author = (row[headerMap['author']] || '').replace(/^"|"$/g, '').trim();
    const link = (row[headerMap['link']] || '').replace(/^"|"$/g, '').trim();
    const bookKey = `${normalizeIdentity(title)}\u0000${normalizeIdentity(author)}`;
    if (seenBookKeys.has(bookKey)) continue;
    seenBookKeys.add(bookKey);
    
    let category = row[headerMap['category']] || 'Unknown';
    category = category.trim();
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
      summary: (row[headerMap['summary']] || '').replace(/^"|"$/g, '').trim(),
      recommender: recommender,
      recommendationNote: recommendationNote,
      coverUrl: bookCovers[title] || null,
    });
  }
}
