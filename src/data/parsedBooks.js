import { csvData } from './csvString.js';

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

if (parsed.length > 0) {
  const headers = parsed[0].map(h => h.toLowerCase());
  headers.forEach((h, i) => headerMap[h] = i);

  for (let i = 1; i < parsed.length; i++) {
    const row = parsed[i];
    // Ignore rows that don't match header count
    if (row.length < 3) continue; 
    
    const title = row[headerMap['title']] || '';
    if (!title) continue;
    
    let category = row[headerMap['category']] || 'Unknown';
    category = category.trim();
    if(category) categories.add(category);
    
    books.push({
      title: title.replace(/^"|"$/g, '').trim(),
      author: (row[headerMap['author']] || '').replace(/^"|"$/g, '').trim(),
      category: category,
      link: (row[headerMap['link']] || '').replace(/^"|"$/g, '').trim(),
      summary: (row[headerMap['summary']] || '').replace(/^"|"$/g, '').trim(),
    });
  }
}
