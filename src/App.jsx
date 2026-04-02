import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from './hooks/useDebounce';
import { Box, useColorModeValue } from '@chakra-ui/react';
import Header from './components/Header';
import BookOfTheDay from './components/BookOfTheDay';
import Controls from './components/Controls';
import BookGrid from './components/BookGrid';
import { books as initialBooks, categories } from './data/parsedBooks';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [booksList, setBooksList] = useState(initialBooks);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const handleShuffle = useCallback(() => {
    const shuffled = [...booksList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setBooksList(shuffled);
    // Reset filters
    setSearchQuery('');
    setSelectedCategory('');
  }, [booksList]);

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
      result = result.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query) ||
        book.summary.toLowerCase().includes(query)
      );
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
        <BookGrid books={filteredBooks} searchQuery={debouncedSearchQuery} />
      </Box>
    </Box>
  );
}

export default App;
