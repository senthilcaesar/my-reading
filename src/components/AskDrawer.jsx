import { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from 'react';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerCloseButton,
  Box,
  Flex,
  Heading,
  Text,
  Input,
  IconButton,
  Button,
  Image,
  HStack,
  SimpleGrid,
  Skeleton,
  useToast,
} from '@chakra-ui/react';
import { BookOpen, AlertCircle, Sparkles, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import RaisingHandIcon from './RaisingHandIcon';
import { getCategoryStyles } from '../utils/categoryStyles';
import { ASK_SUGGESTIONS } from '../data/askSuggestions';
import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
  buildKeywordIndex,
  decodeEmbeddingIndex,
  hybridSearch,
} from '../utils/askSearch';
import { createAskClient } from '../utils/askApi';

// Public URL of the Cloudflare Worker (proxy/) that holds the site's OpenAI key.
const ASK_PROXY_URL = import.meta.env.VITE_ASK_PROXY_URL || '';

const MotionBox = motion(Box);
// Broad topics can match dozens of books; show this many before "Show more".
const INITIAL_VISIBLE = 15;

// Chakra's default drawer entrance is a soft spring that keeps easing for most of a
// second; a short ease-out feels immediate. Reduced motion: no slide at all.
// Focus moves into the input once the slide ends: focusing forces a layout of the
// whole (1,000+ card) page, which would otherwise stall the first frame of the slide.
const QUESTION_INPUT_ID = 'ask-library-question';

function slideMotion(reduceMotion) {
  return {
    onAnimationComplete: (definition) => {
      if (definition === 'enter') document.getElementById(QUESTION_INPUT_ID)?.focus({ preventScroll: true });
    },
    variants: {
      enter: { x: 0, y: 0, transition: { duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] } },
      exit: { x: '100%', y: 0, transition: { duration: reduceMotion ? 0 : 0.18, ease: [0.4, 0, 1, 1] } },
    },
  };
}

// Find the book a **bold** title in the librarian's answer refers to, preferring
// the current results ("Sapiens" also matches "Sapiens: A Brief History...").
function findBookByTitle(name, results, books) {
  const n = name.toLowerCase().replace(/[“”"]/g, '').trim();
  const pools = [results.map((r) => r.book), books];
  for (const pool of pools) {
    const exact = pool.find((b) => b.title.toLowerCase() === n);
    if (exact) return exact;
    const prefix = pool.find((b) => b.title.toLowerCase().startsWith(`${n}:`));
    if (prefix) return prefix;
  }
  return null;
}

function LibrarianText({ text, resolveBook, onSelectBook }) {
  const paragraphs = text.split('\n\n').filter(Boolean);
  return paragraphs.map((para, pIdx) => (
    <Text key={pIdx} mb={pIdx < paragraphs.length - 1 ? 4 : 0}>
      {para.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
        if (!(part.startsWith('**') && part.endsWith('**'))) return part;
        const title = part.slice(2, -2);
        const book = resolveBook(title);
        if (!book) {
          return (
            <Text as="span" key={idx} fontWeight="600">
              {title}
            </Text>
          );
        }
        return (
          <Box
            as="button"
            type="button"
            key={idx}
            display="inline"
            fontWeight="600"
            textAlign="left"
            textDecoration="underline"
            textDecorationColor="accentMagenta"
            textDecorationThickness="1.5px"
            textUnderlineOffset="3px"
            _hover={{ color: 'accentMagenta' }}
            _focusVisible={{ outline: '2px solid', outlineColor: 'accentMagenta', outlineOffset: '2px' }}
            onClick={() => onSelectBook(book)}
          >
            {title}
          </Box>
        );
      })}
    </Text>
  ));
}

function BookCover({ book }) {
  return (
    <Box
      w="52px"
      h="78px"
      flexShrink={0}
      borderRadius="sm"
      overflow="hidden"
      bg="surfaceHover"
      boxShadow="0 1px 2px rgba(0,0,0,0.25)"
    >
      {book.coverUrl ? (
        <Image src={book.coverUrl} alt="" loading="lazy" w="full" h="full" objectFit="cover" />
      ) : (
        <Flex w="full" h="full" align="center" justify="center" color="textSecondary">
          <BookOpen size={18} />
        </Flex>
      )}
    </Box>
  );
}

function ResultRow({ book, onSelect }) {
  const catStyle = getCategoryStyles(book.category);
  return (
    <Box as="li" borderTopWidth="1px" borderColor="borderPrimary">
      <Flex
        as="button"
        type="button"
        w="full"
        gap={4}
        py={4}
        px={3}
        mx={-3}
        textAlign="left"
        borderRadius="md"
        transition="background-color 0.15s"
        _hover={{ bg: 'surface' }}
        _focusVisible={{ outline: '2px solid', outlineColor: 'accentMagenta', outlineOffset: '-2px' }}
        onClick={() => onSelect(book)}
      >
        <BookCover book={book} />
        <Box flex="1" minW={0}>
          <Heading as="h3" fontSize="md" fontWeight="600" lineHeight="1.3" color="textPrimary" noOfLines={2}>
            {book.title}
          </Heading>
          <Text fontSize="sm" fontStyle="italic" color="textSecondary" noOfLines={1} mt={0.5}>
            {book.author}
            <Text as="span" fontStyle="normal" fontFamily="heading" fontSize="xs" ml={2}>
              {catStyle.icon} {book.category}
            </Text>
          </Text>
          <Text fontSize="sm" color="textSecondary" lineHeight="1.6" noOfLines={2} mt={1.5}>
            {book.summary}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

function SearchingSkeleton() {
  return (
    <Box aria-busy="true">
      <Text fontSize="sm" fontStyle="italic" color="textSecondary" mb={4}>
        Searching the shelves…
      </Text>
      {[0, 1, 2].map((i) => (
        <Flex key={i} gap={4} py={4} borderTopWidth="1px" borderColor="borderPrimary">
          <Skeleton w="52px" h="78px" borderRadius="sm" startColor="surface" endColor="surfaceHover" />
          <Box flex="1" pt={1}>
            <Skeleton h="14px" w="65%" mb={2.5} startColor="surface" endColor="surfaceHover" />
            <Skeleton h="12px" w="40%" mb={3} startColor="surface" endColor="surfaceHover" />
            <Skeleton h="12px" w="95%" mb={2} startColor="surface" endColor="surfaceHover" />
            <Skeleton h="12px" w="80%" startColor="surface" endColor="surfaceHover" />
          </Box>
        </Flex>
      ))}
    </Box>
  );
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

export default function AskDrawer({ isOpen, onClose, books, onSelectBook, request }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [embeddingIndex, setEmbeddingIndex] = useState(null);
  const [weakMatch, setWeakMatch] = useState(false);
  const [embeddingsError, setEmbeddingsError] = useState(false);
  const [librarianText, setLibrarianText] = useState('');
  const [isLibrarianStreaming, setIsLibrarianStreaming] = useState(false);
  const [askedQuestion, setAskedQuestion] = useState('');
  const [showAllResults, setShowAllResults] = useState(false);
  // A question handed over from the main page ("Ask the Library about …"): shown in
  // the box at once, searched as soon as the index has loaded.
  const [prevRequest, setPrevRequest] = useState(request);
  if (request !== prevRequest) {
    setPrevRequest(request);
    if (request) setQuery(request.question);
  }
  const handledRequestRef = useRef(null);
  const resultListRef = useRef(null);
  const abortControllerRef = useRef(null);
  // Bumped by every new search and by Clear, so a search still in flight can't
  // bring back results the reader already cleared.
  const searchIdRef = useRef(0);
  const inputRef = useRef(null);
  const reduceMotion = useReducedMotion();
  // The proxy is used once configured; until then the key baked in at build time
  // (see vite.config.js) — which is public — calls OpenAI directly.
  const askClient = useMemo(
    () =>
      createAskClient({
        apiKey: ASK_PROXY_URL ? '' : (import.meta.env.VITE_OPENAI_API_KEY || '').trim(),
        proxyUrl: ASK_PROXY_URL,
      }),
    [],
  );
  const toast = useToast();

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

  // Built once the drawer has been opened (the embedding index loads on open), so
  // visitors who never use Ask don't pay for it during page load.
  const keywordIndex = useMemo(() => (embeddingIndex ? buildKeywordIndex(books) : null), [books, embeddingIndex]);

  const getQueryVector = useCallback(
    async (q) => {
      const cached = embeddingIndex.suggestionVectors.get(q) || queryVectorCache.get(q);
      if (cached) return cached;

      const vector = normalizeVector(await askClient.embed(q));
      queryVectorCache.set(q, vector);
      return vector;
    },
    [embeddingIndex, askClient],
  );

  const handleSearch = useCallback(
    async (searchPrompt) => {
      const q = (searchPrompt ?? query).trim();
      if (!q) return;

      if (!askClient.available) {
        toast({
          title: 'Ask the Library isn’t available',
          description: 'AI search is not configured for this site.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      if (!embeddingIndex) {
        toast({
          title: 'The search index isn’t loaded yet',
          description: 'Wait a moment and try again. If it keeps happening, rebuild it with npm run generate:embeddings.',
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
      const searchId = ++searchIdRef.current;
      setAskedQuestion(q);
      setShowAllResults(false);

      setIsLoading(true);
      try {
        // 1. Embed the query (cached for suggestions and repeat questions)
        const queryVector = await getQueryVector(q);
        if (searchId !== searchIdRef.current) return;

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
          const controller = new AbortController();
          abortControllerRef.current = controller;
          setIsLibrarianStreaming(true);

          try {
            const chatRes = await askClient.librarian({
              question: q,
              books: finalResults
                .slice(0, 8)
                .map(({ book }) => ({ title: book.title, author: book.author, category: book.category, summary: book.summary })),
              weak,
              signal: controller.signal,
            });

            if (chatRes.body) {
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
        if (searchId !== searchIdRef.current) return;
        toast({
          title: 'The search didn’t go through',
          description: err.message || 'Check your connection and try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    },
    [query, askClient, embeddingIndex, getQueryVector, books, keywordIndex, toast],
  );

  useEffect(() => {
    if (!request || handledRequestRef.current === request.id || !isOpen || !embeddingIndex) return;
    handledRequestRef.current = request.id;
    handleSearch(request.question);
  }, [request, isOpen, embeddingIndex, handleSearch]);

  const resetSearch = useCallback(() => {
    searchIdRef.current += 1;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setIsLoading(false);
    setLibrarianText('');
    setIsLibrarianStreaming(false);
    setResults([]);
    setWeakMatch(false);
    setAskedQuestion('');
    setQuery('');
    inputRef.current?.focus();
  }, []);

  // "Show more" disappears once clicked; if focus were left to the drawer's focus
  // trap it would jump to the first book and scroll back to the top. Hand focus to
  // the first newly revealed book instead, without scrolling.
  useLayoutEffect(() => {
    if (!showAllResults) return;
    const rows = resultListRef.current?.querySelectorAll(':scope > li > button');
    rows?.[INITIAL_VISIBLE]?.focus({ preventScroll: true });
  }, [showAllResults]);

  const resolveBook = useCallback((title) => findBookByTitle(title, results, books), [results, books]);

  const hasAsked = Boolean(askedQuestion);
  const showAnswer = !isLoading && (librarianText || isLibrarianStreaming);
  const motionDuration = reduceMotion ? 0 : 0.2;

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} placement="right" autoFocus={false}>
      <DrawerOverlay bg="blackAlpha.500" />
      <DrawerContent
        bg="bg"
        borderLeftWidth={{ base: 0, md: '1px' }}
        borderColor="borderPrimary"
        w={{ base: '100vw', md: '560px' }}
        maxW={{ base: '100vw', md: '560px' }}
        motionProps={slideMotion(reduceMotion)}
      >
        <DrawerCloseButton top={5} right={4} color="textSecondary" borderRadius="full" />

        <Box as="header" px={{ base: 4, md: 7 }} pt={6} pb={5} borderBottomWidth="1px" borderColor="borderPrimary">
          <HStack spacing={2.5} mb={1} pr={10}>
            <Box color="accentMagenta">
              <RaisingHandIcon size={22} />
            </Box>
            <Heading as="h2" fontSize="xl" fontWeight="600" color="textPrimary">
              Ask the Library
            </Heading>
          </HStack>
          <Text fontSize="sm" fontStyle="italic" color="textSecondary" mb={4}>
            Describe a topic, a question or an idea, and the library will find books for it.
          </Text>

          <Flex
            as="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            align="center"
            gap={2}
            bg="surface"
            borderWidth="1px"
            borderColor="borderPrimary"
            borderRadius="xl"
            pl={4}
            pr={1.5}
            py={1.5}
            transition="border-color 0.15s, box-shadow 0.15s"
            _focusWithin={{ borderColor: 'accentMagenta', boxShadow: '0 0 0 1px var(--chakra-colors-accentMagenta)' }}
          >
            <Input
              ref={inputRef}
              id={QUESTION_INPUT_ID}
              variant="unstyled"
              aria-label="Your question"
              placeholder="What would you like to read about?"
              fontSize={{ base: 'md', md: 'lg' }}
              color="textPrimary"
              _placeholder={{ color: 'textSecondary' }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {(query || hasAsked) && (
              <IconButton
                type="button"
                aria-label="Clear question and results"
                title="Clear question and results"
                icon={<X size={18} />}
                size="sm"
                variant="ghost"
                borderRadius="full"
                color="textSecondary"
                flexShrink={0}
                _hover={{ bg: 'surfaceHover', color: 'textPrimary' }}
                onClick={resetSearch}
              />
            )}
            <Button
              type="submit"
              flexShrink={0}
              h="40px"
              px={5}
              borderRadius="lg"
              bg="accentGreen"
              color="white"
              fontFamily="heading"
              fontSize="sm"
              fontWeight="600"
              _hover={{ bg: 'accentGreenHover' }}
              _active={{ bg: 'accentGreenHover' }}
              isLoading={isLoading}
              isDisabled={!query.trim()}
            >
              Ask
            </Button>
          </Flex>
        </Box>

        <DrawerBody px={{ base: 4, md: 7 }} pt={6} pb={10}>
          {embeddingsError && (
            <Flex gap={3} p={4} mb={6} bg="surface" borderRadius="lg" color="textPrimary">
              <Box color="accentPrimary" pt={0.5}>
                <AlertCircle size={18} />
              </Box>
              <Box>
                <Text fontFamily="heading" fontSize="sm" fontWeight="600">
                  The search index didn’t load
                </Text>
                <Text fontSize="sm" color="textSecondary" mt={1}>
                  Rebuild it with <code>npm run generate:embeddings</code>, then reload the page.
                </Text>
              </Box>
            </Flex>
          )}

          {!hasAsked && !isLoading && (
            <Box>
              <Heading as="h3" fontSize="sm" fontWeight="600" color="textPrimary" mb={3}>
                Not sure where to start?
              </Heading>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacingX={2} spacingY={0.5} mx={-3}>
                {ASK_SUGGESTIONS.map(({ label, question }) => (
                  <Box
                    as="button"
                    type="button"
                    key={label}
                    textAlign="left"
                    fontSize="md"
                    color="textPrimary"
                    px={3}
                    py={2.5}
                    borderRadius="md"
                    transition="background-color 0.15s, color 0.15s"
                    _hover={{ bg: 'surface', color: 'accentMagenta' }}
                    _focusVisible={{ outline: '2px solid', outlineColor: 'accentMagenta', outlineOffset: '-2px' }}
                    onClick={() => {
                      setQuery(question);
                      handleSearch(question);
                    }}
                  >
                    {label}
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {isLoading && <SearchingSkeleton />}

          {showAnswer && (
            <MotionBox
              as="section"
              aria-live="polite"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: motionDuration }}
              mb={8}
              px={5}
              py={4}
              bg="surface"
              borderRadius="lg"
            >
              <HStack spacing={1.5} mb={2.5} color="textSecondary">
                <Sparkles size={14} />
                <Text fontFamily="heading" fontSize="xs" fontWeight="600">
                  From the librarian
                </Text>
                {isLibrarianStreaming && (
                  <Text fontSize="xs" fontStyle="italic">
                    writing…
                  </Text>
                )}
              </HStack>
              <Box fontSize="md" lineHeight="1.75" color="textPrimary">
                <LibrarianText text={librarianText} resolveBook={resolveBook} onSelectBook={onSelectBook} />
              </Box>
            </MotionBox>
          )}

          {!isLoading && hasAsked && results.length > 0 && (
            <MotionBox
              key={askedQuestion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: motionDuration }}
            >
              <Heading as="h3" fontSize="sm" fontWeight="600" color="textPrimary" mb={weakMatch ? 1 : 3}>
                {weakMatch ? 'Nearest books' : `${results.length} ${results.length === 1 ? 'book' : 'books'}`}
              </Heading>
              {weakMatch && (
                <Text fontSize="sm" fontStyle="italic" color="textSecondary" mb={3}>
                  Nothing in the library closely matches this question.
                </Text>
              )}
              <Box as="ul" ref={resultListRef} listStyleType="none" borderBottomWidth="1px" borderColor="borderPrimary">
                {(showAllResults ? results : results.slice(0, INITIAL_VISIBLE)).map(({ book }) => (
                  <ResultRow key={book.id} book={book} onSelect={onSelectBook} />
                ))}
              </Box>
              {!showAllResults && results.length > INITIAL_VISIBLE && (
                <Button
                  mt={4}
                  w="full"
                  variant="outline"
                  borderColor="borderPrimary"
                  color="textPrimary"
                  fontFamily="heading"
                  fontSize="sm"
                  fontWeight="600"
                  _hover={{ bg: 'surface' }}
                  onClick={() => setShowAllResults(true)}
                >
                  Show {results.length - INITIAL_VISIBLE} more {results.length - INITIAL_VISIBLE === 1 ? 'book' : 'books'}
                </Button>
              )}
            </MotionBox>
          )}

          {!isLoading && hasAsked && results.length === 0 && (
            <Box py={6}>
              <Text fontFamily="heading" fontSize="sm" fontWeight="600" color="textPrimary">
                No books matched
              </Text>
              <Text fontSize="sm" color="textSecondary" mt={1}>
                Try describing the topic in other words, or pick a starting point.
              </Text>
              <Button variant="link" size="sm" fontFamily="heading" color="accentMagenta" mt={3} onClick={resetSearch}>
                Show starting points
              </Button>
            </Box>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
