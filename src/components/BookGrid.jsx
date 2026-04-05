import { SimpleGrid, Box, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import BookCard from './BookCard';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: Math.min(i, 14) * 0.045,
      duration: 0.38,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export default function BookGrid({ books, searchQuery, shuffleCount }) {
  if (!books || books.length === 0) {
    return (
      <Box textAlign="center" py={12} px={4}>
        <Text fontSize="xl" color="textSecondary">No books found matching your criteria.</Text>
      </Box>
    );
  }

  return (
    <MotionSimpleGrid
      key={shuffleCount}
      columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
      spacing={{ base: 4, md: 5, lg: 6 }}
      maxW="7xl"
      mx="auto"
      px={{ base: 3, sm: 4, md: 6, lg: 8 }}
      pb={16}
      layout
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
            <BookCard book={book} searchQuery={searchQuery} />
          </MotionBox>
        ))}
      </AnimatePresence>
    </MotionSimpleGrid>
  );
}
