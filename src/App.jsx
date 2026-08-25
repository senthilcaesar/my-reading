import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from './hooks/useDebounce';
import { Box, useDisclosure } from '@chakra-ui/react';
import Header from './components/Header';
import BookOfTheDay from './components/BookOfTheDay';
import Controls from './components/Controls';
import BookGrid from './components/BookGrid';
import BookDetailDrawer from './components/BookDetailDrawer';
import BookRouletteModal from './components/BookRouletteModal';
import {
  books as initialBooks,
  categories,
  recommenders,
} from './data/parsedBooks';
import { bookTags } from './data/bookTags';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRecommender, setSelectedRecommender] = useState('');
  const [booksList, setBooksList] = useState(initialBooks);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [selectedBook, setSelectedBook] = useState(null);

  // Drawer disclosure for full book details
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Roulette modal disclosure
  const {
    isOpen: isRouletteOpen,
    onOpen: onOpenRoulette,
    onClose: onCloseRoulette,
  } = useDisclosure();
  const [rouletteSession, setRouletteSession] = useState(0);

  const handleOpenRoulette = useCallback(() => {
    setRouletteSession((prev) => prev + 1);
    onOpenRoulette();
  }, [onOpenRoulette]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const handleBookSelect = useCallback(
    (book) => {
      setSelectedBook(book);
      onOpen();
    },
    [onOpen],
  );

  const handleShuffle = useCallback(() => {
    setBooksList((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setShuffleCount((prev) => prev + 1);
    // Reset filters
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedRecommender('');
  }, []);

  // Compute filtered and sorted books
  const filteredBooks = useMemo(() => {
    let result = [...booksList];

    // Filter by category
    if (selectedCategory) {
      result = result.filter((book) => book.category === selectedCategory);
    }

    // Filter by recommender
    if (selectedRecommender) {
      result = result.filter(
        (book) => book.recommender === selectedRecommender,
      );
    }

    // Filter by search query
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundaryRegex = new RegExp(`\\b${escapedQuery}`, 'i');

      result = result.filter((book) => {
        const matchesBasicFields =
          wordBoundaryRegex.test(book.title) ||
          wordBoundaryRegex.test(book.author) ||
          wordBoundaryRegex.test(book.category) ||
          wordBoundaryRegex.test(book.summary);

        const matchesRecommender =
          (book.recommender && wordBoundaryRegex.test(book.recommender)) ||
          (book.recommendationNote &&
            wordBoundaryRegex.test(book.recommendationNote));

        const tags = bookTags[book.title] || [];
        const matchesTags = tags.some((tag) => wordBoundaryRegex.test(tag));

        return matchesBasicFields || matchesRecommender || matchesTags;
      });
    }

    return result;
  }, [booksList, debouncedSearchQuery, selectedCategory, selectedRecommender]);

  return (
    <Box minH='100vh' transition='colors 0.3s'>
      <Header bookCount={filteredBooks.length} />
      <BookOfTheDay />
      <Box pt={8}>
        <Controls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedRecommender={selectedRecommender}
          setSelectedRecommender={setSelectedRecommender}
          categories={categories}
          recommenders={recommenders}
          onShuffle={handleShuffle}
          onRoulette={handleOpenRoulette}
        />
        <BookGrid
          books={filteredBooks}
          searchQuery={debouncedSearchQuery}
          shuffleCount={shuffleCount}
          onBookSelect={handleBookSelect}
        />
      </Box>
      <BookDetailDrawer book={selectedBook} isOpen={isOpen} onClose={onClose} />
      <BookRouletteModal
        key={rouletteSession}
        isOpen={isRouletteOpen}
        onClose={onCloseRoulette}
        books={filteredBooks}
        onBookSelect={handleBookSelect}
      />
    </Box>
  );
}

export default App;
