import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useDebounce } from './hooks/useDebounce';
import { Box, useDisclosure } from '@chakra-ui/react';
import Header from './components/Header';
import BookOfTheDay from './components/BookOfTheDay';
import Controls from './components/Controls';
import BookGrid from './components/BookGrid';
import BookDetailDrawer from './components/BookDetailDrawer';
import BookRouletteModal from './components/BookRouletteModal';
import AskDrawer from './components/AskDrawer';
import NewspaperBackground from './components/NewspaperBackground';
import NoResults from './components/NoResults';
import BackToTop from './components/BackToTop';
import {
  books as initialBooks,
  categories,
  recommenders,
} from './data/parsedBooks';

// Same matching rules as the search box: word-start match on the main fields.
function matchesSearch(book, wordBoundaryRegex) {
  return (
    wordBoundaryRegex.test(book.title) ||
    wordBoundaryRegex.test(book.author) ||
    wordBoundaryRegex.test(book.category) ||
    wordBoundaryRegex.test(book.summary) ||
    (book.recommender && wordBoundaryRegex.test(book.recommender)) ||
    (book.recommendationNote && wordBoundaryRegex.test(book.recommendationNote)) ||
    book.tags.some((tag) => wordBoundaryRegex.test(tag))
  );
}

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRecommender, setSelectedRecommender] = useState('');
  const [booksList, setBooksList] = useState(initialBooks);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [selectedBook, setSelectedBook] = useState(null);

  // Drawer disclosure for full book details
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Ask AI drawer disclosure
  const {
    isOpen: isAskOpen,
    onOpen: onOpenAsk,
    onClose: onCloseAsk,
  } = useDisclosure();
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

  const debouncedSearchQuery = useDebounce(searchQuery, 150);
  const isSearchSettling = searchQuery !== debouncedSearchQuery;

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

  // Compute filtered books, plus how many would match the search with no
  // category/recommender filter (shown on the "no results" screen).
  const { filteredBooks, searchMatchesAnywhere } = useMemo(() => {
    let result = booksList;

    if (selectedCategory) {
      result = result.filter((book) => book.category === selectedCategory);
    }
    if (selectedRecommender) {
      result = result.filter((book) => book.recommender === selectedRecommender);
    }

    let anywhere = 0;
    if (debouncedSearchQuery) {
      const escapedQuery = debouncedSearchQuery.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundaryRegex = new RegExp(`\\b${escapedQuery}`, 'i');
      result = result.filter((book) => matchesSearch(book, wordBoundaryRegex));
      if (result.length === 0 && (selectedCategory || selectedRecommender)) {
        anywhere = booksList.filter((book) => matchesSearch(book, wordBoundaryRegex)).length;
      }
    }

    return { filteredBooks: result, searchMatchesAnywhere: anywhere };
  }, [booksList, debouncedSearchQuery, selectedCategory, selectedRecommender]);

  // "Ask the Library about …" from the no-results screen: open Ask and run the query.
  const [askRequest, setAskRequest] = useState(null);
  const handleAskAbout = useCallback(
    (question) => {
      setAskRequest({ question, id: Date.now() });
      onOpenAsk();
    },
    [onOpenAsk],
  );

  const clearFilters = useCallback(() => {
    setSelectedCategory('');
    setSelectedRecommender('');
  }, []);
  const clearAll = useCallback(() => {
    setSearchQuery('');
    clearFilters();
  }, [clearFilters]);

  const emptyState = useMemo(
    () => (
      <NoResults
        query={debouncedSearchQuery}
        category={selectedCategory}
        recommender={selectedRecommender}
        matchesAnywhere={searchMatchesAnywhere}
        onClearSearch={() => setSearchQuery('')}
        onClearFilters={clearFilters}
        onClearAll={clearAll}
        onAsk={handleAskAbout}
      />
    ),
    [debouncedSearchQuery, selectedCategory, selectedRecommender, searchMatchesAnywhere, clearFilters, clearAll, handleAskAbout],
  );

  // Once the page's own search box has scrolled away, the header shows a compact one.
  const controlsRef = useRef(null);
  const gridRef = useRef(null);
  const [controlsInView, setControlsInView] = useState(true);
  useEffect(() => {
    const el = controlsRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Typing in the header search can shorten the list until the page's own search
        // box is back in view: hand the cursor over to it (the header box then hides),
        // so there's only ever one search box on screen.
        if (entry.isIntersecting && document.activeElement?.getAttribute('aria-label') === 'Search books') {
          const input = el.querySelector('input');
          if (input) {
            input.focus({ preventScroll: true });
            input.setSelectionRange(input.value.length, input.value.length);
          }
        }
        setControlsInView(entry.isIntersecting);
      },
      { rootMargin: '-72px 0px 0px 0px' }, // below the sticky header
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // A new search or filter while scrolled deep into the list: bring the start of the
  // results up under the header, so the reader sees what changed.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const grid = gridRef.current;
    if (!grid) return;
    const headerHeight = document.querySelector('header')?.offsetHeight ?? 64;
    const gridTop = grid.getBoundingClientRect().top + window.scrollY - headerHeight;
    if (window.scrollY > gridTop) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: gridTop, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }, [debouncedSearchQuery, selectedCategory, selectedRecommender]);

  return (
    <Box minH='100vh' position='relative' transition='colors 0.3s'>
      <NewspaperBackground />
      <Box position='relative' zIndex={1}>
        <Header
          bookCount={filteredBooks.length}
          showSearch={!controlsInView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <BookOfTheDay />
        <Box pt={8}>
          <Box ref={controlsRef}>
          <Controls
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedRecommender={selectedRecommender}
            setSelectedRecommender={setSelectedRecommender}
            categories={categories}
            recommenders={recommenders}
            resultCount={filteredBooks.length}
            totalCount={booksList.length}
            isSearchSettling={isSearchSettling}
            onShuffle={handleShuffle}
            onRoulette={handleOpenRoulette}
            onAsk={onOpenAsk}
          />
          </Box>
          <Box ref={gridRef}>
          <BookGrid
            books={filteredBooks}
            searchQuery={debouncedSearchQuery}
            shuffleCount={shuffleCount}
            isFiltering={isSearchSettling}
            onBookSelect={handleBookSelect}
            emptyState={emptyState}
          />
          </Box>
        </Box>
      </Box>
      <BackToTop visible={!controlsInView} />
      <BookDetailDrawer book={selectedBook} isOpen={isOpen} onClose={onClose} />
      <BookRouletteModal
        key={rouletteSession}
        isOpen={isRouletteOpen}
        onClose={onCloseRoulette}
        books={filteredBooks}
        onBookSelect={handleBookSelect}
      />
      <AskDrawer
        isOpen={isAskOpen}
        onClose={onCloseAsk}
        books={booksList}
        onSelectBook={handleBookSelect}
        request={askRequest}
      />
    </Box>
  );
}

export default App;
