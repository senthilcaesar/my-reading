import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { SearchX } from 'lucide-react';
import RaisingHandIcon from './RaisingHandIcon';

const quote = (text) => `“${text.length > 40 ? `${text.slice(0, 40)}…` : text}”`;

/**
 * Shown when the search and filters match no books. Says what didn't match and
 * offers the next step: widen the filters, ask the library in plain language, or
 * clear everything.
 */
export default function NoResults({
  query,
  category,
  recommender,
  matchesAnywhere,
  onClearSearch,
  onClearFilters,
  onClearAll,
  onAsk,
}) {
  const hasFilters = Boolean(category || recommender);
  const filterText = [category && `in ${category}`, recommender && `picked by ${recommender}`]
    .filter(Boolean)
    .join(' ');

  let title;
  let body;
  if (query) {
    title = `No books match ${quote(query)}${filterText ? ` ${filterText}` : ''}`;
    body =
      matchesAnywhere > 0
        ? `${matchesAnywhere} ${matchesAnywhere === 1 ? 'book matches' : 'books match'} ${quote(query)} once the filters are off.`
        : 'Check the spelling or try a shorter word. Search looks at titles, authors, categories, tags and summaries.';
  } else {
    title = `No ${category ? `${category} ` : ''}books ${recommender ? `picked by ${recommender}` : 'match these filters'}`;
    body = 'Try a different category or recommender.';
  }

  let clearLabel = 'Clear filters';
  let onClear = onClearFilters;
  if (query && hasFilters) {
    clearLabel = 'Clear search and filters';
    onClear = onClearAll;
  } else if (query) {
    clearLabel = 'Clear search';
    onClear = onClearSearch;
  }

  return (
    <Flex
      direction="column"
      align="center"
      textAlign="center"
      maxW="600px"
      mx="auto"
      px={{ base: 5, md: 10 }}
      py={{ base: 8, md: 10 }}
      bg="bg"
      borderWidth="1px"
      borderColor="borderPrimary"
      borderRadius="2xl"
      shadow="lg"
    >
      <Box color="textSecondary" mb={3}>
        <SearchX size={32} strokeWidth={1.75} />
      </Box>
      <Heading as="h2" fontSize={{ base: 'lg', md: 'xl' }} fontWeight="600" color="textPrimary" lineHeight="short">
        {title}
      </Heading>
      <Text fontSize="md" color="textSecondary" mt={2} maxW="46ch">
        {body}
      </Text>

      <Flex mt={6} gap={3} wrap="wrap" justify="center">
        {matchesAnywhere > 0 && (
          <Button
            bg="accentPrimary"
            color="bg"
            borderRadius="xl"
            fontFamily="heading"
            fontWeight="bold"
            _hover={{ bg: 'accentPrimary', filter: 'brightness(0.92)' }}
            _active={{ bg: 'accentPrimary', filter: 'brightness(0.85)' }}
            onClick={onClearFilters}
          >
            Show all {matchesAnywhere} {matchesAnywhere === 1 ? 'match' : 'matches'}
          </Button>
        )}
        {query && (
          <Button
            leftIcon={<RaisingHandIcon size={18} />}
            bg="accentGreen"
            color="white"
            borderRadius="xl"
            fontFamily="heading"
            fontWeight="bold"
            whiteSpace="normal"
            h="auto"
            minH={10}
            py={2}
            _hover={{ bg: 'accentGreenHover' }}
            _active={{ bg: 'accentGreenHover' }}
            onClick={() => onAsk(query)}
          >
            Ask the Library about {quote(query)}
          </Button>
        )}
        <Button
          variant="outline"
          borderColor="borderPrimary"
          color="textPrimary"
          borderRadius="xl"
          fontFamily="heading"
          fontWeight="600"
          _hover={{ bg: 'surface' }}
          onClick={onClear}
        >
          {clearLabel}
        </Button>
      </Flex>

      {query && (
        <Text fontSize="sm" fontStyle="italic" color="textSecondary" mt={4}>
          Ask finds books by topic and idea, not just exact words.
        </Text>
      )}
    </Flex>
  );
}
