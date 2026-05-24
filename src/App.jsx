import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from './hooks/useDebounce';
import { Box } from '@chakra-ui/react';
import Header from './components/Header';
import BookOfTheDay from './components/BookOfTheDay';
import Controls from './components/Controls';
import BookGrid from './components/BookGrid';
import { books as initialBooks, categories } from './data/parsedBooks';
import { bookTags } from './data/bookTags';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [booksList, setBooksList] = useState(initialBooks);
  const [shuffleCount, setShuffleCount] = useState(0);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const handleShuffle = useCallback(() => {
    setBooksList(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setShuffleCount(prev => prev + 1);
    // Reset filters
    setSearchQuery('');
    setSelectedCategory('');
  }, []);

  // Compute filtered and sorted books
  const filteredBooks = useMemo(() => {
    let result = [...booksList];

    // Filter by category
    if (selectedCategory) {
      result = result.filter(book => book.category === selectedCategory);
    }

    // Filter by search query
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundaryRegex = new RegExp(`\\b${escapedQuery}`, 'i');

      result = result.filter(book => {
        const matchesBasicFields =
          wordBoundaryRegex.test(book.title) ||
          wordBoundaryRegex.test(book.author) ||
          wordBoundaryRegex.test(book.category) ||
          wordBoundaryRegex.test(book.summary);

        const tags = bookTags[book.title] || [];
        const matchesTags = tags.some(tag => wordBoundaryRegex.test(tag));

        return matchesBasicFields || matchesTags;
      });
    }

    return result;
  }, [booksList, debouncedSearchQuery, selectedCategory]);

  return (
    <Box minH="100vh" transition="colors 0.3s">
      <Header bookCount={filteredBooks.length} />
      <BookOfTheDay />
      <Box pt={8}>
        <Controls 
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
          categories={categories}
          onShuffle={handleShuffle}
        />
        <BookGrid
          books={filteredBooks}
          searchQuery={debouncedSearchQuery}
          shuffleCount={shuffleCount}
        />
      </Box>
    </Box>
  );
}

export default App;
