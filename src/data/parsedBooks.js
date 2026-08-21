import { csvData } from './csvString.js';
import { bookRecommendations } from './recommendations.js';

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
    
    let category = row[headerMap['category']] || 'Unknown';
    category = category.trim();
    if (category) categories.add(category);

    const csvRecommender = recommenderHeaderIdx !== undefined ? (row[recommenderHeaderIdx] || '').replace(/^"|"$/g, '').trim() : '';
    let lookupRec = bookRecommendations[title];
    if (!lookupRec) {
      const titleLower = title.toLowerCase();
      const matchKey = Object.keys(bookRecommendations).find(
        (key) =>
          titleLower.startsWith(key.toLowerCase()) ||
          key.toLowerCase().startsWith(titleLower) ||
          titleLower.includes(key.toLowerCase()) ||
          key.toLowerCase().includes(titleLower),
      );
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
      author: (row[headerMap['author']] || '').replace(/^"|"$/g, '').trim(),
      category: category,
      link: (row[headerMap['link']] || '').replace(/^"|"$/g, '').trim(),
      summary: (row[headerMap['summary']] || '').replace(/^"|"$/g, '').trim(),
      recommender: recommender,
      recommendationNote: recommendationNote,
    });
  }
}


