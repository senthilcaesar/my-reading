import { useEffect, useState } from 'react';
import { Box, Flex, Text, Heading, Link, Badge } from '@chakra-ui/react';
import { books } from '../data/parsedBooks';

export default function BookOfTheDay() {
  const [book, setBook] = useState(null);
  
  const bgGradient = "surfaceHover";
  const borderColor = "borderPrimary";
  const textColorPrimary = "textPrimary";
  const textColorSecondary = "textSecondary";
  const accentColor = "accentPrimary";
  const dividerColor = "borderPrimary";

  useEffect(() => {
    if (!books || books.length === 0) return;
    
    // Deterministic selection based on the current day
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((today - startOfYear) / 86400000);
    
    let seed = today.getFullYear() * 366 + dayOfYear;
    seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
    seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
    seed = seed ^ (seed >>> 16);
    const index = Math.abs(seed) % books.length;
    
    setBook(books[index]);
  }, []);

  if (!book) {
    return (
      <Box className="billboard-border-glow" pb="2px">
        <Box bg={bgGradient} px={4} py={5} position="relative" textAlign="center">
          <Text color="slate.500" fontSize="xs" py={0.5}>✨ Loading today's pick...</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="billboard-border-glow" pb="1px">
      <Box 
        bg={bgGradient}
        px={3} py={2} position="relative" 
        borderBottom="1px solid" borderBottomColor={borderColor} 
        overflow="hidden"
      >
        <Flex position="relative" zIndex={10} align="center" justify="center" gap={{ base: 2, sm: 3, md: 4 }} wrap={{ base: 'wrap', sm: 'nowrap' }} py={0}>
          
          <Flex align="center" gap={4}>
            <Box className="modern-book-container">
              <span className="modern-book-base">📖</span>
            </Box>
            
            <Text 
              fontFamily="'Libre Baskerville', serif" 
              fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }} 
              fontWeight="700" 
              fontStyle="italic"
              letterSpacing="0.02em" 
              color={accentColor} 
              whiteSpace="nowrap" 
              zIndex={10}
            >
              Book of the Day
            </Text>
            
            <Box className="modern-book-container">
              <span className="modern-book-base">📖</span>
            </Box>
          </Flex>

          <Text display={{ base: 'none', sm: 'inline' }} color={dividerColor} fontSize="lg">│</Text>
          <Box display="flex" flexDirection="column" gap={0}>
            <Link href={book.link} isExternal _hover={{ textDecoration: 'none', opacity: 0.8 }}>
          <Heading fontFamily="serif" fontSize={{ base: 'sm', sm: 'md', md: 'lg' }} fontWeight="normal" color={textColorPrimary} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" maxW={{ base: '180px', sm: '250px', md: '300px' }}>
                {book.title}
              </Heading>
            </Link>
            <Flex align="center" gap={3}>
              <Text color={accentColor} fontSize={{ base: 'xs', sm: 'sm' }} fontWeight="normal" display={{ base: 'none', sm: 'block' }}>
                by {book.author}
              </Text>
              <Badge bg={accentColor} color="bg" variant="solid" px={2} py={0.5} borderRadius="full" fontSize="xs">
                {book.category}
              </Badge>
            </Flex>
          </Box>
          
        </Flex>
      </Box>
    </Box>
  );
}
