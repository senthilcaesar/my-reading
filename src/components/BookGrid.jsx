import { memo, useEffect, useRef, useState } from "react";
import { SimpleGrid, Box } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import BookCard from "./BookCard";

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.985 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: Math.min(i, 14) * 0.025,
      duration: 0.32,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2, ease: 'easeOut' } },
};

// Cards are rendered in batches as the reader scrolls: rendering (and animating)
// all 1,000+ at once made load, search, filtering, shuffle and theme changes stall.
const PAGE_SIZE = 60; // divisible by every column count (1–5), so rows stay full
const LOAD_AHEAD = "1500px"; // start rendering the next batch well before it's seen

// Separate from BookGrid's fade so a keystroke (which only toggles `isFiltering`)
// doesn't re-render the cards.
const CardList = memo(function CardList({ books, searchQuery, shuffleCount, onBookSelect }) {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [prevBooks, setPrevBooks] = useState(books);
  if (books !== prevBooks) {
    // New search, filter or shuffle: start again from the first batch.
    setPrevBooks(books);
    setLimit(PAGE_SIZE);
  }

  const sentinelRef = useRef(null);
  const hasMore = limit < books.length;
  useEffect(() => {
    const el = sentinelRef.current;
    if (!hasMore || !el) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLimit((l) => Math.min(l + PAGE_SIZE, books.length));
        }
      },
      { rootMargin: `${LOAD_AHEAD} 0px` },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, limit, books.length]);

  return (
    <>
      <MotionSimpleGrid
        key={`grid-${shuffleCount}`}
        columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
        spacing={{ base: 4, md: 5, lg: 6 }}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.22,
          ease: 'easeOut',
          layout: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {books.slice(0, limit).map((book, idx) => (
            <MotionBox
              key={book.id}
              custom={idx % PAGE_SIZE}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              // Off-screen cards skip layout/paint, so opening a drawer or modal
              // doesn't re-lay out every rendered card. content-visibility clips
              // to the box, so transparent padding (cancelled by negative margins,
              // ignoring the pointer) leaves room for the hover lift and shadow.
              sx={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 320px' }}
              pt={3}
              pb={10}
              px={6}
              mt={-3}
              mb={-10}
              mx={-6}
              pointerEvents="none"
            >
              <Box h="full" pointerEvents="auto">
                <BookCard
                  book={book}
                  searchQuery={searchQuery}
                  onSelect={onBookSelect}
                />
              </Box>
            </MotionBox>
          ))}
        </AnimatePresence>
      </MotionSimpleGrid>
      {hasMore && <Box ref={sentinelRef} h="1px" aria-hidden="true" />}
    </>
  );
});

function BookGrid({
  books,
  searchQuery,
  shuffleCount,
  isFiltering,
  onBookSelect,
  emptyState,
}) {
  const hasBooks = books && books.length > 0;

  return (
    <MotionBox
      maxW="7xl"
      mx="auto"
      px={{ base: 3, sm: 4, md: 6, lg: 8 }}
      pb={16}
      layout
      animate={{ opacity: isFiltering ? 0.72 : 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!hasBooks ? (
          <MotionBox
            key="empty"
            py={{ base: 8, md: 12 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            layout
          >
            {emptyState}
          </MotionBox>
        ) : (
          <CardList
            key="cards"
            books={books}
            searchQuery={searchQuery}
            shuffleCount={shuffleCount}
            onBookSelect={onBookSelect}
          />
        )}
      </AnimatePresence>
    </MotionBox>
  );
}

// Memoised so opening a drawer or modal (state in App) doesn't re-render it.
export default memo(BookGrid);
