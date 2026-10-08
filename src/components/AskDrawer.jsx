import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  IconButton,
  useToast,
} from '@chakra-ui/react';
import {
  Search,
  ExternalLink,
  BookOpen,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import RaisingHandIcon from './RaisingHandIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryStyles } from '../utils/categoryStyles';
import { ASK_SUGGESTIONS } from '../data/askSuggestions';
import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
  buildKeywordIndex,
  decodeEmbeddingIndex,
  hybridSearch,
} from '../utils/askSearch';

const MotionBox = motion(Box);

function renderFormattedLibrarianText(text) {
  if (!text) return null;
  const paragraphs = text.split('\n\n').filter(Boolean);
  return paragraphs.map((para, pIdx) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Text
        key={pIdx}
        fontSize="sm"
        lineHeight="tall"
        color="textPrimary"
        mb={pIdx < paragraphs.length - 1 ? 2.5 : 0}
      >
        {parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text as="span" key={idx} fontWeight="bold" color="textPrimary">
                {part.slice(2, -2)}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  });
}

// Query embeddings already fetched this session (repeat questions skip the API call).
const queryVectorCache = new Map();

function normalizeVector(vector) {
  const out = Float32Array.from(vector);
  let norm = 0;
  for (const v of out) norm += v * v;
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < out.length; i++) out[i] /= norm;
  return out;
}

export default function AskDrawer({ isOpen, onClose, books, onSelectBook }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [embeddingIndex, setEmbeddingIndex] = useState(null);
  const [weakMatch, setWeakMatch] = useState(false);
  const [embeddingsError, setEmbeddingsError] = useState(false);
  const [librarianText, setLibrarianText] = useState('');
  const [isLibrarianStreaming, setIsLibrarianStreaming] = useState(false);
  const abortControllerRef = useRef(null);
  const [userApiKey, setUserApiKey] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('openai_api_key') || '';
  });
  const [keyInput, setKeyInput] = useState('');
  const [showKeySettings, setShowKeySettings] = useState(false);

  const activeApiKey = useMemo(() => {
    if (userApiKey && userApiKey.trim()) return userApiKey.trim();
    // A key from .env is only honoured in `npm run dev`; production builds must never
    // contain one, so the deployed site always uses the visitor's own key.
    const envKey = import.meta.env.DEV ? import.meta.env.VITE_OPENAI_API_KEY || '' : '';
    return envKey.trim();
  }, [userApiKey]);
  const toast = useToast();

  const handleSaveApiKey = useCallback(
    (customKey) => {
      const k = (customKey ?? keyInput).trim();
      if (!k) return;
      localStorage.setItem('openai_api_key', k);
      setUserApiKey(k);
      setKeyInput('');
      setShowKeySettings(false);
      toast({
        title: 'API Key Saved',
        description: 'Saved to your browser storage. You can now use AI search.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    [keyInput, toast],
  );

  const handleClearApiKey = useCallback(() => {
    localStorage.removeItem('openai_api_key');
    setUserApiKey('');
    toast({
      title: 'Custom API Key Cleared',
      status: 'info',
      duration: 2500,
      isClosable: true,
    });
  }, [toast]);

  // Abort streaming on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleClose = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLibrarianStreaming(false);
    onClose();
  }, [onClose]);

  // Fetch the int8 embedding index once when the drawer opens
  useEffect(() => {
    if (!isOpen || embeddingIndex) return;

    let isCancelled = false;
    async function loadEmbeddings() {
      try {
        const base = import.meta.env.BASE_URL || '/';
        const cleanBase = base.endsWith('/') ? base : `${base}/`;
        const [metaRes, binRes] = await Promise.all([
          fetch(`${cleanBase}embeddings.meta.json`),
          fetch(`${cleanBase}embeddings.bin`),
        ]);
        if (!metaRes.ok || !binRes.ok) {
          throw new Error('Embeddings index not found');
        }
        const [meta, buffer] = await Promise.all([metaRes.json(), binRes.arrayBuffer()]);
        if (meta.model !== EMBEDDING_MODEL || meta.dimensions !== EMBEDDING_DIMENSIONS) {
          throw new Error('Embeddings index was built with a different model');
        }
        const index = decodeEmbeddingIndex(meta, buffer);
        if (!isCancelled) {
          setEmbeddingIndex({ ...index, rowByTitle: new Map(index.titles.map((t, r) => [t, r])) });
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
  }, [isOpen, embeddingIndex]);

  const keywordIndex = useMemo(() => buildKeywordIndex(books), [books]);

  const getQueryVector = useCallback(
    async (q) => {
      const cached = embeddingIndex.suggestionVectors.get(q) || queryVectorCache.get(q);
      if (cached) return cached;

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeApiKey}`,
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          dimensions: EMBEDDING_DIMENSIONS,
          input: q,
        }),
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(`OpenAI error (${response.status}): ${errData}`);
      }

      const data = await response.json();
      const embedding = data.data?.[0]?.embedding;
      if (!embedding) throw new Error('No embedding returned from OpenAI');
      const vector = normalizeVector(embedding);
      queryVectorCache.set(q, vector);
      return vector;
    },
    [embeddingIndex, activeApiKey],
  );

  const handleSearch = useCallback(
    async (searchPrompt) => {
      const q = (searchPrompt ?? query).trim();
      if (!q) return;

      if (!activeApiKey) {
        setShowKeySettings(true);
        toast({
          title: 'OpenAI API Key Required',
          description: 'Please enter your OpenAI API key below to enable AI search.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      if (!embeddingIndex) {
        toast({
          title: 'Embeddings Index Missing',
          description: 'Run "OPENAI_API_KEY=... node scripts/generateEmbeddings.mjs" to build the embeddings index.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Abort any previous AI stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setLibrarianText('');
      setIsLibrarianStreaming(false);

      setIsLoading(true);
      try {
        // 1. Embed the query (cached for suggestions and repeat questions)
        const queryVector = await getQueryVector(q);

        // 2. Hybrid retrieval: semantic + BM25 keyword ranking, fused
        const { results: finalResults, weak } = hybridSearch({
          books,
          keywordIndex,
          embeddingIndex,
          rowByTitle: embeddingIndex.rowByTitle,
          query: q,
          queryVector,
        });

        setResults(finalResults);
        setWeakMatch(weak);
        setIsLoading(false);

        // 4. Full RAG: Synthesize AI Librarian explanation using gpt-4o-mini
        if (finalResults.length > 0) {
          const topBooks = finalResults.slice(0, 8);
          const bookContext = topBooks
            .map(
              (item, i) =>
                `${i + 1}. "${item.book.title}" by ${item.book.author} (${item.book.category}): ${item.book.summary}`,
            )
            .join('\n\n');

          const controller = new AbortController();
          abortControllerRef.current = controller;
          setIsLibrarianStreaming(true);

          try {
            const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${activeApiKey}`,
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  {
                    role: 'system',
                    content:
                      'You are an erudite, warm, and insightful librarian for the library. ' +
                      'The user has asked a question or shared a reading interest. ' +
                      'Based on the retrieved books from the library, provide an engaging, well-crafted 1-2 paragraph synthesis explaining how these books address their inquiry. ' +
                      'Always refer to the books as being from "the library" (never say "your collection", "your library", or "your books"). ' +
                      'Mention the most relevant book titles in bold (**Book Title**). ' +
                      'Be articulate, insightful, and welcoming. Do not invent books not present in the provided list.' +
                      (weak
                        ? ' These books are only loosely related to the question: say plainly that the library has little directly on this topic, then mention any that are still worth a look.'
                        : ''),
                  },
                  {
                    role: 'user',
                    content: `User Question: "${q}"\n\nRetrieved Books from the Library:\n${bookContext}`,
                  },
                ],
                stream: true,
                temperature: 0.3,
              }),
              signal: controller.signal,
            });

            if (chatRes.ok && chatRes.body) {
              const reader = chatRes.body.getReader();
              const decoder = new TextDecoder('utf-8');
              let buffer = '';
              let accumulated = '';

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed || !trimmed.startsWith('data: ')) continue;
                  const dataStr = trimmed.slice(6);
                  if (dataStr === '[DONE]') break;

                  try {
                    const parsed = JSON.parse(dataStr);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    if (delta) {
                      accumulated += delta;
                      setLibrarianText(accumulated);
                    }
                  } catch {
                    // Ignore partial json parse errors
                  }
                }
              }
            }
          } catch (chatErr) {
            if (chatErr.name !== 'AbortError') {
              console.warn('Librarian synthesis stream error:', chatErr);
            }
          } finally {
            setIsLibrarianStreaming(false);
          }
        }
      } catch (err) {
        toast({
          title: 'Search Failed',
          description: err.message || 'Could not compute embeddings.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    },
    [query, activeApiKey, embeddingIndex, getQueryVector, books, keywordIndex, toast],
  );

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} placement="right">
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
            <IconButton
              aria-label="API Key Settings"
              icon={<KeyRound size={16} />}
              size="sm"
              variant="ghost"
              color={activeApiKey ? 'accentGreen' : 'accentPrimary'}
              title={
                activeApiKey
                  ? userApiKey
                    ? 'Custom API key active (click to manage)'
                    : 'Pre-configured API key active (click to override)'
                  : 'Enter API key'
              }
              onClick={() => setShowKeySettings((prev) => !prev)}
            />
          </Flex>

          {/* Missing API key or Key Settings Panel */}
          {(!activeApiKey || showKeySettings) && (
            <Box
              mt={3}
              p={3}
              bg="surface"
              borderWidth="1px"
              borderColor={!activeApiKey ? 'accentPrimary' : 'borderPrimary'}
              borderRadius="xl"
            >
              <Flex gap={2} align="center" mb={1.5}>
                <KeyRound size={15} />
                <Text fontSize="xs" fontWeight="bold" color="textPrimary">
                  {!activeApiKey ? 'OpenAI API Key Required' : 'OpenAI API Key Settings'}
                </Text>
              </Flex>
              <Text fontSize="2xs" color="textSecondary" mb={2}>
                {!activeApiKey
                  ? 'To use the AI librarian and semantic search, provide your OpenAI API key below (stored safely in local browser storage).'
                  : userApiKey
                  ? 'A custom OpenAI API key is currently saved in this browser.'
                  : 'Using default pre-configured API key. You can override it with your own key below.'}
              </Text>
              <HStack spacing={2}>
                <Input
                  size="sm"
                  type="password"
                  placeholder="sk-..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveApiKey();
                  }}
                  borderRadius="md"
                  bg="surfaceHover"
                  borderColor="borderPrimary"
                  fontSize="xs"
                />
                <Button
                  size="sm"
                  bg="accentGreen"
                  color="white"
                  _hover={{ bg: 'accentGreenHover' }}
                  onClick={() => handleSaveApiKey()}
                  isDisabled={!keyInput.trim()}
                  fontSize="xs"
                >
                  Save
                </Button>
                {userApiKey && (
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={handleClearApiKey}
                    fontSize="xs"
                  >
                    Clear
                  </Button>
                )}
              </HStack>
            </Box>
          )}

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
                    Run this command in your terminal to build the embeddings index:
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
          <Box mb={5}>
            <InputGroup size="lg">
              <Input
                h={{ base: '50px', md: '54px' }}
                fontSize={{ base: 'sm', md: 'md' }}
                pl={4}
                pr="56px"
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
              <InputRightElement h="full" w="auto" pr={2}>
                <Button
                  size="md"
                  h={{ base: '38px', md: '42px' }}
                  px={3.5}
                  borderRadius="lg"
                  bg="accentGreen"
                  color="white"
                  _hover={{ bg: 'accentGreenHover' }}
                  isLoading={isLoading}
                  onClick={() => handleSearch()}
                >
                  <Search size={18} />
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
                {ASK_SUGGESTIONS.map((item) => (
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
                    <Text fontSize="xs" color="textPrimary" noOfLines={{ base: 2, md: 1 }} flex="1">
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

          {/* AI Librarian Synthesis Block (Full RAG) */}
          {!isLoading && (librarianText || isLibrarianStreaming) && (
            <Box
              mb={4}
              p={4}
              bg="surface"
              borderWidth="1px"
              borderColor="borderPrimary"
              borderRadius="xl"
              position="relative"
              boxShadow="sm"
            >
              <Flex align="center" justify="space-between" mb={2.5}>
                <HStack spacing={2}>
                  <Box
                    w={6}
                    h={6}
                    borderRadius="md"
                    bg="accentGreen"
                    color="white"
                    display="grid"
                    placeItems="center"
                  >
                    <Sparkles size={13} />
                  </Box>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    color="textPrimary"
                  >
                    Librarian&apos;s Perspective
                  </Text>
                </HStack>
                {isLibrarianStreaming && (
                  <HStack spacing={1.5}>
                    <Spinner size="xs" color="accentGreen" speed="0.6s" />
                    <Text fontSize="2xs" color="textSecondary" fontStyle="italic">
                      Synthesizing...
                    </Text>
                  </HStack>
                )}
              </Flex>

              <Box>
                {renderFormattedLibrarianText(librarianText)}
                {isLibrarianStreaming && (
                  <Box
                    as="span"
                    display="inline-block"
                    w="2px"
                    h="14px"
                    bg="accentGreen"
                    ml={1}
                    verticalAlign="text-bottom"
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Results list */}
          {!isLoading && results.length > 0 && (
            <VStack spacing={3} align="stretch">
              <Flex justify="space-between" align="center" px={1}>
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="textSecondary">
                  {weakMatch ? 'Closest Results' : 'All Matching Results'} ({results.length})
                </Text>
              </Flex>
              {weakMatch && (
                <Text fontSize="xs" color="textSecondary" px={1}>
                  Nothing in the library closely matches this question. These are the nearest books.
                </Text>
              )}

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
          <Button variant="ghost" size="sm" mr="auto" color="textSecondary" onClick={handleClose}>
            Close
          </Button>
          {(results.length > 0 || librarianText) && (
            <Button
              size="sm"
              variant="outline"
              borderColor="borderPrimary"
              onClick={() => {
                if (abortControllerRef.current) abortControllerRef.current.abort();
                setLibrarianText('');
                setIsLibrarianStreaming(false);
                setResults([]);
                setWeakMatch(false);
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
