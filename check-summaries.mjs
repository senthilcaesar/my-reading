import { books } from './src/data/parsedBooks.js';

const booksToCheck = ["The Great Crash", "The Graves Are Walking"];

booksToCheck.forEach(title => {
  const book = books.find(b => b.title === title);
  if (book) {
    console.log(`\n"${book.title}"`);
    console.log(`Summary: ${book.summary}`);
    console.log(`Contains "math": ${book.summary.toLowerCase().includes('math')}`);
  }
});
