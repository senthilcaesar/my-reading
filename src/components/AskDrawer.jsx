import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
  Box,
  Flex,
  Heading,
  Text,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Badge,
  Image,
  VStack,
  HStack,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import {
  Search,
  ExternalLink,
  BookOpen,
  ArrowRight,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import RaisingHandIcon from './RaisingHandIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryStyles } from '../utils/categoryStyles';

const MotionBox = motion(Box);

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return dot;
}

const SUGGESTIONS = [
  'Geopolitics of microchips & global power',
  'Overcoming personal grief and adversity',
  'Biographies of iconic tech founders',
  'Psychology of decision-making & cognitive bias',
];

export default function AskDrawer({ isOpen, onClose, books, onSelectBook }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [embeddingsData, setEmbeddingsData] = useState(null);
  const [embeddingsError, setEmbeddingsError] = useState(false);
  const activeApiKey = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const stored = localStorage.getItem('openai_api_key');
    const envKey = import.meta.env?.VITE_OPENAI_API_KEY || '';
    return stored && stored.trim() ? stored.trim() : envKey;
  }, []);
  const toast = useToast();

  // Fetch embeddings.json once when drawer opens
  useEffect(() => {
    if (!isOpen || embeddingsData) return;

    let isCancelled = false;
    async function loadEmbeddings() {
      try {
        let res = await fetch('/embeddings.json');
        if (!res.ok) {
          res = await fetch('/embedding.json');
        }
        if (!res.ok) {
          throw new Error('Embeddings file not found');
        }
        const data = await res.json();
        if (!isCancelled) {
          setEmbeddingsData(data);
          setEmbeddingsError(false);
        }
      } catch {
        if (!isCancelled) {
          setEmbeddingsError(true);
        }
      }
    }

    loadEmbeddings();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, embeddingsData]);

  // Fast map from book ID/title to book object
  const booksMap = useMemo(() => {
    const mapById = new Map();
    const mapByTitle = new Map();
    for (const b of books) {
      mapById.set(b.id, b);
      mapByTitle.set(b.title.toLowerCase().trim(), b);
    }
    return { mapById, mapByTitle };
  }, [books]);

  const handleSearch = useCallback(
    async (searchPrompt) => {
      const q = (searchPrompt ?? query).trim();
      if (!q) return;

      if (!activeApiKey) {
        toast({
          title: 'OpenAI API Key Missing',
          description: 'Please ensure OPENAI_API_KEY is configured in your .env file.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      if (!embeddingsData || embeddingsData.length === 0) {
        toast({
          title: 'Embeddings Index Missing',
          description: 'Run "OPENAI_API_KEY=... node scripts/generateEmbeddings.mjs" to generate embeddings.json.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      setIsLoading(true);
      try {
        // 1. Embed query with OpenAI text-embedding-3-small
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeApiKey}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            dimensions: 512,
            input: q,
          }),
        });

        if (!response.ok) {
          const errData = await response.text();
          throw new Error(`OpenAI error (${response.status}): ${errData}`);
        }

        const data = await response.json();
        const queryVector = data.data?.[0]?.embedding;
        if (!queryVector) throw new Error('No embedding returned from OpenAI');

        // 2. Score against all cached embeddings
        const scored = [];
        for (const item of embeddingsData) {
          const book =
            booksMap.mapById.get(item.id) ||
            booksMap.mapByTitle.get(item.title?.toLowerCase()?.trim());

          if (book && item.embedding) {
            const similarity = cosineSimilarity(queryVector, item.embedding);
            scored.push({ book, similarity });
          }
        }

        // 3. Sort descending and return all matching results
        scored.sort((a, b) => b.similarity - a.similarity);

        if (scored.length === 0) {
          setResults([]);
          return;
        }

        const topScore = scored[0].similarity;
        // Dynamic relevance threshold: minimum 0.36 or within 72% of top match
        const cutoff = Math.max(0.36, topScore * 0.72);
        const matchingResults = scored.filter((item) => item.similarity >= cutoff);

        // Fallback for narrow queries to include best matches above baseline
        const finalResults =
          matchingResults.length >= 5
            ? matchingResults
            : scored.filter((item) => item.similarity >= 0.30).slice(0, Math.max(5, matchingResults.length));

        setResults(finalResults);
      } catch (err) {
        toast({
          title: 'Search Failed',
          description: err.message || 'Could not compute embeddings.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [query, activeApiKey, embeddingsData, booksMap, toast],
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right">
      <DrawerOverlay backdropFilter="blur(6px)" />
      <DrawerContent
        bg="bg"
        borderLeftWidth="1px"
        borderColor="borderPrimary"
        w={{ base: '100vw', md: '640px', lg: '680px' }}
        maxW={{ base: '100vw', md: '640px', lg: '680px' }}
      >
        {/* Top gradient accent */}
        <Box h="4px" bgGradient="linear(to-r, accentPrimary, accentSecondary)" flexShrink={0} />

        <DrawerCloseButton color="textSecondary" borderRadius="full" mt={3} />

        <DrawerHeader pt={6} pb={3}>
          <Flex align="center" justify="space-between" pr={8}>
            <HStack spacing={2.5}>
              <Box
                w={8}
                h={8}
                borderRadius="lg"
                bg="accentGreen"
                color="white"
                display="grid"
                placeItems="center"
              >
                <RaisingHandIcon size={18} />
              </Box>
              <Box>
                <Heading size="md" color="textPrimary" fontFamily="heading">
                  Ask the Library
                </Heading>
              </Box>
            </HStack>

          </Flex>

          {/* Missing embeddings warning */}
          {embeddingsError && (
            <Box
              mt={3}
              p={3}
              bg="rgba(217, 119, 87, 0.12)"
              borderWidth="1px"
              borderColor="accentPrimary"
              borderRadius="xl"
            >
              <Flex gap={2} align="flex-start">
                <AlertCircle size={16} color="currentColor" />
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="textPrimary">
                    Embeddings index not found
                  </Text>
                  <Text fontSize="2xs" color="textSecondary" mt={0.5}>
                    Run this command in your terminal to generate <code>embeddings.json</code>:
                  </Text>
                  <Box
                    as="pre"
                    fontSize="2xs"
                    p={1.5}
                    mt={1}
                    bg="surfaceHover"
                    borderRadius="md"
                    overflowX="auto"
                  >
                    OPENAI_API_KEY=your_key node scripts/generateEmbeddings.mjs
                  </Box>
                </Box>
              </Flex>
            </Box>
          )}
        </DrawerHeader>

        <DrawerBody pt={1} pb={6}>
          {/* Query Input */}
          <Box mb={4}>
            <InputGroup size="md">
              <Input
                placeholder="Ask about themes, plots, topics, or feelings..."
                borderRadius="xl"
                bg="surface"
                color="textPrimary"
                borderColor="borderPrimary"
                _hover={{ borderColor: 'accentPrimary' }}
                _focus={{ borderColor: 'accentPrimary', boxShadow: '0 0 0 1px var(--chakra-colors-accentPrimary)' }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              <InputRightElement w="auto" pr={1.5}>
                <Button
                  size="sm"
                  h="32px"
                  borderRadius="lg"
                  bg="accentGreen"
                  color="white"
                  _hover={{ bg: 'accentGreenHover' }}
                  isLoading={isLoading}
                  onClick={() => handleSearch()}
                >
                  <Search size={15} />
                </Button>
              </InputRightElement>
            </InputGroup>
          </Box>

          {/* Prompt Suggestions */}
          {results.length === 0 && !isLoading && (
            <Box mb={6}>
              <Text fontSize="xs" fontWeight="bold" color="textSecondary" textTransform="uppercase" letterSpacing="wider" mb={2}>
                Try Asking
              </Text>
              <Flex direction="column" gap={1.5}>
                {SUGGESTIONS.map((item) => (
                  <Button
                    key={item}
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    textAlign="left"
                    whiteSpace="normal"
                    h="auto"
                    py={2}
                    px={3}
                    borderRadius="lg"
                    bg="surfaceHover"
                    _hover={{ bg: 'surface', transform: 'translateX(2px)' }}
                    transition="all 0.2s"
                    rightIcon={<ArrowRight size={14} />}
                    onClick={() => {
                      setQuery(item);
                      handleSearch(item);
                    }}
                  >
                    <Text fontSize="xs" color="textPrimary" noOfLines={1} flex="1">
                      {item}
                    </Text>
                  </Button>
                ))}
              </Flex>
            </Box>
          )}

          {/* Loading state */}
          {isLoading && (
            <VStack py={10} spacing={3}>
              <Spinner size="lg" color="#2d6a4f" thickness="3px" speed="0.75s" />
              <Text fontSize="sm" fontWeight="medium" color="textPrimary">
                Finding closest semantic matches...
              </Text>
              <Text fontSize="xs" color="textSecondary">
                Comparing query vector across 1,000+ books
              </Text>
            </VStack>
          )}

          {/* Results list */}
          {!isLoading && results.length > 0 && (
            <VStack spacing={3} align="stretch">
              <Flex justify="space-between" align="center" px={1}>
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="textSecondary">
                  All Matching Results ({results.length})
                </Text>
              </Flex>

              <AnimatePresence>
                {results.map(({ book }, index) => {
                  const catStyle = getCategoryStyles(book.category);

                  return (
                    <MotionBox
                      key={book.id || book.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.25) }}
                      p={3}
                      bg="surface"
                      borderWidth="1px"
                      borderColor="borderPrimary"
                      borderRadius="xl"
                      cursor="pointer"
                      _hover={{
                        borderColor: 'accentPrimary',
                        transform: 'translateY(-2px)',
                        shadow: 'md',
                      }}
                      onClick={() => onSelectBook(book)}
                    >
                      <Flex gap={3} align="flex-start">
                        {/* Book thumbnail */}
                        <Box
                          w={{ base: '54px', sm: '64px' }}
                          h={{ base: '76px', sm: '90px' }}
                          flexShrink={0}
                          borderRadius="md"
                          overflow="hidden"
                          bg="surfaceHover"
                          borderWidth="1px"
                          borderColor="borderPrimary"
                        >
                          {book.coverUrl ? (
                            <Image
                              src={book.coverUrl}
                              alt={book.title}
                              w="full"
                              h="full"
                              objectFit="cover"
                            />
                          ) : (
                            <Box w="full" h="full" display="grid" placeItems="center" color="textSecondary">
                              <BookOpen size={20} />
                            </Box>
                          )}
                        </Box>

                        {/* Metadata */}
                        <Box flex="1" minW={0}>
                          <Heading
                            size="xs"
                            color="textPrimary"
                            fontFamily="heading"
                            noOfLines={1}
                            title={book.title}
                            mb={0.5}
                          >
                            {book.title}
                          </Heading>

                          <Text fontSize="2xs" fontStyle="italic" color="textSecondary" noOfLines={1} mb={1}>
                            by {book.author}
                          </Text>

                          <Badge
                            colorScheme={catStyle.colorScheme}
                            variant="subtle"
                            fontSize="2xs"
                            px={1.5}
                            py={0}
                            borderRadius="full"
                            mb={1.5}
                          >
                            {catStyle.icon} {book.category}
                          </Badge>

                          <Text fontSize="xs" color="textSecondary" noOfLines={3} lineHeight="tall">
                            {book.summary}
                          </Text>
                        </Box>
                      </Flex>
                    </MotionBox>
                  );
                })}
              </AnimatePresence>
            </VStack>
          )}

          {/* Empty state after search */}
          {!isLoading && results.length === 0 && query && (
            <VStack py={8} spacing={2} textAlign="center">
              <HelpCircle size={28} color="var(--chakra-colors-textSecondary)" />
              <Text fontSize="sm" fontWeight="medium" color="textPrimary">
                No matches found
              </Text>
              <Text fontSize="xs" color="textSecondary">
                Try asking with different keywords or describing a topic.
              </Text>
            </VStack>
          )}
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px" borderColor="borderPrimary" py={3}>
          <Button variant="ghost" size="sm" mr="auto" color="textSecondary" onClick={onClose}>
            Close
          </Button>
          {results.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              borderColor="borderPrimary"
              onClick={() => {
                setResults([]);
                setQuery('');
              }}
            >
              Clear Results
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
