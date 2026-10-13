// Download a list of books as a CSV file (used by the main page and Ask the Library).

const COLUMNS = [
  ['Title', (book) => book.title],
  ['Author', (book) => book.author],
  ['Category', (book) => book.category],
  ['Recommended by', (book) => book.recommender],
  ['Link', (book) => book.link],
  ['Description', (book) => book.summary],
];

function csvCell(value) {
  const text = value == null ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function booksToCsv(books) {
  const rows = [COLUMNS.map(([header]) => header)];
  for (const book of books) rows.push(COLUMNS.map(([, get]) => get(book)));
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

// "Science & Nature" → "science-nature"; used to build readable file names.
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function downloadBooksCsv(books, name = 'books') {
  // The BOM makes Excel read the file as UTF-8 (accented author names).
  const blob = new Blob(['﻿', booksToCsv(books)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
