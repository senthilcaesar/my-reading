import { books } from './src/data/parsedBooks.js';
import { bookTags } from './src/data/bookTags.js';

// Test search for "math"
const query = 'math'.toLowerCase();
const results = books.filter(book => {
  const matchesBasicFields =
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query) ||
    book.category.toLowerCase().includes(query) ||
    book.summary.toLowerCase().includes(query);

  const tags = bookTags[book.title] || [];
  const matchesTags = tags.some(tag => tag.toLowerCase().includes(query));

  return matchesBasicFields || matchesTags;
});

console.log(`\nSearch results for "math": ${results.length} books found\n`);
console.log('Books matching "math":');
results.forEach((book, idx) => {
  const tags = bookTags[book.title] || [];
  const matchReason = [];
  
  if (book.title.toLowerCase().includes(query)) matchReason.push('title');
  if (book.author.toLowerCase().includes(query)) matchReason.push('author');
  if (book.category.toLowerCase().includes(query)) matchReason.push('category');
  if (book.summary.toLowerCase().includes(query)) matchReason.push('summary');
  if (tags.some(tag => tag.toLowerCase().includes(query))) matchReason.push('tags: ' + tags.filter(t => t.toLowerCase().includes(query)).join(', '));
  
  console.log(`${idx + 1}. "${book.title}" [${matchReason.join(', ')}]`);
  if (tags.length > 0) {
    console.log(`   Tags: ${tags.join(', ')}`);
  }
});
