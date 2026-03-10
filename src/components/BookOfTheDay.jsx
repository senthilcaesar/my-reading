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
        <Flex position="relative" zIndex={10} align="center" justify="center" gap={{ base: 3, sm: 4 }} wrap={{ base: 'wrap', sm: 'nowrap' }} py={0}>
          
          <Flex align="center" gap={2}>
            <Box position="relative" display="inline-flex" alignItems="center" justifyContent="center">
              <div className="firework-bg">
                <svg className="central-burst" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {Array.from({length: 8}).map((_, i) => (
                  <svg key={i} className="firework-star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <div className="firework-bg firework-delay-1">
                <svg className="central-burst" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <Text as="span" className="billboard-star" fontSize="lg" position="relative" zIndex={10} mx={1}>📖</Text>
            </Box>
            
            <Text fontFamily="'Marcellus SC', serif" fontSize={{ base: 'xl', sm: '2xl' }} fontWeight="400" letterSpacing="0.1em" color={accentColor} whiteSpace="nowrap" zIndex={10}>
              Book of the Day
            </Text>
            
            <Box position="relative" display="inline-flex" alignItems="center" justifyContent="center">
              <div className="firework-bg firework-delay-2">
                <svg className="central-burst" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <div className="firework-bg">
                <svg className="central-burst" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {Array.from({length: 8}).map((_, i) => (
                  <svg key={i} className="firework-star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <Text as="span" className="billboard-star" fontSize="lg" position="relative" zIndex={10} mx={1}>📖</Text>
            </Box>
          </Flex>

          <Text display={{ base: 'none', sm: 'inline' }} color={dividerColor} fontSize="lg">│</Text>
          <Box display="flex" flexDirection="column" gap={0}>
            <Link href={book.link} isExternal _hover={{ textDecoration: 'none', opacity: 0.8 }}>
              <Heading fontFamily="serif" fontSize={{ base: 'md', sm: 'lg' }} fontWeight="bold" color={textColorPrimary} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" maxW="300px">
                {book.title}
              </Heading>
            </Link>
            <Flex align="center" gap={3}>
              <Text color={accentColor} fontSize="sm" fontWeight="bold">
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
