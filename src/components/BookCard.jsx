import { memo } from 'react';
import { Box, Flex, Heading, Text, Badge, Link } from '@chakra-ui/react';
import { ExternalLink } from 'lucide-react';

const getCategoryStyles = (category) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('business')) return { colorScheme: 'blue', icon: '💼' };
  if (cat.includes('science')) return { colorScheme: 'purple', icon: '🔬' };
  if (cat.includes('history')) return { colorScheme: 'amber', icon: '🏺' };
  if (cat.includes('fiction')) return { colorScheme: 'pink', icon: '🎭' };
  if (cat.includes('technology') || cat.includes('computer')) return { colorScheme: 'cyan', icon: '💻' };
  if (cat.includes('biography') || cat.includes('memoir')) return { colorScheme: 'emerald', icon: '👤' };
  if (cat.includes('philosophy')) return { colorScheme: 'indigo', icon: '🤔' };
  return { colorScheme: 'slate', icon: '📚' };
};

const BookCard = memo(function BookCard({ book }) {
  const bg = "surface";
  const borderColor = "borderPrimary";
  const categoryStyles = getCategoryStyles(book.category);

  return (
    <Box 
      as={Link} href={book.link} isExternal 
      bg={bg} backdropFilter="blur(8px)"
      borderWidth="1px" borderColor={borderColor}
      borderRadius="2xl" p={{ base: 4, md: 5 }} shadow="md"
      display="flex" flexDirection="column" gap={{ base: 2, md: 3 }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{ transform: { base: 'translateY(-3px)', md: 'translateY(-8px)' }, shadow: 'xl', borderColor: 'orange.400', textDecoration: 'none' }}
      position="relative" overflow="hidden"
      role="group"
    >
      <Box 
        position="absolute" top={0} left={0} w="full" h="4px" 
        bgGradient="linear(to-r, blue.400, orange.400)" 
        opacity={0} _groupHover={{ opacity: 1 }} transition="opacity 0.3s"
      />
      
      <Flex justify="space-between" align="flex-start" gap={2}>
        <Badge 
          colorScheme={categoryStyles.colorScheme} 
          variant="subtle" px={2.5} py={1} borderRadius="full" 
          display="flex" alignItems="center" gap={1}
        >
          <Text as="span">{categoryStyles.icon}</Text>
          <Text as="span" fontWeight="bold" letterSpacing="wider">{book.category}</Text>
        </Badge>
        <Box color="slate.400" _groupHover={{ color: 'orange.500' }} transition="color 0.3s">
          <ExternalLink size={16} />
        </Box>
      </Flex>
      
      <Box flex="1">
        <Heading 
          as="h3" size="md" fontFamily="heading" mb={1} 
          color="textPrimary"
          lineHeight="shorter"
        >
          {book.title}
        </Heading>
        <Text color="textSecondary" fontSize="sm" fontStyle="italic" mb={3}>
          by {book.author}
        </Text>
        <Text color="textSecondary" fontSize={{ base: 'xs', md: 'sm' }} lineHeight="tall" noOfLines={{ base: 3, md: 4 }}>
          {book.summary}
        </Text>
      </Box>
    </Box>
  );
});

export default BookCard;
