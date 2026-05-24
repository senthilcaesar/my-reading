import { books } from './src/data/parsedBooks.js';
import { bookTags } from './src/data/bookTags.js';

// Test search for "math" with word boundaries
const query = 'math'.toLowerCase();
const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordBoundaryRegex = new RegExp(`\\b${escapedQuery}`, 'i');

const results = books.filter(book => {
  const matchesBasicFields =
    wordBoundaryRegex.test(book.title) ||
    wordBoundaryRegex.test(book.author) ||
    wordBoundaryRegex.test(book.category) ||
    wordBoundaryRegex.test(book.summary);

  const tags = bookTags[book.title] || [];
  const matchesTags = tags.some(tag => wordBoundaryRegex.test(tag));

  return matchesBasicFields || matchesTags;
});

console.log(`\nSearch results for "math": ${results.length} books found\n`);
console.log('Books matching "math":');
results.forEach((book, idx) => {
  const tags = bookTags[book.title] || [];
  const matchReason = [];
  
  if (wordBoundaryRegex.test(book.title)) matchReason.push('title');
  if (wordBoundaryRegex.test(book.author)) matchReason.push('author');
  if (wordBoundaryRegex.test(book.category)) matchReason.push('category');
  if (wordBoundaryRegex.test(book.summary)) matchReason.push('summary');
  if (tags.some(tag => wordBoundaryRegex.test(tag))) matchReason.push('tags: ' + tags.filter(t => wordBoundaryRegex.test(t)).join(', '));
  
  console.log(`${idx + 1}. "${book.title}" [${matchReason.join(', ')}]`);
  if (tags.length > 0) {
    console.log(`   Tags: ${tags.join(', ')}`);
  }
});

// Verify that "aftermath" books are NOT included
const aftermathBooks = results.filter(b => b.summary && b.summary.includes('aftermath'));
console.log(`\n✓ Books with "aftermath" included: ${aftermathBooks.length} (should be 0)`);
