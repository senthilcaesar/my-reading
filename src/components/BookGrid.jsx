import { SimpleGrid, Box, Text } from "@chakra-ui/react";
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

export default function BookGrid({
  books,
  searchQuery,
  shuffleCount,
  isFiltering,
  onBookSelect,
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
            textAlign="center"
            py={12}
            px={4}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            layout
          >
            <Text fontSize="xl" color="textSecondary">
              No books found matching your criteria.
            </Text>
          </MotionBox>
        ) : (
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
              {books.map((book, idx) => (
                <MotionBox
                  key={book.id}
                  custom={idx}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  h="full"
                >
                  <BookCard
                    book={book}
                    searchQuery={searchQuery}
                    onSelect={onBookSelect}
                  />
                </MotionBox>
              ))}
            </AnimatePresence>
          </MotionSimpleGrid>
        )}
      </AnimatePresence>
    </MotionBox>
  );
}
