import { SimpleGrid, Box, Text } from '@chakra-ui/react';
import BookCard from './BookCard';

export default function BookGrid({ books }) {
  if (!books || books.length === 0) {
    return (
      <Box textAlign="center" py={12} px={4}>
        <Text fontSize="xl" color="textSecondary">No books found matching your criteria.</Text>
      </Box>
    );
  }

  return (
    <SimpleGrid 
      columns={{ base: 1, sm: 2, lg: 3, xl: 5 }} 
      spacing={6} 
      maxW="7xl" 
      mx="auto" 
      px={{ base: 4, sm: 6, lg: 8 }} 
      pb={16}
    >
      {books.map((book, idx) => (
        <BookCard key={idx} book={book} />
      ))}
    </SimpleGrid>
  );
}
