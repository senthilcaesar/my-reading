import { memo } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { bookTags } from "../data/bookTags";
import { getCategoryStyles } from "../utils/categoryStyles";

// ── Highlight matching text ────────────────────────────────────────────────────
function HighlightText({ text, query }) {
  if (!query?.trim() || !text) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  const lower = query.toLowerCase();
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lower ? (
          <Box
            as="mark"
            key={i}
            bg="accentPrimary"
            color="bg"
            px="0.5"
            mx="0.5px"
            borderRadius="sm"
            fontWeight="semibold"
            lineHeight="inherit"
          >
            {part}
          </Box>
        ) : (
          part
        ),
      )}
    </>
  );
}

// ── BookCard ──────────────────────────────────────────────────────────────────
const BookCard = memo(function BookCard({ book, searchQuery, onSelect }) {
  const bg = "surface";
  const borderColor = "borderPrimary";
  const categoryStyles = getCategoryStyles(book.category);

  const prefetchCover = () => {
    if (!book.coverUrl || typeof window === "undefined") return;
    const image = new window.Image();
    image.src = book.coverUrl;
  };

  return (
    <Box
      as="button"
      type="button"
      onClick={() => onSelect(book)}
      onMouseEnter={prefetchCover}
      onFocus={prefetchCover}
      textAlign="left"
      w="full"
      cursor="pointer"
      bg={bg}
      backdropFilter="blur(8px)"
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      p={{ base: 4, md: 5 }}
      shadow="md"
      display="flex"
      flexDirection="column"
      gap={{ base: 2, md: 3 }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: { base: "translateY(-3px)", md: "translateY(-8px)" },
        shadow: "xl",
        borderColor: "orange.400",
        textDecoration: "none",
      }}
      position="relative"
      overflow="hidden"
      data-group
      // fill the motion wrapper's height so all cards in a row align
      h="full"
    >
      {/* Top gradient accent on hover */}
      <Box
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="4px"
        bgGradient="linear(to-r, blue.400, orange.400)"
        opacity={0}
        _groupHover={{ opacity: 1 }}
        transition="opacity 0.3s"
      />

      <Flex justify="space-between" align="flex-start" gap={2} flexWrap="wrap">
        <Badge
          colorScheme={categoryStyles.colorScheme}
          variant="subtle"
          px={2.5}
          py={1}
          borderRadius="full"
          display="flex"
          alignItems="center"
          gap={1}
          maxW="full"
          minW={0}
        >
          <Text as="span" flex="0 0 auto">
            {categoryStyles.icon}
          </Text>
          <Text
            as="span"
            fontWeight="bold"
            letterSpacing="wider"
            minW={0}
            noOfLines={1}
          >
            {book.category}
          </Text>
        </Badge>
      </Flex>

      <Box flex="1">
        <Heading
          as="h3"
          size="sm"
          fontFamily="heading"
          mb={1}
          color="textPrimary"
          lineHeight="shorter"
        >
          <HighlightText text={book.title} query={searchQuery} />
        </Heading>
        <Text color="textSecondary" fontSize="sm" fontStyle="italic" mb={2}>
          by <HighlightText text={book.author} query={searchQuery} />
        </Text>

        {/* Tags */}
        {bookTags[book.title] && bookTags[book.title].length > 0 && (
          <Wrap gap={1.5} mb={3}>
            {bookTags[book.title].map((tag) => (
              <WrapItem key={tag}>
                <Badge
                  size="sm"
                  colorScheme="gray"
                  variant="subtle"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="xs"
                  fontWeight="medium"
                  color="textSecondary"
                  bg="surfaceHover"
                  _dark={{ bg: "rgba(255,255,255,0.05)" }}
                >
                  {tag}
                </Badge>
              </WrapItem>
            ))}
          </Wrap>
        )}

        <Text
          color="textSecondary"
          fontSize={{ base: "xs", md: "sm" }}
          lineHeight="tall"
          noOfLines={{ base: 3, md: 4 }}
        >
          <HighlightText text={book.summary} query={searchQuery} />
        </Text>
      </Box>
    </Box>
  );
});

export default BookCard;
